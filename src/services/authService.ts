import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Mock users for offline mode
const MOCK_USERS: AuthUser[] = [
  {
    id: 'mock-dev-1',
    email: 'developer@example.com',
    firstName: 'John',
    lastName: 'Developer',
    userType: 'developer',
    companyName: 'Real Estate Solutions',
    licenseNumber: 'DEV001',
    phone: '+254700000000',
    avatarUrl: undefined
  },
  {
    id: 'mock-buyer-1',
    email: 'buyer@example.com',
    firstName: 'Jane',
    lastName: 'Buyer',
    userType: 'buyer',
    phone: '+254700000001',
    avatarUrl: undefined
  }
]

// Check if we're in offline mode
const isOfflineMode = () => {
  return localStorage.getItem('offline_mode') === 'true'
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'buyer' | 'developer'
  companyName?: string
  licenseNumber?: string
  phone?: string
  avatarUrl?: string
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: 'buyer' | 'developer'
  companyName?: string
  licenseNumber?: string
  phone?: string
}

export interface SignInData {
  email: string
  password: string
}

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
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
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
            user_type: user.user_metadata?.user_type || 'buyer', // Use metadata or default to buyer
            avatar_url: user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError) {
          // If it's a duplicate key error, the profile already exists, try to fetch it
          if (createError.code === '23505') {
            console.log('Profile already exists, fetching it...')
            const { data: existingProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (fetchError || !existingProfile) {
              console.error('Error fetching existing profile:', fetchError)
              return null
            }

            return {
              id: existingProfile.id,
              email: existingProfile.email,
              firstName: existingProfile.first_name,
              lastName: existingProfile.last_name,
              userType: existingProfile.user_type,
              companyName: existingProfile.company_name,
              licenseNumber: existingProfile.license_number,
              phone: existingProfile.phone,
              avatarUrl: existingProfile.avatar_url
            }
          } else {
            console.error('Error creating profile:', createError)
            return null
          }
        }

        if (!newProfile) {
        return null
        }

        return {
          id: newProfile.id,
          email: newProfile.email,
          firstName: newProfile.first_name,
          lastName: newProfile.last_name,
          userType: newProfile.user_type,
          companyName: newProfile.company_name,
          licenseNumber: newProfile.license_number,
          phone: newProfile.phone,
          avatarUrl: newProfile.avatar_url
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        userType: profile.user_type,
        companyName: profile.company_name,
        licenseNumber: profile.license_number,
        phone: profile.phone,
        avatarUrl: profile.avatar_url
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('Attempting to sign up with:', { 
        email: data.email, 
        userType: data.userType,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyName: data.companyName,
        licenseNumber: data.licenseNumber
      })
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            company_name: data.companyName,
            license_number: data.licenseNumber,
            phone: data.phone
          }
        }
      })

      if (authError) {
        console.error('Supabase signup error:', authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' }
      }

      console.log('User created successfully:', authData.user)
      console.log('User confirmed:', authData.user.email_confirmed_at)
      console.log('User ID:', authData.user.id)
      console.log('User email:', authData.user.email)

      // Check if email confirmation is required
      if (!authData.user.email_confirmed_at) {
        console.log('Email confirmation required')
        return { 
          user: null, 
          error: 'Please check your email and click the confirmation link before logging in.' 
        }
      }

      // The profile should be created automatically by the trigger
      // Let's check if it exists and update it if needed
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (existingProfile) {
        // Profile exists, update it with the correct user_type and other data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            company_name: data.companyName,
            license_number: data.licenseNumber,
            phone: data.phone
          })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error('Error updating profile:', updateError)
        }
      } else {
        // Profile doesn't exist, create it
        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          user_type: data.userType,
          company_name: data.companyName,
          license_number: data.licenseNumber,
          phone: data.phone
        })
          .select()
          .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        }
      }

      return {
        user: {
          id: authData.user.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          userType: data.userType,
          companyName: data.companyName,
          licenseNumber: data.licenseNumber,
          phone: data.phone
        },
        error: null
      }
    } catch (error) {
      console.error('Error signing up:', error)
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
        console.log('Profile not found during sign in, attempting to create one for user:', authData.user.id)
        
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
            user_type: 'buyer', // Default to buyer
            avatar_url: authData.user.user_metadata?.avatar_url || null
          })
          .select()
          .single()

        if (createError || !newProfile) {
          console.error('Error creating profile during sign in:', createError)
          return { user: null, error: 'Failed to create user profile' }
        }

        return {
          user: {
            id: newProfile.id,
            email: newProfile.email,
            firstName: newProfile.first_name,
            lastName: newProfile.last_name,
            userType: newProfile.user_type,
            companyName: newProfile.company_name,
            licenseNumber: newProfile.license_number,
            phone: newProfile.phone,
            avatarUrl: newProfile.avatar_url
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
          userType: profile.user_type,
          companyName: profile.company_name,
          licenseNumber: profile.license_number,
          phone: profile.phone,
          avatarUrl: profile.avatar_url
        },
        error: null
      }
    } catch (error) {
      console.error('Error signing in:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error signing in with Google:', error)
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
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return { user: null, error: 'User not authenticated' }
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          company_name: updates.companyName,
          license_number: updates.licenseNumber,
          phone: updates.phone,
          avatar_url: updates.avatarUrl
        })
        .eq('id', user.id)
        .select()
        .single()

      if (profileError) {
        return { user: null, error: profileError.message }
      }

      return {
        user: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          userType: profile.user_type,
          companyName: profile.company_name,
          licenseNumber: profile.license_number,
          phone: profile.phone,
          avatarUrl: profile.avatar_url
        },
        error: null
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Resend email confirmation
  async resendConfirmation(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Error resending confirmation:', error)
      return { error: 'Failed to resend confirmation email' }
    }
  }
}

export const authService = new AuthService()
