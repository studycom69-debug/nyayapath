const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const NEWS_API_KEY = "afd017fb400f4bec9e317a0ec7f928d8";

app.use(cors());
app.use(express.json());

app.get("/api/court-news", async (req, res) => {
  try {
    console.log("🔄 Fetching court news from NewsAPI...");

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=supreme%20court%20OR%20high%20court%20india&sortBy=publishedAt&language=en&pageSize=10`,
      {
        headers: {
          "X-API-Key": NEWS_API_KEY,
        },
      },
    );

    console.log("📊 API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", response.status, errorText);
      return res.status(response.status).json({
        error: `NewsAPI Error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Transform NewsAPI response to our format
    const news = data.articles.map((article) => ({
      id: article.url,
      title: article.title,
      content: article.description || article.content,
      date: article.publishedAt,
      link: article.url,
    }));

    console.log("✅ Success! Fetched", news.length, "articles");

    res.json({ news });
  } catch (error) {
    console.error("💥 Server Error:", error.message);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running at http://localhost:${PORT}`);
  console.log(
    `📡 Court news endpoint: http://localhost:${PORT}/api/court-news`,
  );
});
