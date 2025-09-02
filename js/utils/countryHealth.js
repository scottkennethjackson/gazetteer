async function fetchMetric(endpoint, countryCode) {
  try {
    const proxyUrl = `/api/whoProxy?url=${encodeURIComponent(endpoint)}`;
    const res = await fetch(proxyUrl);

    if (!res.ok) throw new Error(`Proxy failed: ${res.status}`);
    const data = await res.json();

    if (!data.value || data.value.length === 0) {
      console.warn(`No WHO data found for ${countryCode}`);
      return "N/A";
    }

    const sorted = data.value
      .filter(item => item.NumericValue !== null)
      .sort((a, b) => b.TimeDim - a.TimeDim);

    return sorted.length > 0 ? sorted[0].NumericValue : "N/A";
  } catch (error) {
    console.error(`Error fetching WHO data for ${countryCode}:`, error);
    return "N/A";
  }
}

const endpoints = {
  lifeExpectancy: `https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim eq '${countryCode}'`,
  doctors: `https://ghoapi.azureedge.net/api/HRH_0001?$filter=SpatialDim eq '${countryCode}'`,
  expenditure: `https://ghoapi.azureedge.net/api/SHA_XPDPC?$filter=SpatialDim eq '${countryCode}'`,
  obesity: `https://ghoapi.azureedge.net/api/NCD_BMI_30A?$filter=SpatialDim eq '${countryCode}'`,
  immunisation: `https://ghoapi.azureedge.net/api/WHS4_539?$filter=SpatialDim eq '${countryCode}'`
};

const [lifeExpectancy, doctors, expenditure, obesity, immunisation] = await Promise.all([
  fetchMetric(endpoints.lifeExpectancy, countryCode),
  fetchMetric(endpoints.doctors, countryCode),
  fetchMetric(endpoints.expenditure, countryCode),
  fetchMetric(endpoints.obesity, countryCode),
  fetchMetric(endpoints.immunisation, countryCode)
]);

const healthContainer = document.getElementById("health");
healthContainer.innerHTML = `
  <div class="overflow-hidden w-full rounded-b-lg">
    <div class="divide-y divide-gray-200">
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Life Expectancy:</span>
        <span>${lifeExpectancy} years</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-white">
        <span class="font-medium">Doctors per 1,000:</span>
        <span>${doctors}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Healthcare Expenditure (% GDP):</span>
        <span>${expenditure}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-white">
        <span class="font-medium">Obesity Rate (%):</span>
        <span>${obesity}</span>
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
        <span class="font-medium">Immunisation Rate (%):</span>
        <span>${immunisation}</span>
      </div>
    </div>
  </div>
`;
