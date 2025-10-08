import React, { useEffect, useMemo, useState } from 'react';
import { AdminTable } from '../../components/admin/Table';
import { verifyPropertyAsAdmin } from '../../services/adminService';
import { propertiesService } from '../../services/propertiesService';

export default function PropertiesPage() {
	const [rows, setRows] = useState<{ id: string; title: string; developer: string; status: 'PENDING' | 'LIVE' | 'SOLD'; isVerified: boolean; }[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const { properties } = await propertiesService.getPropertiesDirect();
			if (!mounted) return;
			const mapped = properties.map(p => ({
				id: p.id,
				title: p.title,
				developer: p.developer?.companyName || `${p.developer?.firstName || ''} ${p.developer?.lastName || ''}`.trim() || '—',
				status: (p.status === 'active' ? 'LIVE' : p.status === 'sold' ? 'SOLD' : 'PENDING') as 'PENDING' | 'LIVE' | 'SOLD',
				isVerified: (p as any).is_verified ?? (p.status === 'active')
			}));
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
			<h1 className="text-xl font-bold">All Properties</h1>
			{loading ? (
				<div className="text-sm text-gray-500">Loading…</div>
			) : (
				<AdminTable items={rows} onVerify={handleVerify} />
			)}
		</div>
	);
}
