// api/property-og/[id].js

// On Vercel (Node 18+), global fetch is available, no need to import node-fetch.

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('Missing id');
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).send('Supabase environment variables not configured');
  }

  try {
    // 1) Fetch property from Supabase REST
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?id=eq.${encodeURIComponent(
        id
      )}&select=id,title,description,location,price,images`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!resp.ok) {
      return res.status(404).send('Property not found');
    }

    const data = await resp.json();
    const prop = data[0];

    if (!prop) {
      return res.status(404).send('Property not found');
    }

    // 2) Prepare values
    const title = prop.title || 'Property on Realaist';
    const location = prop.location || '';
    const baseDescription =
      prop.description ||
      (location
        ? `Discover this property in ${location}.`
        : 'Discover this property on Realaist.');

    const description = truncate(baseDescription, 200);

    let priceText = 'Contact for price';
    if (typeof prop.price === 'number') {
      try {
        priceText = `KSh ${prop.price.toLocaleString()}`;
      } catch {
        priceText = `KSh ${prop.price}`;
      }
    }

    const images = Array.isArray(prop.images) ? prop.images : [];
    const imageUrl =
      images[0] ||
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600';

    const fullUrl = `https://www.realaist.tech/p/${id}`;

    // 3) HTML with OG tags
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>

  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(
    `${description} (${priceText})`
  )}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(fullUrl)}" />
  <meta property="og:type" content="website" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
</head>
<body>
  <p>Redirecting to property...</p>
  <script>
    if (typeof window !== 'undefined') {
      window.location.href = "${fullUrl}";
    }
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    console.error('property-og error', err);
    return res.status(500).send('Internal error');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, max) {
  const s = String(str);
  if (s.length <= max) return s;
  return s.slice(0, max - 3) + '...';
}