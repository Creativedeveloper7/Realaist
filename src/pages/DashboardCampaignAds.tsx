import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Campaign {
	id: string;
	campaign_name: string;
	target_location: string;
	target_age_group: string;
	duration_start: string;
	duration_end: string;
	audience_interests: string[];
	user_budget: number;
	status: 'active' | 'pending' | 'failed' | 'completed';
	created_at: string;
}

export default function DashboardCampaignAds() {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [properties, setProperties] = useState<any[]>([]);
	const [propertiesLoading, setPropertiesLoading] = useState(false);
	const [selectedProperty, setSelectedProperty] = useState<any>(null);
	const [form, setForm] = useState<any>({
		campaignName: '',
		targetLocation: '',
		targetAgeGroup: '18-24',
		startDate: '',
		endDate: '',
		audienceInterests: '' as any,
		budget: '' as any,
		creative: null as File | null,
		propertyId: null
	});
	const [submitting, setSubmitting] = useState(false);

	// Load user's campaigns
	useEffect(() => {
		const loadCampaigns = async () => {
			if (!user?.id) return;
			
			try {
				const { data, error } = await supabase
					.from('campaigns')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });
				
				if (error) throw error;
				setCampaigns(data || []);
			} catch (error) {
				console.error('Error loading campaigns:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCampaigns();
	}, [user?.id]);

	// Load user's properties for creative assets
	useEffect(() => {
		const loadProperties = async () => {
			if (!user?.id) return;
			
			setPropertiesLoading(true);
			try {
				const { data, error } = await supabase
					.from('properties')
					.select('*')
					.eq('user_id', user.id)
					.order('created_at', { ascending: false });
				
				if (error) throw error;
				setProperties(data || []);
			} catch (error) {
				console.error('Error loading properties:', error);
			} finally {
				setPropertiesLoading(false);
			}
		};

		loadProperties();
	}, [user?.id]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((f: any) => ({ ...f, [name]: value }));
	};

	const handleLaunch = async () => {
		try {
			setSubmitting(true);
			const body: any = {
				campaign_name: form.campaignName,
				target_location: form.targetLocation,
				target_age_group: form.targetAgeGroup,
				duration_start: form.startDate,
				duration_end: form.endDate,
				audience_interests: String(form.audienceInterests || '')
					.split(',')
					.map((s: string) => s.trim())
					.filter(Boolean),
				budget: Number(form.budget),
				property_id: form.propertyId
			};
			
			const res = await fetch('/api/campaigns/create', {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
					'x-user-id': user?.id || ''
				},
				body: JSON.stringify(body)
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || 'Failed');
			
			// Show success message
			alert('Your campaign has been successfully created and is now live!');
			
			// Reset form and close modal
			setForm({
				campaignName: '',
				targetLocation: '',
				targetAgeGroup: '18-24',
				startDate: '',
				endDate: '',
				audienceInterests: '',
				budget: '',
				creative: null,
				propertyId: null
			});
			setSelectedProperty(null);
			setOpen(false);
			
			// Reload campaigns
			window.location.reload();
		} catch (e: any) {
			alert(e?.message || 'Failed to create campaign');
		} finally {
			setSubmitting(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/30';
			case 'pending': return 'text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30';
			case 'failed': return 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30';
			case 'completed': return 'text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30';
			default: return 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/30';
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign Ads</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your advertising campaigns to reach more customers</p>
				</div>
				<motion.button
					className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#C7A667] to-yellow-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
					onClick={() => setOpen(true)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.98 }}
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
					New Campaign
				</motion.button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white dark:bg-[#0E0E10] rounded-xl border border-gray-200 dark:border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
							<p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns.length}</p>
						</div>
						<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
							<svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</div>
					</div>
				</div>
				
				<div className="bg-white dark:bg-[#0E0E10] rounded-xl border border-gray-200 dark:border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</p>
							<p className="text-2xl font-bold text-green-600 dark:text-green-400">
								{campaigns.filter(c => c.status === 'active').length}
							</p>
						</div>
						<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
							<svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
					</div>
				</div>
				
				<div className="bg-white dark:bg-[#0E0E10] rounded-xl border border-gray-200 dark:border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
							<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
								${campaigns.reduce((sum, c) => sum + c.user_budget, 0).toLocaleString()}
							</p>
						</div>
						<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
							<svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Campaigns List */}
			<div className="bg-white dark:bg-[#0E0E10] rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
				<div className="p-6 border-b border-gray-200 dark:border-white/10">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Campaigns</h2>
						<div className="flex items-center gap-2">
							<button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
								</svg>
							</button>
							<button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
								<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
								</svg>
							</button>
						</div>
					</div>
				</div>
				
				<div className="p-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="flex flex-col items-center gap-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667]"></div>
								<p className="text-gray-500 dark:text-gray-400">Loading campaigns...</p>
							</div>
						</div>
					) : campaigns.length === 0 ? (
						<div className="text-center py-12">
							<div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
								<svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No campaigns yet</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6">Create your first campaign to start reaching more customers</p>
							<motion.button
								className="px-6 py-3 bg-[#C7A667] text-black font-semibold rounded-lg hover:bg-[#B8965A] transition-colors"
								onClick={() => setOpen(true)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								Create Your First Campaign
							</motion.button>
						</div>
					) : (
						<div className="space-y-4">
							{campaigns.map((campaign) => (
								<motion.div 
									key={campaign.id} 
									className="p-6 border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-md dark:hover:shadow-lg transition-all duration-300 bg-white dark:bg-[#0E0E10]"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									whileHover={{ scale: 1.02 }}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-semibold text-gray-900 dark:text-white">{campaign.campaign_name}</h3>
												<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
													{campaign.status}
												</span>
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													{campaign.target_location}
												</span>
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
													</svg>
													{campaign.target_age_group}
												</span>
											</div>
											<div className="flex items-center gap-6 text-sm">
												<span className="text-gray-500 dark:text-gray-400">
													Budget: <span className="font-semibold text-gray-900 dark:text-white">${campaign.user_budget.toLocaleString()}</span>
												</span>
												<span className="text-gray-500 dark:text-gray-400">
													Created: <span className="font-semibold text-gray-900 dark:text-white">{new Date(campaign.created_at).toLocaleDateString()}</span>
												</span>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
												<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											</button>
											<button className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
												<svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
												</svg>
											</button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>
			</div>

			<AnimatePresence>
				{open && (
					<motion.div 
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setOpen(false)}
					>
						<motion.div
							className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0E0E10] border border-gray-200 dark:border-white/10 shadow-2xl"
							initial={{ scale: 0.95, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 20 }}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Modal Header */}
							<div className="p-6 border-b border-gray-200 dark:border-white/10">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-gradient-to-r from-[#C7A667] to-yellow-600 rounded-lg">
											<svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
											</svg>
										</div>
										<div>
											<h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
											<p className="text-gray-600 dark:text-gray-400">Set up your advertising campaign to reach your target audience</p>
										</div>
									</div>
									<button
										onClick={() => setOpen(false)}
										className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
									>
										<svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>

							{/* Modal Content */}
							<div className="p-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Left Column */}
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Campaign Name *
											</label>
											<input 
												name="campaignName" 
												placeholder="Enter campaign name" 
												className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
												onChange={onChange} 
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Target Location *
											</label>
											<input 
												name="targetLocation" 
												placeholder="e.g., Nairobi, Kenya" 
												className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
												onChange={onChange} 
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Target Age Group *
											</label>
											<select 
												name="targetAgeGroup" 
												className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
												onChange={onChange}
											>
												<option value="18-24">18-24</option>
												<option value="25-34">25-34</option>
												<option value="35-44">35-44</option>
												<option value="45-54">45-54</option>
												<option value="55+">55+</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Audience Interests
											</label>
											<input 
												name="audienceInterests" 
												placeholder="e.g., real estate, investment, luxury" 
												className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
												onChange={onChange} 
											/>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple interests with commas</p>
										</div>
									</div>

									{/* Right Column */}
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Campaign Duration *
											</label>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
													<input 
														name="startDate" 
														type="date" 
														className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
														onChange={onChange} 
													/>
												</div>
												<div>
													<label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
													<input 
														name="endDate" 
														type="date" 
														className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
														onChange={onChange} 
													/>
												</div>
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Budget *
											</label>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
												</div>
												<input 
													name="budget" 
													type="number" 
													placeholder="0.00" 
													className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
													onChange={onChange} 
												/>
											</div>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum budget: $100</p>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Creative Assets
											</label>
											
											{/* Property Selection */}
											<div className="mb-4">
												<div className="flex items-center justify-between mb-3">
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
														Select from your properties
													</span>
													{propertiesLoading && (
														<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
															<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C7A667]"></div>
															Loading properties...
														</div>
													)}
												</div>
												
												{properties.length > 0 ? (
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
														{properties.map((property) => (
															<div
																key={property.id}
																className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
																	selectedProperty?.id === property.id
																		? 'border-[#C7A667] bg-[#C7A667]/10 dark:bg-[#C7A667]/20'
																		: 'border-gray-200 dark:border-white/20 hover:border-[#C7A667] dark:hover:border-[#C7A667]'
																}`}
																onClick={() => {
																	setSelectedProperty(property);
																	setForm((f: any) => ({ ...f, propertyId: property.id }));
																}}
															>
																<div className="flex items-start gap-3">
																	<div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
																		{property.images && property.images.length > 0 ? (
																			<img 
																				src={property.images[0]} 
																				alt={property.title}
																				className="w-full h-full object-cover rounded-lg"
																			/>
																		) : (
																			<svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
																			</svg>
																		)}
																	</div>
																	<div className="flex-1 min-w-0">
																		<h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
																			{property.title}
																		</h4>
																		<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
																			{property.location}
																		</p>
																		{property.price && (
																			<p className="text-xs font-medium text-[#C7A667] mt-1">
																				${property.price.toLocaleString()}
																			</p>
																		)}
																	</div>
																	{selectedProperty?.id === property.id && (
																		<div className="flex-shrink-0">
																			<svg className="w-5 h-5 text-[#C7A667]" fill="currentColor" viewBox="0 0 20 20">
																				<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																			</svg>
																		</div>
																	)}
																</div>
															</div>
														))}
													</div>
												) : (
													<div className="text-center py-6 border border-gray-200 dark:border-white/20 rounded-lg">
														<svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
														</svg>
														<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No properties found</p>
														<p className="text-xs text-gray-400 dark:text-gray-500">
															Upload properties first to use them in campaigns
														</p>
													</div>
												)}
											</div>

											{/* File Upload Fallback */}
											<div className="border-t border-gray-200 dark:border-white/10 pt-4">
												<div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-4 text-center hover:border-[#C7A667] dark:hover:border-[#C7A667] transition-colors">
													<svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
														<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
													</svg>
													<div>
														<label htmlFor="creative" className="cursor-pointer">
															<span className="block text-sm font-medium text-gray-900 dark:text-white">
																Or upload custom assets
															</span>
															<span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
																PNG, JPG, MP4 up to 10MB
															</span>
														</label>
														<input 
															id="creative"
															name="creative" 
															type="file" 
															accept="image/*,video/*"
															className="sr-only" 
															onChange={(e) => setForm((f: any) => ({ ...f, creative: e.target.files?.[0] || null }))} 
														/>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="mt-8 flex justify-end gap-4">
									<button 
										className="px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" 
										onClick={() => setOpen(false)}
									>
										Cancel
								</button>
									<motion.button 
										className="px-6 py-3 bg-gradient-to-r from-[#C7A667] to-yellow-600 text-black font-semibold rounded-lg hover:from-[#B8965A] hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
										onClick={handleLaunch} 
										disabled={submitting}
										whileHover={{ scale: submitting ? 1 : 1.05 }}
										whileTap={{ scale: submitting ? 1 : 0.95 }}
									>
										{submitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
												Launching Campaign...
											</>
										) : (
											<>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
												</svg>
												Launch Campaign
											</>
										)}
									</motion.button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
