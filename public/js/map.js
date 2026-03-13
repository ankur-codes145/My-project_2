document.addEventListener('DOMContentLoaded', function () {
  const mapDiv = document.getElementById('map');
  if (!mapDiv || typeof L === 'undefined') return;

  let coords = [];
  try {
    coords = JSON.parse(mapDiv.dataset.coords || '[]');
  } catch (e) {
    console.warn('Invalid data-coords on #map:', mapDiv.dataset.coords);
  }

  const listingTitle = mapDiv.dataset.title || 'Listing';
  const listingLocation = mapDiv.dataset.location || 'Location not specified';

  const hasValidCoords =
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((value) => Number.isFinite(Number(value)));

  const center = hasValidCoords ? [Number(coords[1]), Number(coords[0])] : [28.6139, 77.209];
  const zoom = hasValidCoords ? 13 : 5;

  const map = L.map('map').setView(center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  if (typeof L.Control.geocoder === 'function') {
    L.Control.geocoder({ defaultMarkGeocode: false })
      .on('markgeocode', function (e) {
        const c = e.geocode.center;
        if (window.currentMarker) map.removeLayer(window.currentMarker);
        window.currentMarker = L.marker(c)
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.setView(c, 14);
      })
      .addTo(map);
  }

  const popupText = hasValidCoords
    ? `<b>${listingTitle}</b><br>${listingLocation}`
    : `<b>${listingTitle}</b><br>Exact coordinates not found. Showing default map.`;

  L.marker(center).addTo(map).bindPopup(popupText).openPopup();

  setTimeout(() => map.invalidateSize(), 100);
});
