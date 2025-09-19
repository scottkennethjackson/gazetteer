export default async function handler(req, res) {
  try {
    const { country } = req.query;
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=countrycode:${country}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Places API error" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Places Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
}
