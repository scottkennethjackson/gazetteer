export async function fetchCountryMoney(countryData) {
  const moneyContainer = document.getElementById("money");
  if (!moneyContainer) return;

  try {
    if (!countryData || !countryData.currencies) {
      moneyContainer.innerHTML = `
        <div class="p-4 text-red">Currency information unavailable.</div>
      `;
      return;
    }

    const [currencyCode] = Object.keys(countryData.currencies);
    const { name: currencyName, symbol: currencySymbol } =
      countryData.currencies[currencyCode];

    const response = await fetch(`/api/moneyProxy?base=${currencyCode}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.rates) {
      moneyContainer.innerHTML = `
        <div class="p-4 text-red">Exchange rate data unavailable.</div>
      `;
      console.error("API Error:", data.error?.info || "Unknown error");
      return;
    }

    const rates = data.quotes;
    const usdRate = rates[`${currencyCode}USD`] || "N/A";
    const eurRate = rates[`${currencyCode}EUR`] || "N/A";
    const gbpRate = rates[`${currencyCode}GBP`] || "N/A";

    moneyContainer.innerHTML = `
  <div class="overflow-hidden w-full rounded-b-lg">
        <div class="divide-y divide-gray-200">
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Currency:</span>
            <span>${currencyName} (${currencyCode})</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">Symbol:</span>
            <span>${currencySymbol || "-"}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">1.00 ${currencyCode} → USD:</span>
            <span>${
              typeof usdRate === "number" ? `$${usdRate.toFixed(4)}` : "N/A"
            }</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">1.00 ${currencyCode} → EUR:</span>
            <span>${
              typeof eurRate === "number" ? `€${eurRate.toFixed(4)}` : "N/A"
            }</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">1.00 ${currencyCode} → GBP:</span>
            <span>${
              typeof gbpRate === "number" ? `£${gbpRate.toFixed(4)}` : "N/A"
            }</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    moneyContainer.innerHTML = `
      <div class="p-4 text-red">Sorry, we couldn't load currency information.</div>
    `;
  }
}
