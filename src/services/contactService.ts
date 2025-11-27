import { supabase } from '../lib/supabase';

export interface ContactMessage {
	id: string;
	name: string;
	email: string;
	phone: string;
	message: string;
	status: 'new' | 'read' | 'replied' | 'archived';
	created_at: string;
	updated_at: string;
}

export interface CreateContactMessageData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

class ContactService {
	/**
	 * Create a new contact message
	 * Uses RPC function to bypass RLS if direct insert fails
	 */
	async createMessage(data: CreateContactMessageData): Promise<{ message: ContactMessage | null; error: string | null }> {
		try {
			// First try direct insert
			const { data: message, error } = await supabase
				.from('contact_messages')
				.insert({
					name: data.name,
					email: data.email,
					phone: data.phone,
					message: data.message,
					status: 'new',
				})
				.select()
				.single();

			if (error) {
				// If direct insert fails due to RLS, try using the RPC function
				if (error.code === '42501' || error.message.includes('row-level security')) {
					console.log('Direct insert blocked by RLS, trying RPC function...');
					const { data: messageData, error: rpcError } = await supabase.rpc('create_contact_message', {
						p_name: data.name,
						p_email: data.email,
						p_phone: data.phone,
						p_message: data.message,
					});

					if (rpcError) {
						console.error('Error creating contact message via RPC:', rpcError);
						return { message: null, error: rpcError.message };
					}

					// If RPC succeeded (no error), the message was created
					// Even if we can't parse the response, return success
					// The message is in the database
					console.log('Message created successfully via RPC');
					return { message: null, error: null };
				}

				console.error('Error creating contact message:', error);
				return { message: null, error: error.message };
			}

			return { message: message as ContactMessage, error: null };
		} catch (err: any) {
			console.error('Unexpected error creating contact message:', err);
			return { message: null, error: err?.message || 'Failed to create message' };
		}
	}

	/**
	 * Get all contact messages (admin only)
	 * Uses RPC function to bypass RLS
	 */
	async getAllMessages(): Promise<{ messages: ContactMessage[]; error: string | null }> {
		try {
			// First try direct select
			const { data: messages, error } = await supabase
				.from('contact_messages')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				// If direct select fails due to RLS, try using the RPC function
				if (error.code === '42501' || error.message.includes('row-level security')) {
					console.log('Direct select blocked by RLS, trying RPC function...');
					const { data: rpcMessages, error: rpcError } = await supabase.rpc('get_contact_messages_for_admin');

					if (rpcError) {
						console.error('Error fetching contact messages via RPC:', rpcError);
						return { messages: [], error: rpcError.message };
					}

					// Convert RPC result to ContactMessage format
					const convertedMessages: ContactMessage[] = (rpcMessages || []).map((msg: any) => ({
						id: msg.id,
						name: msg.name,
						email: msg.email,
						phone: msg.phone,
						message: msg.message,
						status: msg.status,
						created_at: msg.created_at,
						updated_at: msg.updated_at,
					}));

					return { messages: convertedMessages, error: null };
				}

				console.error('Error fetching contact messages:', error);
				return { messages: [], error: error.message };
			}

			return { messages: (messages || []) as ContactMessage[], error: null };
		} catch (err: any) {
			console.error('Unexpected error fetching contact messages:', err);
			return { messages: [], error: err?.message || 'Failed to fetch messages' };
		}
	}

	/**
	 * Update message status
	 */
	async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<{ success: boolean; error: string | null }> {
		try {
			const { error } = await supabase
				.from('contact_messages')
				.update({ status, updated_at: new Date().toISOString() })
				.eq('id', id);

			if (error) {
				console.error('Error updating message status:', error);
				return { success: false, error: error.message };
			}

			return { success: true, error: null };
		} catch (err: any) {
			console.error('Unexpected error updating message status:', err);
			return { success: false, error: err?.message || 'Failed to update message' };
		}
	}

	/**
	 * Delete a message
	 */
	async deleteMessage(id: string): Promise<{ success: boolean; error: string | null }> {
		try {
			const { error } = await supabase
				.from('contact_messages')
				.delete()
				.eq('id', id);

			if (error) {
				console.error('Error deleting message:', error);
				return { success: false, error: error.message };
			}

			return { success: true, error: null };
		} catch (err: any) {
			console.error('Unexpected error deleting message:', err);
			return { success: false, error: err?.message || 'Failed to delete message' };
		}
	}

	/**
	 * Get unread message count
	 */
	async getUnreadCount(): Promise<{ count: number; error: string | null }> {
		try {
			const { count, error } = await supabase
				.from('contact_messages')
				.select('*', { count: 'exact', head: true })
				.eq('status', 'new');

			if (error) {
				console.error('Error getting unread count:', error);
				return { count: 0, error: error.message };
			}

			return { count: count || 0, error: null };
		} catch (err: any) {
			console.error('Unexpected error getting unread count:', err);
			return { count: 0, error: err?.message || 'Failed to get unread count' };
		}
	}
}

export const contactService = new ContactService();

