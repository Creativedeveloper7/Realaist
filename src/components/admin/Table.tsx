import React from 'react';

type PropertyRow = {
	id: string;
	title: string;
	developer: string;
	status: 'PENDING' | 'LIVE' | 'SOLD';
	isVerified: boolean;
};

interface TableProps {
	items: PropertyRow[];
	onVerify: (id: string) => void;
	isDarkMode?: boolean;
}

export const AdminTable: React.FC<TableProps> = ({ items, onVerify, isDarkMode }) => {
	return (
		<div className={`overflow-x-auto rounded-xl ${isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'}`}>
			<table className="w-full">
				<thead>
					<tr className="text-left text-sm border-b border-gray-200 dark:border-white/10">
						<th className="px-4 py-3">Title</th>
						<th className="px-4 py-3">Developer</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3">Verified</th>
						<th className="px-4 py-3">Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map((row) => (
						<tr key={row.id} className="text-sm border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
							<td className="px-4 py-3 font-medium">{row.title}</td>
							<td className="px-4 py-3">{row.developer}</td>
							<td className="px-4 py-3">
								<span className={`px-2 py-1 rounded-full text-xs ${
									row.status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
									row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
									'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
								}`}>{row.status}</span>
							</td>
							<td className="px-4 py-3">
								{row.isVerified ? (
									<span className="text-green-600 text-xs">Verified</span>
								) : (
									<span className="text-gray-500 text-xs">Unverified</span>
								)}
							</td>
							<td className="px-4 py-3">
								<button
									className="px-3 py-1 bg-[#C7A667] text-black rounded-md text-xs"
									onClick={() => onVerify(row.id)}
								>
									Verify
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
