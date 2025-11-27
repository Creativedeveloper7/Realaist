import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { contactService, ContactMessage } from '../../services/contactService';
import { Mail, Phone, User, MessageSquare, Clock, CheckCircle, Archive, Trash2, Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MessagesPageProps {
	isDarkMode: boolean;
}

type MessageStatus = 'all' | 'new' | 'read' | 'replied' | 'archived';

export default function MessagesPage({ isDarkMode }: MessagesPageProps) {
	const [messages, setMessages] = useState<ContactMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<MessageStatus>('all');
	const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

	useEffect(() => {
		loadMessages();

		// Set up real-time subscription for new messages
		const channel = supabase
			.channel('contact_messages_changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'contact_messages',
				},
				() => {
					// Reload messages when there are changes
					loadMessages();
				}
			)
			.subscribe();

		// Cleanup subscription on unmount
		return () => {
			supabase.removeChannel(channel);
		};
	}, []);

	const loadMessages = async () => {
		setLoading(true);
		const { messages: fetchedMessages, error } = await contactService.getAllMessages();
		if (error) {
			console.error('Error loading messages:', error);
		} else {
			setMessages(fetchedMessages);
		}
		setLoading(false);
	};

	const filteredMessages = useMemo(() => {
		return messages.filter(msg => {
			const matchesSearch = searchTerm === '' ||
				msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				msg.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
				msg.message.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [messages, searchTerm, statusFilter]);

	const handleStatusChange = async (messageId: string, newStatus: ContactMessage['status']) => {
		const { success, error } = await contactService.updateMessageStatus(messageId, newStatus);
		if (success) {
			setMessages(prev => prev.map(msg => 
				msg.id === messageId ? { ...msg, status: newStatus } : msg
			));
			if (selectedMessage?.id === messageId) {
				setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
			}
		} else {
			alert('Failed to update message status: ' + (error || 'Unknown error'));
		}
	};

	const handleDelete = async (messageId: string) => {
		if (!confirm('Are you sure you want to delete this message?')) return;

		const { success, error } = await contactService.deleteMessage(messageId);
		if (success) {
			setMessages(prev => prev.filter(msg => msg.id !== messageId));
			if (selectedMessage?.id === messageId) {
				setSelectedMessage(null);
			}
		} else {
			alert('Failed to delete message: ' + (error || 'Unknown error'));
		}
	};

	const getStatusColor = (status: ContactMessage['status']) => {
		switch (status) {
			case 'new': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
			case 'read': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
			case 'replied': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
			case 'archived': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
			default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const unreadCount = messages.filter(m => m.status === 'new').length;

  return (
		<div className="space-y-4 pb-24">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
						Messages
					</h1>
					<p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						View and manage contact form submissions
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={loadMessages}
						disabled={loading}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
							isDarkMode
								? 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
						}`}
					>
						<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
						Refresh
					</button>
					{unreadCount > 0 && (
						<div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
							<span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
								{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Search and Filter */}
			<div className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
				<div className="flex flex-col gap-4">
					<div className="relative">
						<Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
						<input
							type="text"
							placeholder="Search messages by name, email, phone, or message content..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
								isDarkMode
									? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/20'
									: 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300'
							} focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20 transition-colors`}
						/>
					</div>

					<div className="flex items-center gap-2 flex-wrap">
						<Filter className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
						<span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Filter:</span>
						{(['all', 'new', 'read', 'replied', 'archived'] as MessageStatus[]).map((status) => (
							<button
								key={status}
								onClick={() => setStatusFilter(status)}
								className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
									statusFilter === status
										? 'bg-[#C7A667] text-black'
										: isDarkMode
											? 'bg-white/10 text-white hover:bg-white/20'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								{status}
							</button>
						))}
					</div>
				</div>
			</div>

			{loading ? (
				<div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
					Loading messages...
				</div>
			) : filteredMessages.length === 0 ? (
				<div className={`p-8 text-center rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
					<MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
					<p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						{searchTerm || statusFilter !== 'all'
							? 'No messages found matching your filters.'
							: 'No messages yet.'}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
					{/* Messages List */}
					<div className={`lg:col-span-1 rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
						<div className="p-4 border-b border-white/10 dark:border-gray-200">
							<h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
								Messages ({filteredMessages.length})
							</h2>
						</div>
						<div className="max-h-[600px] overflow-y-auto">
							{filteredMessages.map((message) => (
								<motion.div
									key={message.id}
									onClick={() => {
										setSelectedMessage(message);
										if (message.status === 'new') {
											handleStatusChange(message.id, 'read');
										}
									}}
									className={`p-4 border-b cursor-pointer transition-colors ${
										isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
									} ${selectedMessage?.id === message.id ? (isDarkMode ? 'bg-white/10' : 'bg-gray-100') : ''} ${
										message.status === 'new' ? (isDarkMode ? 'bg-blue-900/10' : 'bg-blue-50/50') : ''
									}`}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
													{message.name}
												</h3>
												{message.status === 'new' && (
													<span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
												)}
											</div>
											<p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
												{message.email}
											</p>
											<p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
												{formatDate(message.created_at)}
											</p>
										</div>
										<span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getStatusColor(message.status)}`}>
											{message.status}
										</span>
									</div>
								</motion.div>
							))}
						</div>
					</div>

					{/* Message Detail */}
					<div className={`lg:col-span-2 rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
						{selectedMessage ? (
							<div className="p-6">
								<div className="flex items-start justify-between mb-6">
									<div>
										<h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
											{selectedMessage.name}
										</h2>
										<div className="flex flex-wrap gap-4 text-sm">
											<div className="flex items-center gap-2">
												<Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
												<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
													{selectedMessage.email}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Phone className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
												<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
													{selectedMessage.phone}
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
												<span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
													{formatDate(selectedMessage.created_at)}
												</span>
											</div>
										</div>
									</div>
									<span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
										{selectedMessage.status}
									</span>
								</div>

								<div className="mb-6">
									<h3 className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
										<MessageSquare className="w-5 h-5" />
										Message
									</h3>
									<div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
										<p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
											{selectedMessage.message}
										</p>
									</div>
								</div>

								<div className="flex flex-wrap gap-2">
									{selectedMessage.status !== 'read' && (
										<button
											onClick={() => handleStatusChange(selectedMessage.id, 'read')}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
												isDarkMode
													? 'bg-white/10 text-white hover:bg-white/20'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											<CheckCircle className="w-4 h-4" />
											Mark as Read
										</button>
									)}
									{selectedMessage.status !== 'replied' && (
										<button
											onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
											className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 transition-colors"
										>
											<CheckCircle className="w-4 h-4" />
											Mark as Replied
										</button>
									)}
									{selectedMessage.status !== 'archived' && (
										<button
											onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
											className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
												isDarkMode
													? 'bg-white/10 text-white hover:bg-white/20'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
											}`}
										>
											<Archive className="w-4 h-4" />
											Archive
										</button>
									)}
									<button
										onClick={() => handleDelete(selectedMessage.id)}
										className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-colors"
									>
										<Trash2 className="w-4 h-4" />
										Delete
									</button>
									<a
										href={`mailto:${selectedMessage.email}?subject=Re: Your Contact Form Submission&body=Dear ${selectedMessage.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0AYour message:%0D%0A${encodeURIComponent(selectedMessage.message)}%0D%0A%0D%0A`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C7A667] text-black hover:bg-[#B8965A] transition-colors"
									>
										<Mail className="w-4 h-4" />
										Reply via Email
									</a>
								</div>
							</div>
						) : (
							<div className="p-8 text-center">
								<MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
								<p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
									Select a message to view details
								</p>
							</div>
						)}
      </div>
				</div>
			)}
    </div>
  );
}
