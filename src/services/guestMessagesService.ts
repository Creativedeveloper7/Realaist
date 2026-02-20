import { supabase } from '../lib/supabase';

export interface GuestMessage {
  id: string;
  property_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_email: string;
  message: string;
  read: boolean;
  created_at: string;
  property?: { id: string; title: string; location?: string } | null;
}

export interface SendMessageInput {
  propertyId: string;
  senderId?: string | null;
  senderName: string;
  senderEmail: string;
  message: string;
}

export const guestMessagesService = {
  async sendMessage(input: SendMessageInput): Promise<{ data: GuestMessage | null; error: string | null }> {
    try {
      const { error } = await supabase
        .from('guest_messages')
        .insert({
          property_id: input.propertyId,
          sender_id: input.senderId ?? null,
          sender_name: input.senderName.trim(),
          sender_email: input.senderEmail.trim(),
          message: input.message.trim(),
        });

      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (e) {
      console.error('guestMessagesService.sendMessage', e);
      return { data: null, error: e instanceof Error ? e.message : 'Failed to send message' };
    }
  },

  /** Fetches messages for the current user (host). RLS ensures only messages for their properties are returned. */
  async getMessagesForHost(): Promise<{ messages: GuestMessage[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('guest_messages')
        .select(`
          id,
          property_id,
          sender_id,
          sender_name,
          sender_email,
          message,
          read,
          created_at,
          property:properties(id, title, location)
        `)
        .order('created_at', { ascending: false });

      if (error) return { messages: [], error: error.message };

      const messages = (data || []).map((row: any) => ({
        id: row.id,
        property_id: row.property_id,
        sender_id: row.sender_id,
        sender_name: row.sender_name,
        sender_email: row.sender_email,
        message: row.message,
        read: row.read ?? false,
        created_at: row.created_at,
        property: row.property ?? null,
      })) as GuestMessage[];

      return { messages, error: null };
    } catch (e) {
      console.error('guestMessagesService.getMessagesForHost', e);
      return { messages: [], error: e instanceof Error ? e.message : 'Failed to load messages' };
    }
  },

  async markAsRead(messageId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('guest_messages')
        .update({ read: true })
        .eq('id', messageId);

      return { error: error ? error.message : null };
    } catch (e) {
      console.error('guestMessagesService.markAsRead', e);
      return { error: e instanceof Error ? e.message : 'Failed to update' };
    }
  },
};
