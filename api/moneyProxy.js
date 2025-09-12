export default async function handler(req, res) {
  try {
    const { base } = req.query;
    const MONEY_API_KEY = process.env.MONEY_API_KEY;

    const url = `https://api.exchangerate.host/live?access_key=${MONEY_API_KEY}&source=${base}&currencies=USD,EUR,GBP&format=1`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Exchange API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Money Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
}
