export async function fetchCountryHealth(countryData) {
  const healthContainer = document.getElementById("health");
  if (!healthContainer) return;

  const countryCode = countryData.cca3;
  if (!countryCode) {
    console.warn("Missing country code for health data");
    healthContainer.innerHTML = `
      <div class="p-4">
        <p class="text-red-600">Health information unavailable.</p>
      </div>
    `;
    return;
  }

  const indicators = {
    lifeExpectancy: "SP.DYN.LE00.IN",
    doctors: "SH.MED.PHYS.ZS",
    fertility: "SP.DYN.TFRT.IN",
    immunisation: "SH.IMM.IDPT",
    expenditure: "SH.XPD.CHEX.GD.ZS",
  };

  async function fetchMetric(indicator) {
    try {
      const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();

      if (!Array.isArray(data) || !data[1] || data[1].length === 0)
        return "N/A";

      const latest = data[1].find((entry) => entry.value !== null);
      return latest ? latest.value : "N/A";
    } catch (error) {
      console.error(`Error fetching ${indicator} for ${countryCode}:`, error);
      return "N/A";
    }
  }

  const [lifeExpectancy, doctors, fertility, immunisation, expenditure] =
    await Promise.all([
      fetchMetric(indicators.lifeExpectancy),
      fetchMetric(indicators.doctors),
      fetchMetric(indicators.fertility),
      fetchMetric(indicators.immunisation),
      fetchMetric(indicators.expenditure),
    ]);

  const formatNumber = (value, decimals = 1) =>
    value !== "N/A" && !isNaN(value)
      ? parseFloat(value).toFixed(decimals)
      : "N/A";

  healthContainer.innerHTML = `
    <div class="overflow-hidden w-full rounded-b-lg">
      <div class="divide-y divide-gray-200">
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
          <span class="font-medium">Life expectancy:</span>
          <span>${formatNumber(lifeExpectancy, 1)} years</span>
        </div>
        <div class="flex justify-between items-center px-4 py-2 bg-white">
          <span class="font-medium">Doctors per 1,000 people:</span>
          <span>${formatNumber(doctors, 0)}</span>
        </div>
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
          <span class="font-medium">Fertility rate (births per woman):</span>
          <span>${formatNumber(fertility, 2)}</span>
        </div>
        <div class="flex justify-between items-center px-4 py-2 bg-white">
          <span class="font-medium">Immunisation rate:</span>
          <span>${formatNumber(immunisation, 0)}%</span>
        </div>
        <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
          <span class="font-medium">Healthcare expenditure (% GDP):</span>
          <span>${formatNumber(expenditure, 2)}%</span>
        </div>
      </div>
    </div>
  `;
}
