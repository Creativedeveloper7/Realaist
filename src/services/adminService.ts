import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type VerifyResult = { ok: true } | { ok: false; error: string };

export interface CreateDeveloperData {
	email: string;
	firstName: string;
	lastName: string;
	companyName?: string;
	licenseNumber?: string;
	phone?: string;
}

export interface CreateDeveloperResult {
	success: boolean;
	userId?: string;
	error?: string;
	temporaryPassword?: string;
}

export async function verifyPropertyAsAdmin(propertyId: string): Promise<VerifyResult> {
	try {
		// Check current user
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
		if (sessionError) return { ok: false, error: 'session_error' };
		const email = sessionData?.session?.user?.email?.toLowerCase();
		if (!email) return { ok: false, error: 'unauthenticated' };
		// Minimal admin email gate; production should use RLS policies or a server token
		const allowed = ['admin@realaist.tech', 'admin@realaist.com', 'superadmin@realaist.com', 'support@realaist.com'];
		if (!allowed.includes(email)) return { ok: false, error: 'forbidden' };

		// Update property: set is_verified=true (if available), and status='LIVE'
		let updateError: any = null;
		try {
			const res = await supabase
				.from('properties')
				.update({ is_verified: true as any, status: 'LIVE' })
				.eq('id', propertyId);
			updateError = res.error;
			if (updateError && /is_verified/i.test(updateError.message)) {
				const retry = await supabase
					.from('properties')
					.update({ status: 'LIVE' })
					.eq('id', propertyId);
				updateError = retry.error;
			}
		} catch (e: any) {
			updateError = e;
		}
		if (updateError) return { ok: false, error: updateError.message || 'update_failed' };
		return { ok: true };
	} catch (e: any) {
		return { ok: false, error: e?.message || 'unknown_error' };
	}
}

/**
 * Create a developer account as admin
 * This function creates an auth user which triggers the profile creation via database trigger
 */
export async function createDeveloperAsAdmin(data: CreateDeveloperData): Promise<CreateDeveloperResult> {
	try {
		// Check current user is admin
		const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
		if (sessionError) return { success: false, error: 'session_error' };
		const email = sessionData?.session?.user?.email?.toLowerCase();
		if (!email) return { success: false, error: 'unauthenticated' };
		const allowed = ['admin@realaist.tech', 'admin@realaist.com', 'superadmin@realaist.com', 'support@realaist.com'];
		if (!allowed.includes(email)) return { success: false, error: 'forbidden' };

		// Generate a temporary password
		const temporaryPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

		// Create auth user - this will trigger the profile creation via database trigger
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: data.email,
			password: temporaryPassword,
			options: {
				data: {
					first_name: data.firstName,
					last_name: data.lastName,
					user_type: 'developer',
					company_name: data.companyName || '',
					license_number: data.licenseNumber || '',
					phone: data.phone || '',
				},
			},
		});

		if (authError) {
			console.error('Error creating auth user:', authError);
			return { success: false, error: authError.message };
		}

		if (!authData.user) {
			return { success: false, error: 'Failed to create user' };
		}

		// Wait for the trigger to create the profile, with retry logic
		let profileExists = false;
		let retries = 0;
		const maxRetries = 5;
		
		while (!profileExists && retries < maxRetries) {
			await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
			
			const { data: existingProfile } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', authData.user.id)
				.single();
			
			if (existingProfile) {
				profileExists = true;
			} else {
				retries++;
			}
		}

		// Update the profile with additional fields
		// Try RPC function first, then fallback to direct update
		let updateError: any = null;
		
		// Try RPC function - Supabase will convert the object to JSONB automatically
		try {
			const { error: rpcError } = await supabase.rpc('update_user_profile', {
				user_id: authData.user.id,
				profile_data: {
					first_name: data.firstName,
					last_name: data.lastName,
					user_type: 'developer',
					company_name: data.companyName || null,
					license_number: data.licenseNumber || null,
					phone: data.phone || null,
				} as any, // Type assertion for JSONB
			});
			updateError = rpcError;
		} catch (e: any) {
			console.warn('RPC function failed, trying direct update:', e);
			updateError = e;
		}

		// If RPC failed, try direct update (might fail due to RLS, but worth trying)
		if (updateError) {
			try {
				const { error: directError } = await supabase
					.from('profiles')
					.update({
						first_name: data.firstName,
						last_name: data.lastName,
						user_type: 'developer',
						company_name: data.companyName || null,
						license_number: data.licenseNumber || null,
						phone: data.phone || null,
					})
					.eq('id', authData.user.id);
				
				if (directError) {
					console.warn('Direct update also failed (non-critical):', directError);
					// The trigger should have created the profile with basic info from metadata
					// The developer can update their profile later
				} else {
					updateError = null; // Success!
				}
			} catch (e: any) {
				console.warn('Direct update error (non-critical):', e);
			}
		}

		return {
			success: true,
			userId: authData.user.id,
			temporaryPassword: temporaryPassword,
		};
	} catch (e: any) {
		console.error('Unexpected error creating developer:', e);
		return { success: false, error: e?.message || 'unknown_error' };
	}
}
