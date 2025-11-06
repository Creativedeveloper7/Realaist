import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { formatKES } from '../../utils/currency';

type Row = { 
	total_collected: number; 
	total_ad_spend: number; 
	platform_profit: number;
	total_campaigns: number;
	active_campaigns: number;
};

interface Campaign {
	id: string;
	campaign_name: string;
	user_budget: number;
	ad_spend: number;
	platform_fee: number;
	status: string;
	created_at: string;
	user_email?: string;
}

export default function RevenuePage() {
	const [from, setFrom] = useState('');
	const [to, setTo] = useState('');
	const [userEmail, setUserEmail] = useState('');
	const [summary, setSummary] = useState<Row | null>(null);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadRevenueData = async () => {
			setLoading(true);
			try {
				// Build query with filters
				let query = supabase.from('campaigns').select('*');
				
				if (from) query = query.gte('created_at', from);
				if (to) query = query.lte('created_at', to);
				
				const { data, error } = await query;
				if (error) throw error;

				// Filter by user email if provided
				let filteredData = data || [];
				if (userEmail) {
					// Note: This is a simplified filter - in production you'd join with users table
					filteredData = filteredData.filter((campaign: any) => 
						campaign.user_email?.toLowerCase().includes(userEmail.toLowerCase())
					);
				}

				// Calculate totals
				const totals = filteredData.reduce((acc, r) => {
					acc.total_collected += Number(r.user_budget || 0);
					acc.total_ad_spend += Number(r.ad_spend || 0);
					acc.platform_profit += Number(r.platform_fee || 0);
					acc.total_campaigns += 1;
					if (r.status === 'active') acc.active_campaigns += 1;
					return acc;
				}, { 
					total_collected: 0, 
					total_ad_spend: 0, 
					platform_profit: 0,
					total_campaigns: 0,
					active_campaigns: 0
				} as Row);

				setSummary(totals);
				setCampaigns(filteredData);
			} catch (error) {
				console.error('Error loading revenue data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadRevenueData();
	}, [from, to, userEmail]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Revenue Dashboard</h1>
				<p className="text-gray-600 mt-1">Platform revenue and campaign analytics</p>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-[#0E0E10] rounded-lg border border-gray-200 dark:border-white/10 p-6">
				<h2 className="text-lg font-semibold mb-4">Filters</h2>
				<div className="flex flex-wrap gap-4">
					<div>
						<label className="block text-sm font-medium mb-1">From Date</label>
						<input 
							type="date" 
							className="px-3 py-2 border rounded-lg dark:bg-white/5 dark:border-white/10 dark:text-white" 
							value={from} 
							onChange={(e) => setFrom(e.target.value)} 
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">To Date</label>
						<input 
							type="date" 
							className="px-3 py-2 border rounded-lg dark:bg-white/5 dark:border-white/10 dark:text-white" 
							value={to} 
							onChange={(e) => setTo(e.target.value)} 
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">User Email</label>
						<input 
							type="text" 
							placeholder="Filter by user email" 
							className="px-3 py-2 border rounded-lg dark:bg-white/5 dark:border-white/10 dark:text-white" 
							value={userEmail} 
							onChange={(e) => setUserEmail(e.target.value)} 
						/>
					</div>
				</div>
			</div>

			{/* Revenue Summary */}
			{loading ? (
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7A667]"></div>
				</div>
			) : summary ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					<motion.div 
						className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E0E10]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<p className="text-sm text-gray-500 mb-2">Total Collected</p>
						<p className="text-2xl font-bold text-blue-600">{formatKES(summary.total_collected)}</p>
						<p className="text-xs text-gray-400 mt-1">From all campaigns</p>
					</motion.div>
					
					<motion.div 
						className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E0E10]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<p className="text-sm text-gray-500 mb-2">Total Ad Spend</p>
						<p className="text-2xl font-bold text-orange-600">{formatKES(summary.total_ad_spend)}</p>
						<p className="text-xs text-gray-400 mt-1">Actual Google Ads spend</p>
					</motion.div>
					
					<motion.div 
						className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E0E10]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<p className="text-sm text-gray-500 mb-2">Platform Profit</p>
						<p className="text-2xl font-bold text-green-600">{formatKES(summary.platform_profit)}</p>
						<p className="text-xs text-gray-400 mt-1">Hidden fee revenue</p>
					</motion.div>
					
					<motion.div 
						className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E0E10]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<p className="text-sm text-gray-500 mb-2">Total Campaigns</p>
						<p className="text-2xl font-bold text-purple-600">{summary.total_campaigns}</p>
						<p className="text-xs text-gray-400 mt-1">All time</p>
					</motion.div>
					
					<motion.div 
						className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E0E10]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						<p className="text-sm text-gray-500 mb-2">Active Campaigns</p>
						<p className="text-2xl font-bold text-green-600">{summary.active_campaigns}</p>
						<p className="text-xs text-gray-400 mt-1">Currently running</p>
					</motion.div>
				</div>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-500">No revenue data found</p>
				</div>
			)}

			{/* Campaign Details Table */}
			{campaigns.length > 0 && (
				<div className="bg-white dark:bg-[#0E0E10] rounded-lg border border-gray-200 dark:border-white/10">
					<div className="p-6">
						<h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-gray-200 dark:border-white/10">
										<th className="text-left py-3 px-4 font-medium">Campaign</th>
										<th className="text-left py-3 px-4 font-medium">User Budget</th>
										<th className="text-left py-3 px-4 font-medium">Ad Spend</th>
										<th className="text-left py-3 px-4 font-medium">Platform Fee</th>
										<th className="text-left py-3 px-4 font-medium">Status</th>
										<th className="text-left py-3 px-4 font-medium">Created</th>
									</tr>
								</thead>
								<tbody>
									{campaigns.map((campaign, index) => (
										<motion.tr 
											key={campaign.id}
											className="border-b border-gray-100 dark:border-white/5"
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
										>
											<td className="py-3 px-4">
												<div>
													<p className="font-medium">{campaign.campaign_name}</p>
													<p className="text-sm text-gray-500">{campaign.user_email || 'N/A'}</p>
												</div>
											</td>
											<td className="py-3 px-4">{formatKES(campaign.user_budget)}</td>
											<td className="py-3 px-4">{formatKES(campaign.ad_spend)}</td>
											<td className="py-3 px-4">
												<span className="text-green-600 font-medium">
													{formatKES(campaign.platform_fee)}
												</span>
											</td>
											<td className="py-3 px-4">
												<span className={`px-2 py-1 rounded-full text-xs font-medium ${
													campaign.status === 'active' ? 'bg-green-100 text-green-800' :
													campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
													campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
													'bg-gray-100 text-gray-800'
												}`}>
													{campaign.status}
												</span>
											</td>
											<td className="py-3 px-4 text-sm text-gray-500">
												{new Date(campaign.created_at).toLocaleDateString()}
											</td>
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
