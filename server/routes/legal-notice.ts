import { RequestHandler } from "express";
import { LegalNoticeRequest, LegalNoticeResponse } from "@shared/api";
import fetch from "node-fetch";

export const handleGenerateNotice: RequestHandler = async (req, res) => {
  try {
    const { userName, opponentName, issueType, date, location, description } =
      req.body as LegalNoticeRequest;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to template if no API key is provided
      console.warn("OPENAI_API_KEY not found. Using template fallback.");
      const noticeContent = `
LEGAL NOTICE

Date: ${new Date().toLocaleDateString()}
Place: ${location}

To,
${opponentName}

Subject: Legal Notice regarding ${issueType}

Dear Sir/Madam,

I, ${userName}, am hereby serving you this legal notice regarding the matter of ${issueType} that occurred on ${date} at ${location}.

Description of the issue:
${description}

Please take note that you are required to address this matter within 15 days of receiving this notice. Failure to do so will leave me with no choice but to initiate appropriate legal proceedings against you in the court of law.

This is without prejudice to any other legal rights and remedies available to me.

Sincerely,

${userName}
    `.trim();
      return res.status(200).json({ content: noticeContent });
    }

    const systemPrompt = `
You are a legal document generator specialized in Indian Law. 
Generate a formal and structured Legal Notice based on the following details:
- Sender Name: ${userName}
- Opponent Name: ${opponentName}
- Issue Type: ${issueType}
- Date of Incident: ${date}
- Location: ${location}
- Description of Issue: ${description}

The notice should:
1. Be formal and professional.
2. Include sections like "Subject", "Statement of Facts", "Legal Grievance", and "Demand for Action".
3. Use a clear, authoritative tone.
4. Mention a 15-day notice period for response.
5. End with a formal closing.

Output ONLY the text of the legal notice.
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: "You are a professional legal document generator.",
            },
            { role: "user", content: systemPrompt },
          ],
        }),
      },
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("Failed to generate notice from AI");
    }

    const data = (await openaiResponse.json()) as any;
    const aiContent =
      data.choices?.[0]?.message?.content || "AI failed to generate content.";

    const response: LegalNoticeResponse = {
      content: aiContent,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error generating legal notice:", error);
    res.status(500).json({ error: "Failed to generate legal notice" });
  }
};
