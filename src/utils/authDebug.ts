import { supabase } from '../lib/supabase';

export const authDebug = {
  // Check if user exists in auth.users
  async checkAuthUser(userId: string) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Auth user:', user);
      console.log('Auth error:', error);
      return { user, error };
    } catch (error) {
      console.error('Error checking auth user:', error);
      return { user: null, error };
    }
  },

  // Check if profile exists in profiles table
  async checkProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('Profile:', profile);
      console.log('Profile error:', error);
      return { profile, error };
    } catch (error) {
      console.error('Error checking profile:', error);
      return { profile: null, error };
    }
  },

  // Check all users in profiles table
  async listAllProfiles() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('All profiles:', profiles);
      console.log('Profiles error:', error);
      return { profiles, error };
    } catch (error) {
      console.error('Error listing profiles:', error);
      return { profiles: [], error };
    }
  },

  // Create a test profile manually
  async createTestProfile(userId: string, email: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          first_name: 'Test',
          last_name: 'User',
          user_type: 'buyer'
        })
        .select()
        .single();
      
      console.log('Created test profile:', profile);
      console.log('Create error:', error);
      return { profile, error };
    } catch (error) {
      console.error('Error creating test profile:', error);
      return { profile: null, error };
    }
  },

  // Test login with specific credentials
  async testLogin(email: string, password: string) {
    try {
      console.log('Testing login with:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Login result:', data);
      console.log('Login error:', error);
      return { data, error };
    } catch (error) {
      console.error('Error testing login:', error);
      return { data: null, error };
    }
  },

  // Check user confirmation status
  async checkUserStatus(email: string) {
    try {
      // This is a bit tricky since we can't directly query auth.users
      // But we can try to sign in and see what happens
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy_password_to_check_status'
      });
      
      console.log('User status check result:', data);
      console.log('User status check error:', error);
      return { data, error };
    } catch (error) {
      console.error('Error checking user status:', error);
      return { data: null, error };
    }
  },

  // Check if user exists by trying to reset password
  async checkUserExists(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/reset-password'
      });
      
      console.log('Password reset result:', data);
      console.log('Password reset error:', error);
      
      if (error && error.message.includes('User not found')) {
        console.log('User does not exist in database');
        return { exists: false, error };
      } else if (error && error.message.includes('For security purposes')) {
        console.log('User exists but password reset is disabled');
        return { exists: true, error: null };
      } else {
        console.log('User exists and password reset email sent');
        return { exists: true, error: null };
      }
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return { exists: false, error };
    }
  },

  // Reset loading state (emergency function)
  resetLoadingState() {
    console.log('Resetting loading state...');
    // This will be available globally to reset loading if stuck
    if (typeof window !== 'undefined' && (window as any).resetAuthLoading) {
      (window as any).resetAuthLoading();
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}
