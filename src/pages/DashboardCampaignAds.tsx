import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LocationDropdown } from '../components/LocationDropdown';
import { TagInput } from '../components/TagInput';
import { PropertySelector } from '../components/PropertySelector';
import { HelpIcon } from '../components/Tooltip';
import { getFilteredInterests } from '../data/audienceInterests';
import { propertiesService } from '../services/propertiesService';
import { campaignsService } from '../services/campaignsService';

interface Campaign {
	id: string;
	campaign_name: string;
	target_location: string[];
	target_age_group: string;
	duration_start: string;
	duration_end: string;
	audience_interests: string[];
	user_budget: number;
	ad_spend: number;
	platform_fee: number;
	total_paid: number;
	status: 'active' | 'pending' | 'failed' | 'completed';
	google_ads_campaign_id?: string;
	property_ids: string[];
	platforms: string[];
	created_at: string;
}

export default function DashboardCampaignAds() {
	const { user } = useAuth();
	const [open, setOpen] = useState(false);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [properties, setProperties] = useState<any[]>([]);
	const [propertiesLoading, setPropertiesLoading] = useState(false);
	const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
	const [form, setForm] = useState<any>({
		targetLocation: [] as string[],
		targetAgeGroup: '18-24',
		startDate: '',
		endDate: '',
		audienceInterests: [] as string[],
		budget: '' as any,
		creative: null as File | null,
		propertyIds: [] as string[],
		platforms: [] as string[]
	});
	const [submitting, setSubmitting] = useState(false);
	const [savingDraft, setSavingDraft] = useState(false);
	const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false);

	// Load user's campaigns
	useEffect(() => {
		const loadCampaigns = async () => {
			if (!user?.id) return;
			
			setLoading(true);
			try {
				const { campaigns, error } = await campaignsService.getUserCampaigns();
				if (error) {
					console.error('Error loading campaigns:', error);
				} else {
					setCampaigns(campaigns);
				}
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
				const { properties: fetchedProperties, error } = await propertiesService.getDeveloperProperties(user.id);
				if (error) {
					console.error('Error loading properties:', error);
				} else {
					// Transform properties to match the expected format
					const transformedProperties = fetchedProperties.map(property => ({
						id: property.id,
						title: property.title,
						location: property.location,
						price: property.price,
						images: property.images || [],
						description: property.description,
						bedrooms: property.bedrooms,
						bathrooms: property.bathrooms,
						area: property.squareFeet,
						status: property.status,
						created_at: property.createdAt
					}));
					setProperties(transformedProperties);
				}
			} catch (error) {
				console.error('Error loading properties:', error);
			} finally {
				setPropertiesLoading(false);
			}
		};

		loadProperties();
	}, [user?.id]);

	// Listen for realtime property creation to update list without refresh
	useEffect(() => {
		const handler = (e: any) => {
			const created = e?.detail?.property;
			if (!created) return;
			if (!user?.id) return;
			if (created.developerId !== user.id) return;
			
			// Transform the new property to match our format
			const transformedProperty = {
				id: created.id,
				title: created.title,
				location: created.location,
				price: created.price,
				images: created.images || [],
				description: created.description,
				bedrooms: created.bedrooms,
				bathrooms: created.bathrooms,
				area: created.squareFeet,
				status: created.status,
				created_at: created.createdAt
			};
			
			setProperties(prev => {
				if (prev.find(p => p.id === created.id)) return prev;
				return [transformedProperty, ...prev];
			});
		};
		
		window.addEventListener('realaist:property-created' as any, handler);
		return () => window.removeEventListener('realaist:property-created' as any, handler);
	}, [user?.id]);

	// Load saved draft when modal opens
	useEffect(() => {
		if (open && user?.id) {
			const savedDraft = localStorage.getItem(`campaign_draft_${user.id}`);
			if (savedDraft) {
				try {
					const draftData = JSON.parse(savedDraft);
					// Only load draft if it's recent (within 7 days)
					const draftAge = new Date().getTime() - new Date(draftData.savedAt).getTime();
					const sevenDays = 7 * 24 * 60 * 60 * 1000;
					
					if (draftAge < sevenDays) {
						setForm({
							targetLocation: draftData.targetLocation || [],
							targetAgeGroup: draftData.targetAgeGroup || '18-24',
							startDate: draftData.startDate || '',
							endDate: draftData.endDate || '',
							audienceInterests: draftData.audienceInterests || [],
							budget: draftData.budget || '',
							creative: draftData.creative || null,
							propertyIds: draftData.propertyIds || []
						});
						
						// Update selected properties based on draft
						if (draftData.propertyIds && draftData.propertyIds.length > 0) {
							const selectedProps = properties.filter(prop => 
								draftData.propertyIds.includes(prop.id)
							);
							setSelectedProperties(selectedProps);
						}
					}
				} catch (error) {
					console.error('Error loading draft:', error);
				}
			}
		}
	}, [open, user?.id, properties]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((f: any) => ({ ...f, [name]: value }));
	};



	const handlePropertySelectionChange = (newSelectedProperties: any[]) => {
		setSelectedProperties(newSelectedProperties);
		setForm((f: any) => ({ 
			...f, 
			propertyIds: newSelectedProperties.map(p => p.id) 
		}));
	};

	// Refresh properties when property selector opens
	const handleOpenPropertySelector = async () => {
		setIsPropertySelectorOpen(true);
		
		// Refresh properties to ensure we have the latest data
		if (user?.id) {
			setPropertiesLoading(true);
			try {
				const { properties: fetchedProperties, error } = await propertiesService.getDeveloperProperties(user.id);
				if (!error && fetchedProperties) {
					const transformedProperties = fetchedProperties.map(property => ({
						id: property.id,
						title: property.title,
						location: property.location,
						price: property.price,
						images: property.images || [],
						description: property.description,
						bedrooms: property.bedrooms,
						bathrooms: property.bathrooms,
						area: property.squareFeet,
						status: property.status,
						created_at: property.createdAt
					}));
					setProperties(transformedProperties);
				}
			} catch (error) {
				console.error('Error refreshing properties:', error);
			} finally {
				setPropertiesLoading(false);
			}
		}
	};

	const handleSaveDraft = async () => {
		try {
			setSavingDraft(true);
			
			// Save draft to localStorage for now (in a real app, this would go to a database)
			const draftData = {
				...form,
				savedAt: new Date().toISOString(),
				userId: user?.id
			};
			
			localStorage.setItem(`campaign_draft_${user?.id}`, JSON.stringify(draftData));
			
			// Show success message
			alert('Campaign draft saved successfully! You can continue editing later.');
			
		} catch (error) {
			console.error('Error saving draft:', error);
			alert('Failed to save draft. Please try again.');
		} finally {
			setSavingDraft(false);
		}
	};

	const handleLaunch = async () => {
		try {
			if (!user?.id) {
				alert('Please log in to create a campaign');
				return;
			}
			
			setSubmitting(true);
			
			const campaignData = {
				target_location: Array.isArray(form.targetLocation) ? form.targetLocation : [form.targetLocation],
				target_age_group: form.targetAgeGroup,
				duration_start: form.startDate,
				duration_end: form.endDate,
				audience_interests: Array.isArray(form.audienceInterests) ? form.audienceInterests : [],
				budget: Number(form.budget),
				property_ids: form.propertyIds,
				platforms: Array.isArray(form.platforms) ? form.platforms : []
			};
			
			console.log('Creating campaign with data:', campaignData);
			
			const { campaign, error } = await campaignsService.createCampaign(campaignData);
			
			if (error) {
				throw new Error(error);
			}
			
			if (!campaign) {
				throw new Error('Campaign creation failed - no campaign returned');
			}
			
			console.log('Campaign submitted for approval:', campaign);
			
			// Show success message
			alert('Your campaign has been submitted for admin approval! You will be notified once it\'s reviewed and approved.');
			
			// Clear saved draft since campaign was launched
			if (user?.id) {
				localStorage.removeItem(`campaign_draft_${user.id}`);
			}
			
			// Reset form and close modal
			setForm({
				targetLocation: [],
				targetAgeGroup: '18-24',
				startDate: '',
				endDate: '',
				audienceInterests: [],
				budget: '',
				creative: null,
				propertyIds: [],
				platforms: []
			});
			setSelectedProperties([]);
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
													{campaign.status === 'pending' ? 'Pending Approval' : campaign.status}
												</span>
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
												<span className="flex items-center gap-1">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													{Array.isArray(campaign.target_location) 
														? campaign.target_location.join(', ') 
														: campaign.target_location
													}
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
													Properties: <span className="font-semibold text-gray-900 dark:text-white">{campaign.property_ids?.length || 0}</span>
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
										{/* Property Selection Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
													Select Properties for Your Campaign *
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Why select properties?</p>
															<p>Choose which properties from your listings to promote in this campaign. This helps target your ads to people interested in these specific properties.</p>
															<p className="text-xs text-gray-300">💡 Tip: Select properties that are similar in price range or location for better targeting.</p>
														</div>
													}
													position="right"
											/>
										</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
												Choose which properties from your listings to include in this campaign
											</p>
											
											{/* Property Selection Button */}
											<div className="mb-4">
												<motion.button
													type="button"
													onClick={handleOpenPropertySelector}
													className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg hover:border-[#C7A667] dark:hover:border-[#C7A667] transition-all duration-200 flex items-center justify-center gap-3 bg-white dark:bg-white/5"
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													<svg className="w-6 h-6 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
													</svg>
													<div className="text-center">
														<p className="text-lg font-semibold text-gray-900 dark:text-white">
															Select Properties
														</p>
														<p className="text-sm text-gray-500 dark:text-gray-400">
															{properties.length > 0 
																? `Choose from ${properties.length} available properties`
																: 'No properties available - upload properties first'
															}
														</p>
													</div>
												</motion.button>
												
												{/* Selected Properties Summary */}
												{selectedProperties.length > 0 && (
													<div className="mt-4 p-4 bg-[#C7A667]/10 dark:bg-[#C7A667]/20 rounded-lg border border-[#C7A667]/30">
														<div className="flex items-center justify-between mb-3">
															<div className="flex items-center gap-2">
																<svg className="w-5 h-5 text-[#C7A667]" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																</svg>
																<span className="text-sm font-semibold text-[#C7A667]">
																	{selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'} selected
																</span>
															</div>
															<button
																type="button"
																onClick={handleOpenPropertySelector}
																className="text-xs text-[#C7A667] hover:text-[#B8965A] font-medium"
															>
																Edit Selection
															</button>
														</div>
														
														{/* Selected Properties Preview */}
														<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
															{selectedProperties.slice(0, 4).map((property) => (
																<div key={property.id} className="flex items-center gap-2 p-2 bg-white dark:bg-white/10 rounded border">
																	<div className="w-8 h-8 bg-gray-100 dark:bg-white/20 rounded flex items-center justify-center flex-shrink-0">
																		{property.images && property.images.length > 0 ? (
																			<img 
																				src={property.images[0]} 
																				alt={property.title}
																				className="w-full h-full object-cover rounded"
																			/>
																		) : (
																			<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
																			</svg>
																		)}
																	</div>
																	<div className="flex-1 min-w-0">
																		<p className="text-xs font-medium text-gray-900 dark:text-white truncate">
																			{property.title}
																		</p>
																		<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
																			{property.location}
																		</p>
																	</div>
																</div>
															))}
															{selectedProperties.length > 4 && (
																<div className="flex items-center justify-center p-2 bg-white dark:bg-white/10 rounded border border-dashed border-gray-300 dark:border-white/20">
																	<span className="text-xs text-gray-500 dark:text-gray-400">
																		+{selectedProperties.length - 4} more
																	</span>
																</div>
															)}
														</div>
													</div>
												)}
											</div>
										</div>

										{/* Platform Selection Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
													Advertising Platforms *
												</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Platform selection</p>
															<p>Choose which advertising platforms to use for your campaign. Each platform has different strengths and pricing structures.</p>
															<p className="text-xs text-gray-300">💡 Tip: Google Ads is great for search intent, while Meta Ads excel at visual storytelling and social engagement.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
												Select the advertising platforms where you want your campaign to run
											</p>
											
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												{/* Google Ads Option */}
												<motion.div
													className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
														form.platforms.includes('google')
															? 'border-[#C7A667] bg-[#C7A667]/10 dark:bg-[#C7A667]/20'
															: 'border-gray-200 dark:border-white/20 hover:border-[#C7A667] dark:hover:border-[#C7A667]'
													}`}
													onClick={() => {
														const newPlatforms = form.platforms.includes('google')
															? form.platforms.filter((p: string) => p !== 'google')
															: [...form.platforms, 'google'];
														setForm((f: any) => ({ ...f, platforms: newPlatforms }));
													}}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													{/* Selection Indicator */}
													<div className="absolute top-3 right-3">
														<div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
															form.platforms.includes('google')
																? 'bg-[#C7A667] border-[#C7A667]'
																: 'border-gray-300 dark:border-white/40'
														}`}>
															{form.platforms.includes('google') && (
																<svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																</svg>
															)}
														</div>
													</div>

													{/* Google Ads Content */}
													<div className="flex items-center gap-3 mb-3">
														<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
															<svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
																<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
																<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
																<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
																<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
															</svg>
														</div>
										<div>
															<h3 className="font-semibold text-gray-900 dark:text-white">Google Ads</h3>
															<p className="text-sm text-gray-500 dark:text-gray-400">Search & Display</p>
														</div>
													</div>
													
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>High-intent search traffic</span>
														</div>
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Precise keyword targeting</span>
														</div>
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Higher cost per click</span>
														</div>
													</div>
												</motion.div>

												{/* Meta Ads Option */}
												<motion.div
													className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
														form.platforms.includes('meta')
															? 'border-[#C7A667] bg-[#C7A667]/10 dark:bg-[#C7A667]/20'
															: 'border-gray-200 dark:border-white/20 hover:border-[#C7A667] dark:hover:border-[#C7A667]'
													}`}
													onClick={() => {
														const newPlatforms = form.platforms.includes('meta')
															? form.platforms.filter((p: string) => p !== 'meta')
															: [...form.platforms, 'meta'];
														setForm((f: any) => ({ ...f, platforms: newPlatforms }));
													}}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
												>
													{/* Selection Indicator */}
													<div className="absolute top-3 right-3">
														<div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
															form.platforms.includes('meta')
																? 'bg-[#C7A667] border-[#C7A667]'
																: 'border-gray-300 dark:border-white/40'
														}`}>
															{form.platforms.includes('meta') && (
																<svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
																	<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
																</svg>
															)}
														</div>
													</div>

													{/* Meta Ads Content */}
													<div className="flex items-center gap-3 mb-3">
														<div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
															<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
																<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
															</svg>
														</div>
														<div>
															<h3 className="font-semibold text-gray-900 dark:text-white">Meta Ads</h3>
															<p className="text-sm text-gray-500 dark:text-gray-400">Facebook & Instagram</p>
														</div>
													</div>
													
													<div className="space-y-2">
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Visual storytelling</span>
														</div>
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Advanced demographic targeting</span>
														</div>
														<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
															<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
															</svg>
															<span>Lower cost per impression</span>
														</div>
													</div>
												</motion.div>
											</div>

											{/* Platform Selection Summary */}
											{form.platforms.length > 0 && (
												<div className="mt-4 p-3 bg-[#C7A667]/10 dark:bg-[#C7A667]/20 rounded-lg border border-[#C7A667]/30">
													<div className="flex items-center gap-2">
														<svg className="w-4 h-4 text-[#C7A667]" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
														</svg>
														<span className="text-sm font-medium text-[#C7A667]">
															{form.platforms.length === 1 
																? `${form.platforms.includes('google') ? 'Google Ads' : 'Meta Ads'} selected`
																: 'Both platforms selected'
															}
														</span>
													</div>
												</div>
											)}
										</div>

										{/* Target Location Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
												Target Location *
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Geographic targeting</p>
															<p>Select the geographic areas where you want your ads to be shown. You can target multiple locations to reach a broader audience.</p>
															<p className="text-xs text-gray-300">💡 Tip: Target locations where your properties are located or where your ideal customers live.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												Search and select multiple geographic areas where you want your campaign to be shown. Press Enter or comma to add locations as tags.
											</p>
											<LocationDropdown
												value={form.targetLocation}
												onChange={(value) => setForm((f: any) => ({ ...f, targetLocation: value }))}
												placeholder="Search for countries, regions, or cities..."
												multiple={true}
											/>
										</div>

										{/* Target Age Group Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
												Target Age Group *
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Demographic targeting</p>
															<p>Select the age range of your ideal customers. This helps show your ads to people most likely to be interested in your properties.</p>
															<p className="text-xs text-gray-300">💡 Tip: Consider your property type - luxury properties often target older demographics, while starter homes target younger buyers.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												Select the age range of your target audience
											</p>
											<select 
												name="targetAgeGroup" 
												className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
												onChange={onChange}
											>
												<option value="18-24">18-24 years</option>
												<option value="25-34">25-34 years</option>
												<option value="35-44">35-44 years</option>
												<option value="45-54">45-54 years</option>
												<option value="55+">55+ years</option>
											</select>
										</div>

										{/* Audience Interests Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
												Audience Interests
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Interest-based targeting</p>
															<p>Add real estate related interests to better target your audience. This helps show your ads to people who are actively interested in these topics.</p>
															<p className="text-xs text-gray-300">💡 Tip: Use interests like "Real Estate Investment", "Luxury Living", or "First Time Buyers" to reach the right audience.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												Add real estate related interests to better target your audience (optional)
											</p>
											<TagInput
												value={form.audienceInterests}
												onChange={(interests) => setForm((f: any) => ({ ...f, audienceInterests: interests }))}
												placeholder="Type real estate interests..."
												suggestions={getFilteredInterests('', form.audienceInterests)}
												maxTags={8}
											/>
										</div>
									</div>

									{/* Right Column */}
									<div className="space-y-6">
										{/* Campaign Duration Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
												Campaign Duration *
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Campaign scheduling</p>
															<p>Set when your campaign should start and end. Your ads will only run during this period and your budget will be distributed across these dates.</p>
															<p className="text-xs text-gray-300">💡 Tip: Longer campaigns allow for better optimization and learning, while shorter campaigns are good for specific events or promotions.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
												Set the start and end dates for your campaign
											</p>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
													<input 
														name="startDate" 
														type="date" 
														className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
														onChange={onChange} 
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
													<input 
														name="endDate" 
														type="date" 
														className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors" 
														onChange={onChange} 
													/>
												</div>
											</div>
										</div>

										{/* Budget Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
													Campaign Budget *
											</label>
												<HelpIcon 
													content={
														<div className="space-y-2">
															<p className="font-semibold">Budget allocation</p>
															<p>Set your total campaign budget. This amount will be distributed across your campaign duration and used for ad placements on Google Ads.</p>
															<p className="text-xs text-gray-300">💡 Tip: Start with a smaller budget to test your targeting, then scale up based on performance. Minimum budget is $100.</p>
														</div>
													}
													position="right"
												/>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
												Set your total campaign budget (minimum $100)
											</p>
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
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Minimum budget: $100</p>
										</div>

										{/* Additional Creative Assets Section */}
										<div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
											<div className="flex items-center gap-2 mb-3">
												<svg className="w-5 h-5 text-[#C7A667]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												<label className="text-lg font-semibold text-gray-900 dark:text-white">
													Additional Creative Assets (Optional)
											</label>
														</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
												Upload custom images or videos to enhance your campaign
											</p>
											
											{/* File Upload */}
												<div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-lg p-4 text-center hover:border-[#C7A667] dark:hover:border-[#C7A667] transition-colors">
													<svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
														<path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
													</svg>
													<div>
														<label htmlFor="creative" className="cursor-pointer">
															<span className="block text-sm font-medium text-gray-900 dark:text-white">
															Upload custom assets
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

								{/* Action Buttons */}
								<div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
									{/* Left side - Save Draft */}
									<motion.button 
										className="px-6 py-3 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-200 dark:border-white/20" 
										onClick={handleSaveDraft}
										disabled={savingDraft || submitting}
										whileHover={{ scale: savingDraft || submitting ? 1 : 1.02 }}
										whileTap={{ scale: savingDraft || submitting ? 1 : 0.98 }}
									>
										{savingDraft ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300"></div>
												Saving Draft...
											</>
										) : (
											<>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
												</svg>
												Save Draft
											</>
										)}
									</motion.button>

									{/* Right side - Cancel and Launch */}
									<div className="flex gap-3">
									<button 
											className="px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
										onClick={() => setOpen(false)}
											disabled={submitting || savingDraft}
									>
										Cancel
								</button>
										
									<motion.button 
											className="relative px-8 py-3 bg-gradient-to-r from-[#C7A667] to-yellow-600 text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 overflow-hidden" 
										onClick={handleLaunch} 
											disabled={submitting || savingDraft}
											whileHover={{ 
												scale: submitting || savingDraft ? 1 : 1.05,
												boxShadow: submitting || savingDraft ? '0 10px 25px rgba(199, 166, 103, 0.4)' : '0 15px 35px rgba(199, 166, 103, 0.6)'
											}}
											whileTap={{ scale: submitting || savingDraft ? 1 : 0.95 }}
											animate={{
												boxShadow: submitting || savingDraft ? 
													'0 10px 25px rgba(199, 166, 103, 0.4)' : 
													[
														'0 10px 25px rgba(199, 166, 103, 0.4)',
														'0 15px 35px rgba(199, 166, 103, 0.6)',
														'0 10px 25px rgba(199, 166, 103, 0.4)'
													]
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: "easeInOut"
											}}
										>
											{/* Animated background effect */}
											<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-[#C7A667] opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
											
										{submitting ? (
											<>
													<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
													<span className="relative z-10">Launching Campaign...</span>
											</>
										) : (
											<>
													<svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
												</svg>
													<span className="relative z-10">Launch Campaign</span>
											</>
										)}
									</motion.button>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Property Selector Modal */}
			<PropertySelector
				isOpen={isPropertySelectorOpen}
				onClose={() => setIsPropertySelectorOpen(false)}
				properties={properties}
				selectedProperties={selectedProperties}
				onSelectionChange={handlePropertySelectionChange}
				loading={propertiesLoading}
			/>
		</div>
	);
}
