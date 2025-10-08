import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type VerifyResult = { ok: true } | { ok: false; error: string };

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
