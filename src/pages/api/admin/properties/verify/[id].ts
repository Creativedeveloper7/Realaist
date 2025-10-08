// Next.js API Route: /api/admin/properties/verify/[id]
// If you're not using Next.js, ignore this file and use src/server/api/admin/properties.ts instead.

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ ok: false, error: 'method_not_allowed' });
	}
	try {
		const { id } = req.query as { id: string };
		// TODO: Validate admin session here
		// TODO: Update DB via Prisma or SQL
		// await prisma.property.update({ where: { id }, data: { isVerified: true, status: 'LIVE' } })
		return res.status(200).json({ ok: true, id });
	} catch (e: any) {
		return res.status(500).json({ ok: false, error: e?.message || 'unknown_error' });
	}
}
