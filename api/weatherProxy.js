// /api/weatherProxy.js
export default async function handler(req, res) {
  try {
    const { lat, lon } = req.query;
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Weather API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Weather Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
}
