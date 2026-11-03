import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages must be an array" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const latestUserMessage = messages[messages.length - 1]?.content || "";

    // 🚨 SAFETY CHECK
    const dangerKeywords = [
      "suicide",
      "kill myself",
      "harm",
      "violence",
      "murder",
    ];
    const isDangerous = dangerKeywords.some((word) =>
      latestUserMessage.toLowerCase().includes(word),
    );

    if (isDangerous) {
      return new Response(
        JSON.stringify({
          answer:
            "If you are facing an emergency or feeling unsafe, please contact local emergency services immediately. For mental health support in India, call Kiran Helpline: 1800-599-0019.",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 🧠 Check if a custom system prompt is provided in the messages
    const hasSystemPrompt = messages[0]?.role === "system";

    // Use the default Legal System Prompt if none is provided
    const defaultSystemPrompt = {
      role: "system",
      content: `
You are NyayaPath AI, a legal guidance assistant focused ONLY on Indian law.

Rules:
- Do NOT fabricate law sections or case names.
- If unsure, say "Insufficient information."
- Do NOT provide final legal advice.
- Provide general legal information only.
- Structure every answer EXACTLY in this format:

### Legal Category
### Relevant Law
### Your Rights
### Suggested Next Step
### When to Contact a Lawyer
### Confidence Level

Keep explanations simple in English or Hindi depending on user language.
`,
    };

    const finalMessages = hasSystemPrompt
      ? messages
      : [defaultSystemPrompt, ...messages];

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: finalMessages,
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const data = await openaiResponse.json();
    const answer = data.choices?.[0]?.message?.content || "No answer found.";

    return new Response(JSON.stringify({ answer }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
