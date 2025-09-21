export default async function handler(req, res) {
  try {
    const { country } = req.query;
    const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

    if (!country) {
      return res.status(400).json({ error: "Missing country code" });
    }

    const url = `https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=countrycode:${country}&limit=20&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Places API error", details: data });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Places Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
}
