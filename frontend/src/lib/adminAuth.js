import { supabase } from './supabaseClient';

const ADMIN_SESSION_KEY = 'corporate_tech_admin_session';

/**
 * Check if Admin is currently authenticated
 */
export function isAdminAuthenticated() {
  try {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    return Boolean(parsed && parsed.username && parsed.token);
  } catch {
    return false;
  }
}

/**
 * Get current Admin session data
 */
export function getAdminSession() {
  try {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
}

/**
 * Admin Login Verification (via Supabase admin_users or default fallback)
 */
export async function loginAdmin({ username, pinOrPassword, rememberMe = true }) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPin = (pinOrPassword || '').trim();

  if (!cleanUser || !cleanPin) {
    throw new Error('দয়া করে ইউজারনেম এবং পাসওয়ার্ড/পিন দিন');
  }

  // 1. Try checking against Supabase admin_users table
  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .ilike('username', cleanUser)
      .maybeSingle();

    if (!error && adminUser) {
      if (adminUser.pin_or_password === cleanPin) {
        const sessionData = {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role || 'super_admin',
          token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          loginAt: new Date().toISOString()
        };

        const targetStorage = rememberMe ? localStorage : sessionStorage;
        targetStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: sessionData }));
        return sessionData;
      } else {
        throw new Error('ভুল পাসওয়ার্ড বা পিন দিয়েছেন!');
      }
    }
  } catch (err) {
    if (err.message.includes('পাসওয়ার্ড বা পিন')) throw err;
    console.warn('Supabase admin_users query notice (using fallback):', err.message);
  }

  // 2. Check local fallback staff users (if offline)
  try {
    const localStaff = JSON.parse(localStorage.getItem('corporate_tech_staff_users') || '[]');
    const matched = localStaff.find((u) => u.username.toLowerCase() === cleanUser);
    if (matched) {
      if (matched.pin_or_password === cleanPin) {
        const sessionData = {
          id: matched.id,
          username: matched.username,
          name: matched.name || matched.username,
          role: matched.role || 'staff',
          token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          loginAt: new Date().toISOString()
        };
        const targetStorage = rememberMe ? localStorage : sessionStorage;
        targetStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: sessionData }));
        return sessionData;
      } else {
        throw new Error('ভুল পাসওয়ার্ড বা পিন দিয়েছেন!');
      }
    }
  } catch (err) {
    if (err.message.includes('পাসওয়ার্ড বা পিন')) throw err;
  }

  // 3. Default Fallback Credentials (Super Admin & Staff)
  if (cleanUser === 'admin' && cleanPin === '123456') {
    const sessionData = {
      id: 'default-superadmin',
      username: 'admin',
      name: 'Super Admin',
      role: 'super_admin',
      token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginAt: new Date().toISOString()
    };

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: sessionData }));
    return sessionData;
  }

  if (cleanUser === 'staff' && cleanPin === '123456') {
    const sessionData = {
      id: 'default-staff',
      username: 'staff',
      name: 'Order Dispatcher',
      role: 'staff',
      token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginAt: new Date().toISOString()
    };

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: sessionData }));
    return sessionData;
  }

  throw new Error('সঠিক ইউজারনেম বা পিন দিন (অ্যাডমিন: admin / 123456 | স্টাফ: staff / 123456)');
}

/**
 * Update Admin PIN / Password
 */
export async function updateAdminPin({ currentPin, newPin }) {
  if (!newPin || newPin.trim().length < 4) {
    throw new Error('নতুন পিন কমপক্ষে ৪ ডিজিটের হতে হবে');
  }

  const session = getAdminSession();
  const username = session?.username || 'admin';

  try {
    const { error } = await supabase
      .from('admin_users')
      .upsert({
        username,
        pin_or_password: newPin.trim(),
        role: session?.role || 'super_admin',
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to update admin PIN in Supabase:', err);
    throw new Error('পিন আপডেট করতে সমস্যা হয়েছে: ' + err.message);
  }
}

/**
 * Staff Management Helpers (Super Admin Only)
 */
export async function fetchStaffUsers() {
  const defaultList = [
    { id: 'usr-1', username: 'admin', name: 'Super Admin', role: 'super_admin', created_at: new Date().toISOString() },
    { id: 'usr-2', username: 'staff', name: 'Order Dispatcher', role: 'staff', created_at: new Date().toISOString() }
  ];

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((u) => ({
        ...u,
        name: u.username === 'admin' ? 'Super Admin' : u.username === 'staff' ? 'Order Dispatcher' : u.username
      }));
    }
  } catch (e) {
    console.warn('Could not fetch staff users from Supabase:', e);
  }

  try {
    const local = JSON.parse(localStorage.getItem('corporate_tech_staff_users') || '[]');
    const existing = new Set(defaultList.map((d) => d.username));
    const merged = [...defaultList, ...local.filter((l) => !existing.has(l.username))];
    return merged;
  } catch {
    return defaultList;
  }
}

export async function createStaffUser({ username, pin, role = 'staff', name = '' }) {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPin = (pin || '').trim();

  if (!cleanUser || cleanUser.length < 3) {
    throw new Error('ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে');
  }
  if (!cleanPin || cleanPin.length < 4) {
    throw new Error('পিন কমপক্ষে ৪ ডিজিটের হতে হবে');
  }

  const payload = {
    username: cleanUser,
    pin_or_password: cleanPin,
    role: role || 'staff',
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([payload])
      .select();

    if (error) throw error;
    if (data && data.length > 0) {
      return { ...data[0], name: name || cleanUser };
    }
  } catch (e) {
    console.warn('Supabase insert notice (saving local fallback):', e.message);
  }

  const newLocalUser = {
    id: `staff_${Date.now()}`,
    username: cleanUser,
    pin_or_password: cleanPin,
    name: name || cleanUser,
    role: role || 'staff',
    created_at: new Date().toISOString()
  };

  try {
    const list = JSON.parse(localStorage.getItem('corporate_tech_staff_users') || '[]');
    list.push(newLocalUser);
    localStorage.setItem('corporate_tech_staff_users', JSON.stringify(list));
  } catch (err) {
    console.warn('Local staff save warning:', err);
  }

  return newLocalUser;
}

export async function deleteStaffUser(id, username) {
  if (username === 'admin') {
    throw new Error('প্রধান সুপার অ্যাডমিন একাউন্ট ডিলিট করা যাবে না');
  }

  try {
    await supabase.from('admin_users').delete().eq('username', username);
  } catch (e) {
    console.warn('Could not delete staff from Supabase:', e);
  }

  try {
    const list = JSON.parse(localStorage.getItem('corporate_tech_staff_users') || '[]');
    const remaining = list.filter((u) => u.username !== username && u.id !== id);
    localStorage.setItem('corporate_tech_staff_users', JSON.stringify(remaining));
  } catch (err) {
    console.warn('Local staff delete warning:', err);
  }
  return true;
}

/**
 * Admin Logout
 */
export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: null }));
}
