import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Basic connection test with timeout
    const connectionTest = Promise.race([
      supabase.from('profiles').select('count').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    
    const { data: profiles, error: profilesError } = await connectionTest as any;
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
      return { success: false, error: `Profiles table error: ${profilesError.message || profilesError}` };
    }
    
    console.log('✅ Profiles table accessible');
    
    // Test 2: Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Missing environment variables' };
    }
    
    console.log('✅ Environment variables present');
    console.log('✅ Database connection test completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, error: `Database connection failed: ${error.message || error}` };
  }
};

// Function to test profile creation
export const testProfileCreation = async () => {
  try {
    console.log('Testing profile creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No user to test profile creation');
      return { success: false, error: 'No authenticated user' };
    }
    
    // Try to create a test profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        first_name: 'Test',
        last_name: 'User',
        user_type: 'buyer'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Profile created successfully:', profile);
    return { success: true, profile };
    
  } catch (error) {
    console.error('❌ Profile creation test failed:', error);
    return { success: false, error: 'Profile creation failed' };
  }
};
