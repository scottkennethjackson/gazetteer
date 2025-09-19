export async function fetchCountryPlaces(countryCode, map) {
  try {
    const response = await fetch(`/api/placesProxy?country=${countryCode}`);
    if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);

    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      console.log("No tourist attractions found.");
      return;
    }

    data.features.forEach((place) => {
      const coords = place.geometry.coordinates;
      const name = place.properties.name || "Unnamed Attraction";

      const marker = L.marker([coords[1], coords[0]]).addTo(map);

      let popupContent = `<strong>${name}</strong>`;

      if (place.properties.categories) {
        popupContent += `<br><em>${place.properties.categories.join(", ")}</em>`;
      }

      if (place.properties.osm_id) {
        popupContent += `<br><a href="https://www.openstreetmap.org/${place.properties.osm_type}/${place.properties.osm_id}" target="_blank">View on OSM</a>`;
      }

      marker.bindPopup(popupContent);
    });
  } catch (error) {
    console.error("Error fetching attractions:", error);
  }
}
