export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing WHO API URL" });
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `WHO API error: ${response.statusText}`,
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("WHO Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch WHO data" });
  }
}
