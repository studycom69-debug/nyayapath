export async function GET() {
  if (!process.env.NEWS_API_KEY) {
    return Response.json({ error: "Missing NEWS_API_KEY" });
  }

  const indiaUrl = `https://newsapi.org/v2/everything?q=(India OR "Supreme Court" OR "High Court") AND (judgment OR verdict OR hearing)&language=en&sortBy=publishedAt&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`;
  const globalUrl = `https://newsapi.org/v2/everything?q=("Supreme Court" OR "High Court" OR court) AND (judgment OR verdict OR hearing)&language=en&sortBy=publishedAt&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`;

  const [india, global] = await Promise.all([
    fetch(indiaUrl).then((r) => r.json()),
    fetch(globalUrl).then((r) => r.json()),
  ]);

  return Response.json({ india, global });
}
