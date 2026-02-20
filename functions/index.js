const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const ALLOWED_ORIGINS = new Set([
  "https://chulsan-danawa.com",
  "https://www.chulsan-danawa.com",
  "https://chulsan-danawa.web.app",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
]);

function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDataUrl(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed.startsWith("data:image/")) return "";
  return trimmed;
}

exports.aiApi = onRequest(
  {
    region: "asia-northeast3",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async (req, res) => {
    setCors(req, res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      res.status(500).json({ error: "Server API key is not configured" });
      return;
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const message = normalizeText(body.message);
    const system = normalizeText(body.system);
    const model = normalizeText(body.model) || "gpt-4.1-mini";
    const temperature = Number.isFinite(body.temperature) ? body.temperature : 0.7;
    const maxOutputTokens = Number.isFinite(body.max_output_tokens)
      ? Math.min(Math.max(body.max_output_tokens, 64), 4096)
      : 800;

    if (!message) {
      res.status(400).json({ error: "`message` is required" });
      return;
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

    try {
      const aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          input,
          temperature,
          max_output_tokens: maxOutputTokens
        })
      });

      const data = await aiResponse.json();
      if (!aiResponse.ok) {
        res.status(aiResponse.status).json({
          error: data?.error?.message || "Upstream API error",
          detail: data?.error || data
        });
        return;
      }

      const outputText = typeof data.output_text === "string" ? data.output_text : "";
      res.status(200).json({
        ok: true,
        text: outputText,
        model: data.model || model,
        id: data.id || null,
        raw: data
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to call AI API",
        detail: err instanceof Error ? err.message : String(err)
      });
    }
  }
);

exports.babyPhoto = onRequest(
  {
    region: "asia-northeast3",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB"
  },
  async (req, res) => {
    setCors(req, res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = OPENAI_API_KEY.value();
    if (!apiKey) {
      res.status(500).json({ error: "Server API key is not configured" });
      return;
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const imageDataUrl = normalizeDataUrl(body.image_data_url);
    const style = normalizeText(body.style);
    const gestationalWeeks =
      Number.isFinite(body.gestational_weeks) && body.gestational_weeks > 0
        ? Math.floor(body.gestational_weeks)
        : null;

    if (!imageDataUrl) {
      res.status(400).json({ error: "`image_data_url` is required (data:image/...)" });
      return;
    }

    try {
      const analysisPrompt = [
        "You are helping create a playful, non-medical baby portrait prompt from an ultrasound image.",
        "Return one concise English prompt for an image model.",
        "Do not claim certainty or diagnosis. Treat this as creative visualization.",
        "Include: newborn baby portrait, realistic skin texture, soft natural light, neutral background, high detail."
      ].join(" ");

      const analysisInputText = [
        "Create a short image prompt from this ultrasound image.",
        gestationalWeeks ? `Gestational weeks: ${gestationalWeeks}.` : "",
        style ? `Preferred style: ${style}.` : ""
      ]
        .filter(Boolean)
        .join(" ");

      const analysisRes = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content: [{ type: "input_text", text: analysisPrompt }]
            },
            {
              role: "user",
              content: [
                { type: "input_text", text: analysisInputText },
                { type: "input_image", image_url: imageDataUrl }
              ]
            }
          ],
          max_output_tokens: 220
        })
      });

      const analysisJson = await analysisRes.json();
      if (!analysisRes.ok) {
        res.status(analysisRes.status).json({
          error: analysisJson?.error?.message || "Failed to analyze ultrasound image",
          detail: analysisJson?.error || analysisJson
        });
        return;
      }

      const synthesizedPrompt = normalizeText(analysisJson.output_text) ||
        "A realistic newborn baby portrait, soft natural light, neutral background, high detail, warm tones.";

      const imagePrompt = [
        "당신은 참고 이미지를 기반으로 미래 아기의 얼굴을 현실적으로 예측해 생성하는 역할을 합니다.",
        "현실적인 한국 신생아 기본 얼굴을 기준으로, 과장/미화/필터 느낌 없이 자연스럽게 생성하세요.",
        "부모 특징은 명확한 경우에만 균형 있게 반영하고, 한쪽 부모를 과도하게 닮게 하지 마세요.",
        "눈을 감고 편안히 잠든 신생아, 흰색 또는 베이지색 속싸개, 단순하고 중립적인 배경, 부드럽고 중립적인 조명.",
        "부모 얼굴 복사 금지, 질병/장애/의학적 상태 추측 금지, 광고 모델/일러스트/애니메이션 느낌 금지.",
        `참고 특성: ${synthesizedPrompt}`,
        "네거티브 프롬프트: 애니메이션 스타일, 만화, 일러스트, 인형 같은 피부, 플라스틱 질감, 비현실적으로 하얀 피부, 성인 얼굴 구조, 뷰티 필터, 광고 모델 같은 신생아, 과도하게 매끈한 얼굴, 눈이 비현실적으로 큰 표현, 판타지 스타일, 과장된 조명.",
        "No text, no watermark."
      ].join(" ");

      const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-image-1.5",
          prompt: imagePrompt,
          size: "1024x1024",
          quality: "medium",
          n: 1
        })
      });

      const imageJson = await imageRes.json();
      if (!imageRes.ok) {
        res.status(imageRes.status).json({
          error: imageJson?.error?.message || "Failed to generate image",
          detail: imageJson?.error || imageJson
        });
        return;
      }

      const b64 = imageJson?.data?.[0]?.b64_json || "";
      if (!b64) {
        res.status(500).json({ error: "Image API returned no image payload" });
        return;
      }

      res.status(200).json({
        ok: true,
        image_data_url: `data:image/png;base64,${b64}`,
        prompt_used: imagePrompt
      });
    } catch (err) {
      res.status(500).json({
        error: "Failed to generate baby photo",
        detail: err instanceof Error ? err.message : String(err)
      });
    }
  }
);
