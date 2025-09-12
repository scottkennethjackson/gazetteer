export async function fetchCountryWeather(lat, lon, countryName) {
  const weatherContainer = document.getElementById("weather");
  if (!weatherContainer) return;

  try {
    const response = await fetch(`/api/weatherProxy?lat=${lat}&lon=${lon}`);
    if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);

    const data = await response.json();

    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const description = data.weather[0].description;
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const isDay = data.weather[0].icon.includes("d");
    const bgClass = isDay ? "bg-gradient-to-br from-sky-200 to-sky-300" : "bg-gradient-to-br from-gray-800 to-gray-900 text-white";

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    weatherContainer.innerHTML = `
      <div class="overflow-hidden w-full rounded-b-lg">
        <div class="flex justify-between items-center px-4 py-2 ${bgClass} bg-opacity-50">
          <div>
            <p class="text-4xl">${temp}°C</p>
            <p class="text-sm"><span class="font-bold">${tempMax}°C</span> | ${tempMin}°C</p>
          </div>
          <img src="${icon}" alt="Weather Icon" class="w-20 h-20">
        </div>
        <div class="divide-y divide-gray-200">
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Condition:</span>
            <span class="capitalize">${description}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">Humidity:</span>
            <span>${humidity}%</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Wind speed:</span>
            <span>${windSpeed} m/s</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-white">
            <span class="font-medium">Sunrise:</span>
            <span>${sunrise}</span>
          </div>
          <div class="flex justify-between items-center px-4 py-2 bg-gray-50">
            <span class="font-medium">Sunset:</span>
            <span>${sunset}</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching weather:", error);
    weatherContainer.innerHTML = `<p class="p-4 text-red">Weather data unavailable.</p>`;
  }
}
