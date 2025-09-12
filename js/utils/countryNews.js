export async function fetchCountryNews(countryData) {
  const newsContainer = document.getElementById("news");
  if (!newsContainer) return;

  const countryCode = countryData.cca2.toLowerCase();
  const countryName = countryData.name.common;

  try {
    const response = await fetch(
      `/api/newsProxy?country=${countryCode}&name=${countryName}`
    );
    if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);

    const data = await response.json();
    if (!data.articles || data.articles.length === 0) {
      newsContainer.innerHTML = `<p class="p-4 text-red">No news available for this country.</p>`;
      return;
    }

    newsContainer.innerHTML = `
      <div class="overflow-hidden w-full rounded-b-lg">
      <div class="divide-y divide-gray-200">
        ${data.articles
          .slice(0, 3)
          .map(
            (article, index) => `
        <div class="flex p-4 space-x-4 ${
          index % 2 === 0 ? "bg-gray-50" : "bg-white"
        }">
          <img src="${article.urlToImage || "./assets/icons/news.svg"}" 
               alt="Thumbnail" class="w-1/3 xm:w-1/2 object-cover rounded-lg">
          <div class="flex flex-col justify-between h-fill">
            <h3 class="text-lg font-semibold">${article.title}</h3>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" 
               class="text-sm text-red hover:underline">
              Read More →
            </a>
          </div>
        </div>
      `
          )
          .join("")}
      </div>
      </div>`;
  } catch (error) {
    console.error("Error fetching news:", error);
    newsContainer.innerHTML = `<p class="p-4">Sorry, news could not be loaded.</p>`;
  }
}
