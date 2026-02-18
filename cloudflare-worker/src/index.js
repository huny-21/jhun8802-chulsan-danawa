function parseAllowedOrigins(raw) {
  return new Set(
    String(raw || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );
}

function isPreviewOrigin(origin) {
  return /^https:\/\/chulsan-danawa--[a-z0-9-]+\.web\.app$/i.test(origin || "");
}

function corsHeaders(origin, allowed) {
  const headers = {
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "3600"
  };
  if (origin && (allowed.has(origin) || isPreviewOrigin(origin))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDataUrl(value) {
  const text = normalizeText(value);
  return text.startsWith("data:image/") ? text : "";
}

function normalizeDataUrlList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeDataUrl(item)).filter(Boolean);
}

function normalizeGender(value) {
  const text = normalizeText(value).toLowerCase();
  if (text === "female" || text === "male" || text === "unknown") return text;
  return "";
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text) {
    return data.output_text;
  }
  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];
  for (const item of output) {
    if (item?.type !== "message" || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function extractCombinedFeatures(rawText) {
  const text = normalizeText(rawText);
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    const fromJson = normalizeText(parsed?.combined_features_english);
    if (fromJson) return fromJson;
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        const fromJson = normalizeText(parsed?.combined_features_english);
        if (fromJson) return fromJson;
      } catch (_) {
        // ignore and fallback to plain text
      }
    }
  }
  return text.replace(/^"+|"+$/g, "");
}

function buildOpenAiErrorPayload(data, fallback, context = {}) {
  const message = data?.error?.message || fallback || "Upstream API error";
  const code = data?.error?.code || null;
  const type = data?.error?.type || null;
  const param = data?.error?.param || null;
  const lower = String(message).toLowerCase();
  let errorHelp = "";
  if (lower.includes("country") || lower.includes("region") || code === "unsupported_country_region_territory") {
    errorHelp = "OpenAI 계정/요청 지역 제한으로 보입니다. 계정 국가, 결제 상태, VPN/프록시 사용 여부를 확인하세요.";
  } else if (code === "moderation_blocked" || lower.includes("safety_violations")) {
    errorHelp = "안전 정책으로 차단되었습니다. 의료/신체 직접 묘사를 줄이고, 3D 캐릭터/일러스트 스타일로 다시 시도하세요.";
  }
  return {
    error: message,
    error_code: code,
    error_type: type,
    error_param: param,
    error_help: errorHelp,
    context,
    detail: data?.error || data
  };
}

async function handleAiApi(req, env, cors) {
  const body = await req.json().catch(() => ({}));
  const message = normalizeText(body.message);
  const system = normalizeText(body.system);
  const model = normalizeText(body.model) || "gpt-4.1-nano";
  const temperature = Number.isFinite(body.temperature) ? body.temperature : 0.7;
  const maxOutputTokens = Number.isFinite(body.max_output_tokens)
    ? Math.min(Math.max(body.max_output_tokens, 64), 4096)
    : 800;
  const requestContext = {
    path: new URL(req.url).pathname,
    cf_country: req?.cf?.country || null,
    cf_colo: req?.cf?.colo || null
  };

  if (!message) {
    return json({ error: "`message` is required" }, 400, cors);
  }

  const input = [];
  if (system) {
    input.push({
      role: "system",
      content: [{ type: "input_text", text: system }]
    });
  }
  input.push({
    role: "user",
    content: [{ type: "input_text", text: message }]
  });

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      input,
      temperature,
      max_output_tokens: maxOutputTokens
    })
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return json(buildOpenAiErrorPayload(data, "Upstream API error", requestContext), upstream.status, cors);
  }

  return json(
    {
      ok: true,
      text: extractResponseText(data),
      model: data.model || model,
      id: data.id || null,
      raw: data
    },
    200,
    cors
  );
}

async function handleBabyPhoto(req, env, cors) {
  const body = await req.json().catch(() => ({}));
  const motherImageDataUrl = normalizeDataUrl(body.mother_image_data_url);
  const fatherImageDataUrl = normalizeDataUrl(body.father_image_data_url);
  const ultrasoundImageDataUrls = normalizeDataUrlList(body.ultrasound_image_data_urls);
  const gender = normalizeGender(body.gender);
  const gestationalWeeks =
    Number.isFinite(body.gestational_weeks) && body.gestational_weeks > 0
      ? Math.floor(body.gestational_weeks)
      : null;

  if (!motherImageDataUrl) {
    return json({ error: "`mother_image_data_url` is required (data:image/...)" }, 400, cors);
  }
  if (!fatherImageDataUrl) {
    return json({ error: "`father_image_data_url` is required (data:image/...)" }, 400, cors);
  }
  if (ultrasoundImageDataUrls.length < 1 || ultrasoundImageDataUrls.length > 3) {
    return json({ error: "`ultrasound_image_data_urls` must contain 1~3 images" }, 400, cors);
  }
  if (!gestationalWeeks || gestationalWeeks < 4 || gestationalWeeks > 42) {
    return json({ error: "`gestational_weeks` must be between 4 and 42" }, 400, cors);
  }
  if (!gender) {
    return json({ error: "`gender` is required (`female` | `male` | `unknown`)" }, 400, cors);
  }

  const totalImageCount = 2 + ultrasoundImageDataUrls.length;
  if (totalImageCount < 3 || totalImageCount > 5) {
    return json({ error: "Total image count must be 3~5" }, 400, cors);
  }

  const requestContext = {
    path: new URL(req.url).pathname,
    cf_country: req?.cf?.country || null,
    cf_colo: req?.cf?.colo || null
  };
  const origin = req.headers.get("Origin") || "";
  const explicitTestMode = body?.test_mode === true;
  const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const testMode = explicitTestMode || isPreviewOrigin(origin) || isLocalOrigin;
  const genderLabel =
    gender === "female" ? "girl" : gender === "male" ? "boy" : "unknown";

  const analysisUserContent = [
    {
      type: "input_text",
      text: [
        "Analyze the parent and ultrasound photos and infer only soft, neutral newborn facial traits in English.",
        "Return strict JSON only: {\"combined_features_english\":\"...\"}.",
        "Use one concise phrase (7-18 words), no medical claims, no sensitive wording.",
        `Gestational weeks: ${gestationalWeeks}.`,
        `Expected gender: ${genderLabel}.`
      ].join(" ")
    },
    { type: "input_text", text: "Mother photo:" },
    { type: "input_image", image_url: motherImageDataUrl },
    { type: "input_text", text: "Father photo:" },
    { type: "input_image", image_url: fatherImageDataUrl }
  ];
  for (let i = 0; i < ultrasoundImageDataUrls.length; i += 1) {
    analysisUserContent.push({ type: "input_text", text: `Ultrasound photo ${i + 1}:` });
    analysisUserContent.push({ type: "input_image", image_url: ultrasoundImageDataUrls[i] });
  }

  let combinedFeatures = "a cute button nose, round cheeks, and a defined chin";
  if (!testMode) {
    const analysisRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: "You extract concise visual traits for a fictional newborn render prompt." }]
          },
          {
            role: "user",
            content: analysisUserContent
          }
        ],
        temperature: 0.2,
        max_output_tokens: 140
      })
    });

    const analysisJson = await analysisRes.json().catch(() => ({}));
    if (!analysisRes.ok) {
      return json(buildOpenAiErrorPayload(analysisJson, "Failed to analyze parent/ultrasound images", requestContext), analysisRes.status, cors);
    }
    combinedFeatures = extractCombinedFeatures(extractResponseText(analysisJson)) ||
      "a cute button nose, round cheeks, and a defined chin";
  }

  const imagePrompt = [
    "A heartwarming, high-quality 3D animation render of a newborn baby, in the distinct style of Pixar.",
    "The baby is just a few days old, sleeping peacefully and swaddled snugly in a soft, pastel-colored hospital blanket with a tiny knit beanie on its head.",
    `Based on prenatal ultrasound analysis, the baby has ${combinedFeatures}.`,
    "Soft, warm nursery lighting glows gently, highlighting the baby's rosy cheeks and smooth skin texture.",
    "The camera angle is close-up and gentle.",
    `Gestational age hint: ${gestationalWeeks} weeks.`,
    `Expected sex hint: ${genderLabel}.`,
    "No text, no watermark."
  ].join(" ");

  const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "low",
      n: 1
    })
  });

  const imageJson = await imageRes.json().catch(() => ({}));
  if (!imageRes.ok) {
    return json(buildOpenAiErrorPayload(imageJson, "Failed to generate image", requestContext), imageRes.status, cors);
  }

  const b64 = imageJson?.data?.[0]?.b64_json || "";
  if (!b64) {
    return json({ error: "Image API returned no image payload" }, 500, cors);
  }

  return json(
    {
      ok: true,
      image_data_url: `data:image/png;base64,${b64}`,
      prompt_used: imagePrompt,
      combined_features_english: combinedFeatures,
      test_mode: testMode
    },
    200,
    cors
  );
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "";
    const allowed = parseAllowedOrigins(env.ALLOWED_ORIGINS);
    const cors = corsHeaders(origin, allowed);

    if (req.method === "OPTIONS") {
      return new Response("", { status: 204, headers: cors });
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "OPENAI_API_KEY is not configured" }, 500, cors);
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    if (url.pathname === "/api/ai") {
      return handleAiApi(req, env, cors);
    }
    if (url.pathname === "/api/baby-photo") {
      return handleBabyPhoto(req, env, cors);
    }
    return json({ error: "Not found" }, 404, cors);
  }
};
