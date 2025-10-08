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
					<tr className={`text-left text-sm border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
						<th className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Title</th>
						<th className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Developer</th>
						<th className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</th>
						<th className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verified</th>
						<th className={`px-4 py-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map((row) => (
						<tr key={row.id} className={`text-sm border-b ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'}`}>
							<td className={`px-4 py-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.title}</td>
							<td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{row.developer}</td>
							<td className="px-4 py-3">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${
									row.status === 'LIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
									row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
									'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
								}`}>{row.status}</span>
							</td>
							<td className="px-4 py-3">
								{row.isVerified ? (
									<span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Verified</span>
								) : (
									<span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unverified</span>
								)}
							</td>
							<td className="px-4 py-3">
								<button
									className="px-3 py-1 bg-[#C7A667] text-black rounded-md text-xs font-medium hover:bg-[#B8965A] transition-colors"
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
