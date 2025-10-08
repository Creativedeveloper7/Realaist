import React, { useEffect, useMemo, useState } from 'react';
import { AdminTable } from '../../components/admin/Table';
import { verifyPropertyAsAdmin } from '../../services/adminService';
import { propertiesService } from '../../services/propertiesService';

interface PropertiesPageProps {
	isDarkMode: boolean;
}

export default function PropertiesPage({ isDarkMode }: PropertiesPageProps) {
	const [rows, setRows] = useState<{ id: string; title: string; developer: string; status: 'PENDING' | 'LIVE' | 'SOLD'; isVerified: boolean; }[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const { properties } = await propertiesService.getPropertiesDirect();
			if (!mounted) return;
			
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
					isVerified: (p as any).is_verified ?? (p.status === 'active')
				};
			});
			setRows(mapped);
			setLoading(false);
		})();
		return () => { mounted = false; };
	}, []);

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

	return (
		<div className="space-y-4">
			<h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Properties</h1>
			{loading ? (
				<div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading…</div>
			) : (
				<AdminTable items={rows} onVerify={handleVerify} isDarkMode={isDarkMode} />
			)}
		</div>
	);
}
