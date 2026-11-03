const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8080",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("NEWSDATA_API_KEY");
    if (!apiKey) {
      console.error("Missing NEWSDATA_API_KEY");
      return new Response("Server misconfigured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // NewsData.io endpoint: India, English
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("country", "in");
    url.searchParams.set("language", "en");
    // You can also: url.searchParams.set("category", "politics,legal");

    const resp = await fetch(url.toString());
    const json = await resp.json();

    const news = (json.results || []).map((a: any, idx: number) => ({
      id: a.link || String(idx),
      title: a.title ?? "No title",
      content: a.description ?? a.content ?? "",
      date: a.pubDate ?? new Date().toISOString(),
      link: a.link ?? "",
    }));

    return new Response(JSON.stringify({ news }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("court-news error", e);
    return new Response("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
