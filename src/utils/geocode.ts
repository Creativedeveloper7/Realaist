/**
 * Reverse-geocode lat/lng to a short place name (e.g. "Kikuyu, Kiambu") using Nominatim.
 * Used when a property has coordinates but location text is "Current location", so we show the real area name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'RealaistPropertyApp/1.0 (https://realaist.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address;
    if (!addr) return null;
    const place = addr.village || addr.town || addr.city || addr.municipality || addr.suburb || addr.county || addr.state;
    const area = addr.county && addr.county !== place ? addr.county : addr.state;
    if (place && area && place !== area) return `${place}, ${area}`;
    if (place) return place;
    if (addr.state && addr.country) return `${addr.state}, ${addr.country}`;
    return data.display_name?.split(',')[0]?.trim() || null;
  } catch {
    return null;
  }
}
