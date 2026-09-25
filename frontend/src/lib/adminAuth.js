import { supabase } from './supabaseClient';

/**
 * Check if an admin user is currently authenticated with a valid Supabase Auth session
 */
export async function getAdminSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }

    // Fetch the admin profile with verified role from the database
    const { data: profile, error: profError } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profError || !profile || !profile.is_active) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email || session.user.email,
      name: profile.full_name || profile.email || 'Admin',
      role: profile.role || 'staff',
      user: session.user,
      accessToken: session.access_token
    };
  } catch (err) {
    console.error('Error fetching admin session:', err);
    return null;
  }
}

/**
 * Synchronous initial session check (reads stored Supabase session token)
 */
export function isAdminAuthenticated() {
  try {
    // Supabase Auth stores session in localStorage under sb-<project-ref>-auth-token
    const keys = Object.keys(localStorage);
    const hasSupabaseToken = keys.some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    return hasSupabaseToken;
  } catch {
    return false;
  }
}

/**
 * Admin Login Verification via Supabase Auth (Email & Password)
 */
export async function loginAdmin({ email, password, rememberMe = true }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Please enter both email address and password.');
  }

  // 1. Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword
  });

  if (authError || !authData?.user) {
    const msg = authError?.message || 'Invalid email or password.';
    if (msg.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    throw new Error(msg);
  }

  // 2. Fetch the corresponding admin profile and role
  const { data: profile, error: profError } = await supabase
    .from('admin_profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profError || !profile || !profile.is_active) {
    // If authenticated in Auth but not authorized in admin_profiles, immediately sign out
    await supabase.auth.signOut();
    throw new Error('Access Denied: Your account does not have administrator privileges.');
  }

  const sessionData = {
    id: profile.id,
    email: profile.email || authData.user.email,
    name: profile.full_name || profile.email || 'Admin',
    role: profile.role || 'staff',
    user: authData.user
  };

  window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: sessionData }));
  return sessionData;
}

/**
 * Update Admin Password securely via Supabase Auth
 */
export async function updateAdminPassword({ newPassword }) {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword.trim()
  });

  if (error) {
    throw new Error('Failed to update password: ' + error.message);
  }

  return true;
}

/**
 * Fetch list of registered staff and admin accounts (Super Admin only)
 */
export async function fetchStaffUsers() {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(u => ({
      ...u,
      name: u.full_name || u.email,
      username: u.email
    }));
  } catch (err) {
    console.warn('Could not fetch staff accounts from database:', err.message);
    return [];
  }
}

/**
 * Create a new staff account (Super Admin only)
 */
export async function createStaffUser({ email, password, name = '', role = 'staff' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // 1. Create auth user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: cleanPassword,
    options: {
      data: {
        full_name: name || cleanEmail,
        role: role || 'staff'
      }
    }
  });

  if (authError) {
    throw new Error('Failed to create account: ' + authError.message);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    throw new Error('User creation did not return an identifier.');
  }

  // 2. Insert into admin_profiles
  const { data: profileData, error: profileError } = await supabase
    .from('admin_profiles')
    .upsert({
      id: userId,
      email: cleanEmail,
      full_name: name || cleanEmail,
      role: role || 'staff',
      is_active: true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (profileError) {
    console.warn('Profile creation notice:', profileError.message);
  }

  return profileData || { id: userId, email: cleanEmail, full_name: name, role };
}

/**
 * Delete / Deactivate a staff account (Super Admin only)
 */
export async function deleteStaffUser(profileId, email) {
  if (!profileId) throw new Error('Missing profile identifier');

  // Verify not deleting primary super admin
  const { data: targetProfile } = await supabase
    .from('admin_profiles')
    .select('role, email')
    .eq('id', profileId)
    .maybeSingle();

  if (targetProfile?.role === 'super_admin' && targetProfile?.email === 'admin@corporatetechbd.com') {
    throw new Error('Primary Super Admin account cannot be deleted.');
  }

  const { error } = await supabase
    .from('admin_profiles')
    .delete()
    .eq('id', profileId);

  if (error) {
    throw new Error('Failed to remove staff account: ' + error.message);
  }

  return true;
}

/**
 * Sign Out Admin securely via Supabase Auth
 */
export async function logoutAdmin() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out warning:', err);
  }
  window.dispatchEvent(new CustomEvent('ct_admin_auth_changed', { detail: null }));
}
