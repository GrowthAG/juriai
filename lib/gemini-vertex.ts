/**
 * Cliente Gemini com suporte a API Key direta (Google AI Studio / Gemini 3.6 Flash)
 * e fallback para Google Vertex AI (ADC).
 */
import { GoogleAuth } from "google-auth-library";

type JsonSchema = {
  type?: string;
  additionalProperties?: boolean;
  properties?: Record<string, unknown>;
  required?: readonly string[] | string[];
  items?: unknown;
  enum?: readonly string[] | string[];
  [key: string]: unknown;
};

type LlmContentBlock =
  | { type: "text"; text: string }
  | {
      type: "document";
      source: { type: "base64"; media_type: string; data: string };
    }
  | {
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    };

type LlmMessageContent = string | LlmContentBlock[];

export type GeminiVertexLlmClient = {
  messages: {
    create: (params: {
      model: string;
      max_tokens: number;
      thinking?: { type: "adaptive" };
      system: string;
      output_config: {
        format: {
          type: "json_schema";
          schema: JsonSchema;
        };
      };
      messages: Array<{
        role: "user";
        content: LlmMessageContent;
      }>;
    }) => Promise<{
      content: Array<{ type: string; text?: string }>;
      model: string;
      stop_reason?: string | null;
    }>;
  };
};

const auth = new GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export function toGeminiResponseSchema(schema: JsonSchema): Record<string, unknown> {
  const type = String(schema.type || "object").toUpperCase();
  const out: Record<string, unknown> = { type };

  if (schema.enum) out.enum = [...schema.enum];
  if (schema.required) out.required = [...schema.required];

  if (schema.properties && typeof schema.properties === "object") {
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      props[key] = toGeminiResponseSchema(value as JsonSchema);
    }
    out.properties = props;
  }

  if (schema.items) {
    out.items = toGeminiResponseSchema(schema.items as JsonSchema);
  }

  return out;
}

function contentToParts(content: LlmMessageContent): Array<Record<string, unknown>> {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  const parts: Array<Record<string, unknown>> = [];
  for (const block of content) {
    if (block.type === "text") {
      parts.push({ text: block.text });
      continue;
    }
    if (block.type === "document" || block.type === "image") {
      parts.push({
        inlineData: {
          mimeType: block.source.media_type,
          data: block.source.data,
        },
      });
    }
  }
  return parts.length > 0 ? parts : [{ text: "" }];
}

export function buildGeminiVertexClient(
  location?: string,
  projectId?: string,
): GeminiVertexLlmClient {
  return {
    messages: {
      async create(params) {
        const userParts: Array<Record<string, unknown>> = [];
        if (params.system?.trim()) {
          userParts.push({
            text: `INSTRUÇÕES DO SISTEMA:\n${params.system.trim()}\n\n---\n`,
          });
        }

        for (const message of params.messages) {
          userParts.push(...contentToParts(message.content));
        }

        const schema = toGeminiResponseSchema(
          params.output_config.format.schema as JsonSchema,
        );

        const body = {
          contents: [
            {
              role: "user",
              parts: userParts,
            },
          ],
          generationConfig: {
            maxOutputTokens: params.max_tokens,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        };

        // Chamadas sempre via Vertex AI + ADC. Nunca usar a API direta do
        // Google AI Studio, para que o consumo seja debitado dos créditos
        // oficiais do projeto no Cloud Billing (GenAI App Builder trial,
        // GFS Cloud Program, etc.).
        // Google Vertex AI via ADC
        const loc = (location || "us-central1").trim();
        const project = (projectId || "juriai-app").trim();
        const host =
          loc === "global"
            ? "https://aiplatform.googleapis.com"
            : `https://${loc}-aiplatform.googleapis.com`;
        const url = `${host}/v1/projects/${project}/locations/${loc}/publishers/google/models/${params.model}:generateContent`;

        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const token =
          typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          error?: { code?: number; status?: string; message?: string };
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
            finishReason?: string;
          }>;
          modelVersion?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error?.message || `Gemini API Error: ${response.status}`);
        }

        const text = (payload.candidates?.[0]?.content?.parts || [])
          .map((part) => part.text || "")
          .join("")
          .trim();

        if (!text) {
          throw new Error("Resposta da IA sem conteúdo de texto.");
        }

        const finish = payload.candidates?.[0]?.finishReason || null;
        return {
          content: [{ type: "text", text }],
          model: payload.modelVersion || params.model || "gemini-3.6-flash",
          stop_reason: finish === "SAFETY" ? "refusal" : finish,
        };
      },
    },
  };
}
