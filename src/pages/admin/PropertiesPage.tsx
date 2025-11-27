import React, { useEffect, useMemo, useState } from 'react';
import { AdminTable } from '../../components/admin/Table';
import { verifyPropertyAsAdmin } from '../../services/adminService';
import { propertiesService, Property } from '../../services/propertiesService';
import { Search, Filter, X } from 'lucide-react';

interface PropertiesPageProps {
	isDarkMode: boolean;
}

interface PropertyRow {
	id: string;
	title: string;
	developer: string;
	status: 'PENDING' | 'LIVE' | 'SOLD';
	isVerified: boolean;
	propertyType: string;
}

const PROPERTY_TYPES = [
	'All',
	'Apartment Complex',
	'Villa Development',
	'Townhouse Complex',
	'Penthouse',
	'Studio Complex',
	'Commercial Building',
	'Mixed Use Development',
	'Off-plan',
	'Land'
];

export default function PropertiesPage({ isDarkMode }: PropertiesPageProps) {
	const [allProperties, setAllProperties] = useState<Property[]>([]);
	const [rows, setRows] = useState<PropertyRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedType, setSelectedType] = useState<string>('All');
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const { properties } = await propertiesService.getPropertiesDirect();
			if (!mounted) return;
			
			setAllProperties(properties);
			
			const mapped = properties.map(p => {
				// Extract developer name with improved logic
				let developerName = '—';
				
				if (p.developer) {
					// Prioritize company name if available
					if (p.developer.companyName && p.developer.companyName.trim()) {
						developerName = p.developer.companyName.trim();
					} 
					// Fall back to first and last name
					else if (p.developer.firstName || p.developer.lastName) {
						const firstName = p.developer.firstName || '';
						const lastName = p.developer.lastName || '';
						developerName = `${firstName} ${lastName}`.trim();
					}
				} 
				// If no developer object but we have developerId, show a placeholder
				else if (p.developerId) {
					developerName = 'Unknown Developer';
				}
				
				return {
					id: p.id,
					title: p.title,
					developer: developerName,
					status: (p.status === 'active' ? 'LIVE' : p.status === 'sold' ? 'SOLD' : 'PENDING') as 'PENDING' | 'LIVE' | 'SOLD',
					isVerified: (p as any).is_verified ?? (p.status === 'active'),
					propertyType: p.propertyType || 'Unknown'
				};
			});
			setRows(mapped);
			setLoading(false);
		})();
		return () => { mounted = false; };
	}, []);

	const filteredRows = useMemo(() => {
		return rows.filter(row => {
			// Search filter
			const matchesSearch = searchTerm === '' || 
				row.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				row.developer.toLowerCase().includes(searchTerm.toLowerCase());
			
			// Type filter
			const matchesType = selectedType === 'All' || row.propertyType === selectedType;
			
			return matchesSearch && matchesType;
		});
	}, [rows, searchTerm, selectedType]);

	const handleVerify = async (id: string) => {
		const prev = rows;
		setRows(prev => prev.map(r => r.id === id ? { ...r, isVerified: true, status: 'LIVE' } : r));
		const res = await verifyPropertyAsAdmin(id);
		if (!res.ok) {
			console.error('Verify failed', res.error);
			setRows(prev); // revert
			alert('Verification failed: ' + res.error);
		}
	};

	const clearFilters = () => {
		setSearchTerm('');
		setSelectedType('All');
	};

	const hasActiveFilters = searchTerm !== '' || selectedType !== 'All';

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Properties</h1>
				<div className="flex items-center gap-2">
					{hasActiveFilters && (
						<button
							onClick={clearFilters}
							className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm ${
								isDarkMode 
									? 'bg-white/10 text-white hover:bg-white/20' 
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							} transition-colors`}
						>
							<X className="w-4 h-4" />
							Clear Filters
						</button>
					)}
					<span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						{filteredRows.length} of {rows.length} properties
					</span>
				</div>
			</div>

			{/* Search and Filter Section */}
			<div className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
				<div className="flex flex-col gap-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
						<input
							type="text"
							placeholder="Search by property name or developer..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
								isDarkMode
									? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/20'
									: 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300'
							} focus:outline-none focus:ring-2 focus:ring-[#C7A667]/20 transition-colors`}
						/>
					</div>

					{/* Filter Toggle */}
					<div className="flex items-center justify-between">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								isDarkMode
									? 'bg-white/10 text-white hover:bg-white/20'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							<Filter className="w-4 h-4" />
							Filter by Type
							{selectedType !== 'All' && (
								<span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
									isDarkMode ? 'bg-[#C7A667] text-black' : 'bg-[#C7A667] text-black'
								}`}>
									1
								</span>
							)}
						</button>
					</div>

					{/* Property Type Filters */}
					{showFilters && (
						<div className="pt-2 border-t border-white/10 dark:border-gray-200">
							<div className="flex flex-wrap gap-2">
								{PROPERTY_TYPES.map((type) => (
									<button
										key={type}
										onClick={() => setSelectedType(type)}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											selectedType === type
												? 'bg-[#C7A667] text-black'
												: isDarkMode
													? 'bg-white/10 text-white hover:bg-white/20'
													: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{type}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{loading ? (
				<div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading…</div>
			) : filteredRows.length === 0 ? (
				<div className={`p-8 text-center rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
					<p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						{hasActiveFilters 
							? 'No properties found matching your filters. Try adjusting your search or filter criteria.'
							: 'No properties found.'}
					</p>
				</div>
			) : (
				<AdminTable items={filteredRows} onVerify={handleVerify} isDarkMode={isDarkMode} />
			)}
		</div>
	);
}
