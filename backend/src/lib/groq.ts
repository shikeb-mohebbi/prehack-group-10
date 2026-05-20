// ─────────────────────────────────────────────────────────────
// Groq API wrapper
//
// Thin layer around the Groq chat completions endpoint
// (which is compatible with the OpenAI chat API format).
// All AI features in the app (workouts, meals, chat, calorie,
// supplements) call groqChat() to get a response from the model.
//
// Docs: https://console.groq.com/docs/api-reference
// ─────────────────────────────────────────────────────────────

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Default model used for all non-vision calls (overridable via .env).
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

// ── Message content types ─────────────────────────────────────
// A message can contain plain text, or an array of text + image
// parts (used only by vision-capable models).
type TextContent  = { type: "text";      text: string };
type ImageContent = { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | Array<TextContent | ImageContent>;
};

// ── groqChat ──────────────────────────────────────────────────
// Sends a list of messages to the Groq API and returns the
// model's reply as a plain string.
//
// Options:
//   json        — adds response_format: json_object (not supported by all vision models)
//   model       — override the model (e.g. a vision model for calorie photo analysis)
//   temperature — controls creativity (lower = more deterministic)
export async function groqChat(
  messages: ChatMessage[],
  opts: { json?: boolean; model?: string; temperature?: number } = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  // Fail fast if the key is missing — gives a clear error instead of a 401.
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured on the server");

  const body: any = {
    model: opts.model || MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
  };

  // json mode tells the model it MUST reply with a JSON object.
  // Do NOT set this for vision models — they don't support response_format.
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  // choices[0].message.content holds the model's reply text.
  return data.choices?.[0]?.message?.content ?? "";
}

// ── safeParseJson ─────────────────────────────────────────────
// Tries to parse the model's raw text output as JSON.
// Handles two common model quirks:
//   1. The model wraps the JSON in ```json ... ``` markdown fences.
//   2. The model adds prose before/after the JSON object.
// Throws a user-friendly error if no valid JSON can be found.
export function safeParseJson<T = any>(raw: string): T {
  let s = raw.trim();

  // Strip opening ``` or ```json fence.
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }

  // Slice from the first { to the last } to ignore any surrounding prose.
  const first = s.indexOf("{");
  const last  = s.lastIndexOf("}");
  if (first !== -1 && last !== -1) s = s.slice(first, last + 1);

  try {
    return JSON.parse(s) as T;
  } catch {
    throw new Error("AI response was not valid JSON. Please try again.");
  }
}
