document.addEventListener("DOMContentLoaded", function () {
  const mapDiv = document.getElementById("map");
  if (!mapDiv) return;

  let coords = [];
  try {
    coords = JSON.parse(mapDiv.dataset.coords || "[]");
  } catch (e) {
    console.warn("Invalid data-coords on #map:", mapDiv.dataset.coords);
  }

  const listingTitle = mapDiv.dataset.title || "Listing";
  const listingLocation = mapDiv.dataset.location || "Location not specified";

  const center = coords.length === 2 ? [coords[1], coords[0]] : [28.6139, 77.2090];

  const map = L.map("map").setView(center, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  
  if (typeof L.Control.geocoder === "function") {
    L.Control.geocoder({ defaultMarkGeocode: false })
      .on("markgeocode", function (e) {
        const c = e.geocode.center;
        if (window.currentMarker) map.removeLayer(window.currentMarker);
        window.currentMarker = L.marker(c)
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        map.setView(c, 14);
      })
      .addTo(map);
  } else {
    console.warn("Geocoder plugin not found. Did you include leaflet-control-geocoder.js?");
  }

  // Add a marker at the center
  L.marker(center)
    .addTo(map)
    .bindPopup(`<b>${listingTitle}</b><br>${listingLocation}`)
    .openPopup();
});
