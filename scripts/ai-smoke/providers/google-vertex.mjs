import {
  EXPECTED_RESPONSE,
  PROBE_PROMPT,
  classifyGoogleError,
  fail,
  fetchJson,
  getGcloudContext,
  googleVertexHost,
  pass,
  skip,
} from "../core.mjs";

const PROVIDER = "google-vertex";

export async function probeGoogleVertex(options) {
  if (!options.execute) {
    return pass(
      PROVIDER,
      "Dry-run validado. Nenhuma chamada ao Google Vertex foi executada.",
      { requiredForExecute: ["model", "region"] },
    );
  }

  if (!options.model || !options.region) {
    return fail(PROVIDER, "--model e --region são obrigatórios com --execute.");
  }

  const context = getGcloudContext(options.project);
  if (!context.ok) {
    return skip(PROVIDER, context.reason, {
      model: options.model,
      region: options.region,
    });
  }

  const host = googleVertexHost(options.region);
  const path = [
    "v1",
    "projects",
    encodeURIComponent(context.project),
    "locations",
    encodeURIComponent(options.region),
    "publishers",
    "google",
    "models",
    `${encodeURIComponent(options.model)}:generateContent`,
  ].join("/");

  const response = await fetchJson(`https://${host}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: PROBE_PROMPT }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 128,
      },
    }),
  });

  const details = {
    model: options.model,
    region: options.region,
  };

  if (!response.ok) {
    return classifyGoogleError(PROVIDER, response, details);
  }

  const text = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();

  if (!text) {
    return fail(PROVIDER, "O Google Vertex respondeu sem conteúdo de texto.", {
      ...details,
      httpStatus: response.status,
    });
  }

  if (text !== EXPECTED_RESPONSE) {
    return fail(PROVIDER, "O modelo respondeu, mas não respeitou a resposta esperada do probe.", {
      ...details,
      httpStatus: response.status,
      responseMatched: false,
    });
  }

  return pass(PROVIDER, "Modelo Google Vertex acessível e resposta validada.", {
    ...details,
    httpStatus: response.status,
    responseMatched: true,
  });
}
