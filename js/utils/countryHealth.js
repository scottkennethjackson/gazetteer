export async function fetchCountryHealth(countryData) {
  const healthContainer = document.getElementById("health");
  if (!healthContainer) return;

  try {
    if (!countryData || !countryData.cca3) {
      healthContainer.innerHTML = `
        <div class="p-4 text-red-600">Health information unavailable.</div>
      `;
      return;
    }

    const countryCode = countryData.cca3;

    const endpoints = {
      lifeExpectancy: `https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim eq '${countryCode}'`,
      doctors: `https://ghoapi.azureedge.net/api/HRH_0001?$filter=SpatialDim eq '${countryCode}'`,
      expenditure: `https://ghoapi.azureedge.net/api/SHA_XPDPC?$filter=SpatialDim eq '${countryCode}'`,
      obesity: `https://ghoapi.azureedge.net/api/NCD_BMI_30A?$filter=SpatialDim eq '${countryCode}'`,
      immunisation: `https://ghoapi.azureedge.net/api/WHS4_539?$filter=SpatialDim eq '${countryCode}'`,
    };

    async function fetchMetric(url, countryCode) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.value || data.value.length === 0) {
          console.warn(`No WHO data found for ${countryCode} at ${url}`);
          return "N/A";
        }

        const sorted = data.value
          .filter((item) => item.NumericValue !== null)
          .sort((a, b) => b.TimeDim - a.TimeDim);

        if (sorted.length === 0) {
          console.warn(`WHO returned empty data for ${countryCode} at ${url}`);
          return "N/A";
        }

        return sorted[0].NumericValue;
      } catch (error) {
        console.error(`Error fetching WHO data for ${countryCode}:`, error);
        return "N/A";
      }
    }

    const [lifeExpectancy, doctors, expenditure, obesity, immunisation] =
      await Promise.all([
        fetchMetric(endpoints.lifeExpectancy, countryCode),
        fetchMetric(endpoints.doctors, countryCode),
        fetchMetric(endpoints.expenditure, countryCode),
        fetchMetric(endpoints.obesity, countryCode),
        fetchMetric(endpoints.immunisation, countryCode),
      ]);

    healthContainer.innerHTML = `
      <div class="overflow-hidden w-full rounded-b-lg">
        <div class="divide-y divide-gray-200">
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Life Expectancy:</span>
            <span>${
              lifeExpectancy !== "N/A" ? lifeExpectancy + " years" : "N/A"
            }</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">Doctors per 1,000:</span>
            <span>${doctors !== "N/A" ? doctors.toFixed(2) : "N/A"}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Healthcare Expenditure:</span>
            <span>${
              expenditure !== "N/A" ? "$" + expenditure.toLocaleString() : "N/A"
            }</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">Adult Obesity Rate:</span>
            <span>${obesity !== "N/A" ? obesity.toFixed(1) + "%" : "N/A"}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Immunisation Rate:</span>
            <span>${
              immunisation !== "N/A" ? immunisation.toFixed(1) + "%" : "N/A"
            }</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching health data:", error);
    healthContainer.innerHTML = `
      <div class="p-4 text-red-600">Sorry, we couldn't load health information.</div>
    `;
  }
}
