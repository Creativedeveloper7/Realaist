import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  userType: 'buyer' | 'developer' | 'host' | 'admin'
  companyName?: string
  licenseNumber?: string
  address?: string
  website?: string
  instagram?: string
  x?: string
  facebook?: string
  logoUrl?: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'buyer' | 'developer' | 'host' | 'admin'
  phone?: string
  companyName?: string
  licenseNumber?: string
  address?: string
}

export interface SignInData {
  email: string
  password: string
}

// Helper function to check offline mode with timestamp
const isOfflineMode = (): boolean => {
  const offlineMode = localStorage.getItem('offline_mode') === 'true'
  const offlineTimestamp = localStorage.getItem('offline_mode_timestamp')
  
  if (!offlineMode) return false
  
  // Check if offline mode has expired (5 minutes)
  if (offlineTimestamp) {
    const isExpired = (Date.now() - parseInt(offlineTimestamp)) > 300000 // 5 minutes
    if (isExpired) {
      console.log('AuthService: Offline mode expired, clearing offline state')
      localStorage.removeItem('offline_mode')
      localStorage.removeItem('offline_mode_timestamp')
      return false
    }
  }
  
  return true
}

// Mock users for offline mode
const MOCK_USERS: AuthUser[] = [
  {
    id: 'mock-user-1',
    email: 'developer@realaist.com',
    firstName: 'John',
    lastName: 'Developer',
    userType: 'developer',
    companyName: 'Realaist Developers',
    licenseNumber: 'DEV001',
    phone: '+254 700 000 000'
  },
  {
    id: 'mock-user-2',
    email: 'buyer@realaist.com',
    firstName: 'Jane',
    lastName: 'Buyer',
    userType: 'buyer',
    phone: '+254 700 000 001'
  }
]

class AuthService {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // Check offline mode first
      if (isOfflineMode()) {
        const storedUser = localStorage.getItem('current_user')
        if (storedUser) {
          return JSON.parse(storedUser)
        }
        return null
      }
      
      // Add timeout to prevent hanging auth checks
      const authPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 5000);
      });
      
      try {
        const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise])
        
        if (error || !user) {
          // Don't immediately return null - check if we have a stored user first
          const storedUser = localStorage.getItem('current_user')
          if (storedUser) {
            return JSON.parse(storedUser)
          }
          return null
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
        // If profile doesn't exist, try to create one
        console.log('Profile not found, attempting to create one for user:', user.id)
        
        // Extract name from user metadata or email
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || 'User'
        const lastName = nameParts.slice(1).join(' ') || ''
        
        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            first_name: firstName,
            last_name: lastName,
            user_type: user.user_metadata?.user_type || 'developer', // Default to developer for this app
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          return null
        }

        return {
          id: newProfile.id,
          email: newProfile.email,
          firstName: newProfile.first_name,
          lastName: newProfile.last_name,
          phone: newProfile.phone,
          avatarUrl: newProfile.avatar_url,
          userType: newProfile.user_type,
          companyName: newProfile.company_name,
          licenseNumber: newProfile.license_number,
          address: newProfile.address ?? undefined
        }
      }

        return {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          userType: profile.user_type,
          companyName: profile.company_name,
          licenseNumber: profile.license_number,
          address: profile.address ?? undefined,
          website: profile.website,
          instagram: profile.instagram,
          x: profile.x,
          facebook: profile.facebook,
          logoUrl: profile.logo_url
        }

      } catch (timeoutError) {
        console.log('AuthService: Auth check timed out, using stored user data as fallback');
        // If auth check times out, use stored user data
        const storedUser = localStorage.getItem('current_user')
        if (storedUser) {
          console.log('AuthService: Using stored user data due to timeout');
          return JSON.parse(storedUser)
        }
        return null
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Attempting to sign up with:', { email: data.email, userType: data.userType })
      
      // Check if we're in offline mode or if Supabase is unavailable
      if (isOfflineMode()) {
        console.log('Using offline authentication for signup')
        const mockUser: AuthUser = {
          id: `mock-user-${Date.now()}`,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: data.userType,
          phone: data.phone,
          companyName: data.companyName,
          licenseNumber: data.licenseNumber,
          address: data.address
        }
        localStorage.setItem('current_user', JSON.stringify(mockUser))
        return { user: mockUser, error: null }
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            phone: data.phone,
            company_name: data.companyName,
            license_number: data.licenseNumber,
            address: data.address
          }
        }
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        
        // Handle specific error cases
        if (authError.message.includes('User already registered')) {
          return { user: null, error: 'An account with this email already exists. Please try signing in instead.' }
        }
        
        if (authError.message.includes('Password should be at least')) {
          return { user: null, error: 'Password must be at least 6 characters long.' }
        }
        
        if (authError.message.includes('Invalid email')) {
          return { user: null, error: 'Please enter a valid email address.' }
        }
        
        // If it's a network error, try offline mode
        if (authError.message.includes('Load failed') || authError.message.includes('fetch') || authError.message.includes('406')) {
          console.log('Network error detected, switching to offline mode')
          localStorage.setItem('offline_mode', 'true')
          localStorage.setItem('offline_mode_timestamp', Date.now().toString())
          const mockUser: AuthUser = {
            id: `mock-user-${Date.now()}`,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            userType: data.userType,
            phone: data.phone,
            companyName: data.companyName,
            licenseNumber: data.licenseNumber,
            address: data.address
          }
          localStorage.setItem('current_user', JSON.stringify(mockUser))
          return { user: mockUser, error: null }
        }
        
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' }
      }

      // The profile should be created automatically by the trigger
      // But let's wait a moment and then fetch it
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Get the created profile
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      // If profile doesn't exist, try to create it manually
      if (profileError || !profile) {
        console.log('Profile not found after signup, attempting to create manually:', profileError)
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            phone: data.phone,
            company_name: data.companyName,
            license_number: data.licenseNumber,
            address: data.address ?? null,
            avatar_url: authData.user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile manually:', createError)
          
          // Handle specific profile creation errors
          if (createError.message.includes('duplicate key')) {
            return { user: null, error: 'An account with this email already exists. Please try signing in instead.' }
          }
          
          if (createError.message.includes('violates foreign key')) {
            return { user: null, error: 'Database configuration error. Please contact support.' }
          }
          
          return { user: null, error: `Profile creation failed: ${createError.message}` }
        }

        profile = newProfile
        console.log('Profile created manually successfully')
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        userType: profile.user_type,
        companyName: profile.company_name,
        licenseNumber: profile.license_number,
        address: profile.address ?? undefined,
        website: profile.website,
        instagram: profile.instagram,
        x: profile.x,
        facebook: profile.facebook,
        logoUrl: profile.logo_url
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Attempting to sign in with:', { email: data.email })
      
      // Check if we're in offline mode or if Supabase is unavailable
      if (isOfflineMode()) {
        console.log('Using offline authentication')
        const mockUser = MOCK_USERS.find(u => u.email === data.email)
        if (mockUser) {
          localStorage.setItem('current_user', JSON.stringify(mockUser))
          return { user: mockUser, error: null }
        } else {
          return { user: null, error: 'Invalid credentials in offline mode' }
        }
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        // If it's a network error, try offline mode
        if (authError.message.includes('Load failed') || authError.message.includes('fetch')) {
          console.log('Network error detected, switching to offline mode')
          localStorage.setItem('offline_mode', 'true')
          localStorage.setItem('offline_mode_timestamp', Date.now().toString())
          const mockUser = MOCK_USERS.find(u => u.email === data.email)
          if (mockUser) {
            localStorage.setItem('current_user', JSON.stringify(mockUser))
            return { user: mockUser, error: null }
          }
        }
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to sign in' }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        // If profile doesn't exist, try to create one
        console.log('Profile not found, attempting to create one for user:', authData.user.id)
        
        // Extract name from user metadata or email
        const fullName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || 'User'
        const lastName = nameParts.slice(1).join(' ') || ''
        
        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            first_name: firstName,
            last_name: lastName,
            user_type: authData.user.user_metadata?.user_type || 'developer',
            avatar_url: authData.user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Failed to create profile:', createError)
          return { user: null, error: 'Profile creation failed' }
        }

        return {
          user: {
            id: newProfile.id,
            email: newProfile.email,
            firstName: newProfile.first_name,
            lastName: newProfile.last_name,
            phone: newProfile.phone,
            avatarUrl: newProfile.avatar_url,
            userType: newProfile.user_type,
            companyName: newProfile.company_name,
            licenseNumber: newProfile.license_number,
            website: newProfile.website,
            instagram: newProfile.instagram,
            x: newProfile.x,
            facebook: newProfile.facebook,
            logoUrl: newProfile.logo_url
          },
          error: null
        }
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          userType: profile.user_type,
          companyName: profile.company_name,
          licenseNumber: profile.license_number,
          website: profile.website,
          instagram: profile.instagram,
          x: profile.x,
          facebook: profile.facebook,
          logoUrl: profile.logo_url
        },
        error: null
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      if (isOfflineMode()) {
        return { error: 'Google sign-in not available in offline mode' }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Google sign-in error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      // Clear offline mode data
      localStorage.removeItem('current_user')
      localStorage.removeItem('offline_mode')
      
      // Try to sign out from Supabase if not in offline mode
      if (!isOfflineMode()) {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          return { error: error.message }
        }
      }

      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (isOfflineMode()) {
        const storedUser = localStorage.getItem('current_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const updatedUser = { ...user, ...updates }
          localStorage.setItem('current_user', JSON.stringify(updatedUser))
          return { user: updatedUser, error: null }
        }
        return { user: null, error: 'No user found in offline mode' }
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { user: null, error: 'User not authenticated' }
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          avatar_url: updates.avatarUrl,
          company_name: updates.companyName,
          license_number: updates.licenseNumber,
          address: updates.address ?? undefined,
          website: updates.website,
          instagram: updates.instagram,
          x: updates.x,
          facebook: updates.facebook,
          logo_url: updates.logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (profileError) {
        return { user: null, error: profileError.message }
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        userType: profile.user_type,
        companyName: profile.company_name,
        licenseNumber: profile.license_number,
        address: profile.address ?? undefined,
        website: profile.website,
        instagram: profile.instagram,
        x: profile.x,
        facebook: profile.facebook,
        logoUrl: profile.logo_url
      }

      return { user: authUser, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (isOfflineMode()) {
      // In offline mode, just return a dummy subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }

    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
