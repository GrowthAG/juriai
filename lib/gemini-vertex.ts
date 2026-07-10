/**
 * Cliente Gemini no Vertex AI com a mesma superfície mínima usada pelo
 * runtime Anthropic (messages.create), para reutilizar analyze/draft/extract/copilot.
 *
 * Auth: ADC (GoogleAuth / cloud-platform). Não usa ANTHROPIC_API_KEY.
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
      thinking: { type: "adaptive" };
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

function buildGenerateContentUrl(
  projectId: string,
  location: string,
  model: string,
) {
  const host =
    location === "global"
      ? "https://aiplatform.googleapis.com"
      : `https://${location}-aiplatform.googleapis.com`;
  return `${host}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
}

/** Converte JSON Schema (Anthropic-style) para schema aceito pelo Vertex Gemini. */
export function toGeminiResponseSchema(schema: JsonSchema): Record<string, unknown> {
  const type = String(schema.type || "object").toLowerCase();
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

  // Gemini rejeita additionalProperties em vários modos; omitimos.
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

async function getAccessToken(): Promise<string> {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token =
    typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
  if (!token) {
    throw Object.assign(new Error("Falha ao obter credencial ADC do Google."), {
      status: 401,
      code: "UNAUTHENTICATED",
    });
  }
  return token;
}

export function buildGeminiVertexClient(
  location: string,
  projectId: string,
): GeminiVertexLlmClient {
  const loc = location.trim();
  const project = projectId.trim();
  if (!loc || !project) {
    throw new Error("Região e projectId são obrigatórios para Gemini Vertex.");
  }

  return {
    messages: {
      async create(params) {
        const userParts: Array<Record<string, unknown>> = [];
        // System vira prefixo no primeiro turno (Gemini Vertex não tem system
        // idêntico ao Anthropic em todos os endpoints).
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

        const url = buildGenerateContentUrl(project, loc, params.model);
        const token = await getAccessToken();
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
          const message =
            payload.error?.message ||
            `Gemini Vertex HTTP ${response.status}`;
          const err = new Error(message) as Error & {
            status?: number;
            code?: string;
            error?: { code?: unknown; status?: unknown; message?: unknown };
          };
          err.status = response.status;
          err.code = payload.error?.status || String(response.status);
          err.error = payload.error;
          throw err;
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
          model: payload.modelVersion || params.model,
          stop_reason: finish === "SAFETY" ? "refusal" : finish,
        };
      },
    },
  };
}
