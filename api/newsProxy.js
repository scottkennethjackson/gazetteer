export default async function handler(req, res) {
  try {
    const { country, name } = req.query;
    const NEWS_API_KEY = process.env.NEWS_API_KEY;

    let url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=3&apiKey=${NEWS_API_KEY}`;
    let response = await fetch(url);
    let data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.log(`No headlines for ${country}, falling back to search...`);
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        name
      )}&pageSize=3&language=en&apiKey=${NEWS_API_KEY}`;
      response = await fetch(url);
      data = await response.json();
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("News Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
