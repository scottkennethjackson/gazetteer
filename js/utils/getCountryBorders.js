export async function getCountryBorders() {
  try {
    const response = await fetch('../json/countryBorders.geo.json');
    if (!response.ok) throw new Error('Failed to load country borders');
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return null;
  }
}
