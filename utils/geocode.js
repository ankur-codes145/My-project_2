const DEFAULT_GEOMETRY = {
  type: 'Point',
  coordinates: [77.209, 28.6139], // New Delhi fallback
};

function buildSearchQuery(location = '', country = '') {
  return [location, country].map((v) => (v || '').trim()).filter(Boolean).join(', ');
}

async function geocodeLocation(location = '', country = '') {
  const query = buildSearchQuery(location, country);
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'wanderlust-app/1.0 (educational project)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;
    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const lat = Number.parseFloat(results[0].lat);
    const lon = Number.parseFloat(results[0].lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    return {
      type: 'Point',
      coordinates: [lon, lat],
    };
  } catch (error) {
    console.warn('Geocoding failed:', error.message);
    return null;
  }
}

module.exports = {
  geocodeLocation,
  DEFAULT_GEOMETRY,
};
