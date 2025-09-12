export async function fetchCountryInfo(countryName) {
  const infoContainer = document.getElementById("info");
  if (!infoContainer) return;

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(
        countryName
      )}?fullText=true`
    );
    if (!response.ok) throw new Error("Country data not found.");

    const data = await response.json();
    const countryData = data[0];

    const capital = countryData.capital
      ? countryData.capital.join(", ")
      : "N/A";
    const population = countryData.population
      ? countryData.population.toLocaleString()
      : "N/A";
    const languages = countryData.languages
      ? Object.values(countryData.languages).join(", ")
      : "N/A";
    const region = countryData.region || "N/A";
    const subregion = countryData.subregion || "N/A";

    infoContainer.innerHTML = `
  <div class="overflow-hidden w-full rounded-b-lg">
    <div class="divide-y divide-gray-200">
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Capital city:</span>
        <span>${capital}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-white">
        <span class="font-medium">Population:</span>
        <span>${population}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Languages:</span>
        <span>${languages}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-white">
        <span class="font-medium">Region:</span>
        <span>${region}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Subregion:</span>
        <span>${subregion}</span>
      </div>
      </div>
  </div>
`;
    return countryData;
  } catch (error) {
    console.error("Error fetching country info:", error);
    infoContainer.innerHTML = `
      <div class="p-4">
        <p class="text-red">Sorry, we couldn't load country information.</p>
      </div>
    `;
    return null;
  }
}
