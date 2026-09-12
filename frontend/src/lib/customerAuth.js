import { supabase } from './supabaseClient';

/**
 * Standardize Bangladeshi phone numbers (01XXXXXXXXX)
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('880')) {
    digits = digits.slice(2);
  }
  if (!digits.startsWith('0') && digits.length === 10) {
    digits = '0' + digits;
  }
  return digits;
}

const SESSION_KEY = 'ct_customer_session';

/**
 * Get currently logged-in customer session
 */
export function getCurrentCustomer() {
  try {
    // Check localStorage first, then sessionStorage
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save customer session locally and broadcast event
 * @param {Object} customer 
 * @param {boolean} rememberMe - if true saves to localStorage, if false saves to sessionStorage
 */
export function saveCustomerSession(customer, rememberMe = true) {
  try {
    const safeData = {
      id: customer.id,
      phone: customer.phone,
      full_name: customer.full_name || 'সম্মানিত ক্লায়েন্ট',
      address: customer.address || '',
      city: customer.city || 'Dhaka',
      created_at: customer.created_at
    };

    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeData));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeData));
      localStorage.removeItem(SESSION_KEY);
    }

    // Sync legacy profile key for Navbar backward compatibility
    localStorage.setItem('ct_user_profile', JSON.stringify({
      name: safeData.full_name,
      phone: safeData.phone,
      address: safeData.address,
      joined: new Date(safeData.created_at || Date.now()).toLocaleDateString('bn-BD'),
      tier: 'Verified Customer'
    }));

    window.dispatchEvent(new Event('ct_user_updated'));
    return safeData;
  } catch (e) {
    console.error('Failed to save customer session:', e);
    return null;
  }
}

/**
 * Customer Registration (Name + Number + Courier Address)
 * No password needed!
 */
export async function registerCustomer({ phone, full_name, address, city = 'Dhaka', rememberMe = true }) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    throw new Error('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
  }
  if (!full_name || full_name.trim().length < 2) {
    throw new Error('দয়া করে আপনার নাম অথবা প্রতিষ্ঠানের নাম দিন');
  }
  if (!address || address.trim().length < 3) {
    throw new Error('দয়া করে আপনার কুরিয়ার ডেলিভারি ঠিকানা দিন');
  }

  // 1. Check if phone already registered in Supabase
  const { data: existing, error: checkErr } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (existing) {
    // If already exists, update address/name and log them in!
    const { data: updated } = await supabase
      .from('customers')
      .update({
        full_name: full_name.trim(),
        address: address.trim(),
        city: city.trim() || 'Dhaka'
      })
      .eq('id', existing.id)
      .select()
      .single();

    const finalCustomer = updated || existing;
    saveCustomerSession(finalCustomer, rememberMe);
    return finalCustomer;
  }

  // 2. Insert into Supabase customers table
  const newCustomerPayload = {
    phone: cleanPhone,
    full_name: full_name.trim(),
    password_hash: '', // Passwords removed as requested
    address: address.trim(),
    city: city.trim() || 'Dhaka'
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('customers')
    .insert([newCustomerPayload])
    .select()
    .single();

  if (insertErr || !inserted) {
    console.error('Registration DB error:', insertErr);
    throw new Error(insertErr?.message || 'অ্যাকাউন্ট খুলতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
  }

  saveCustomerSession(inserted, rememberMe);
  return inserted;
}

/**
 * Customer Login (Phone Number matching - No password needed)
 * Matches number directly!
 */
export async function loginCustomer({ phone, full_name = '', rememberMe = true }) {
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length !== 11) {
    throw new Error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
  }

  // 1. Fetch customer by phone
  const { data: customer, error: fetchErr } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', cleanPhone)
    .maybeSingle();

  if (fetchErr) {
    console.error('Login query error:', fetchErr);
  }

  if (!customer) {
    // If customer doesn't exist yet, we guide them to register
    throw new Error('এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। পাশে "নতুন অ্যাকাউন্ট" বাটনে ক্লিক করে নাম ও কুরিয়ার ঠিকানা দিন।');
  }

  // 2. If name is provided and changed, update it
  if (full_name && full_name.trim() && full_name.trim() !== customer.full_name) {
    supabase
      .from('customers')
      .update({ full_name: full_name.trim() })
      .eq('id', customer.id)
      .then(() => {});
    customer.full_name = full_name.trim();
  }

  saveCustomerSession(customer, rememberMe);
  return customer;
}

/**
 * Logout
 */
export function logoutCustomer() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('ct_user_profile');
  window.dispatchEvent(new Event('ct_user_updated'));
}

/**
 * Update Customer Profile (Address, Name, City)
 */
export async function updateCustomerProfile({ full_name, address, city }) {
  const current = getCurrentCustomer();
  if (!current?.id) return null;

  const updates = {};
  if (full_name) updates.full_name = full_name.trim();
  if (address !== undefined) updates.address = address.trim();
  if (city !== undefined) updates.city = city.trim();

  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', current.id)
    .select()
    .single();

  if (!error && data) {
    const isRemembered = !!localStorage.getItem(SESSION_KEY);
    saveCustomerSession(data, isRemembered);
    return data;
  }
  return null;
}
