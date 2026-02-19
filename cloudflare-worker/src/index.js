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
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function parseImageDataUrl(dataUrl) {
  const text = normalizeText(dataUrl);
  const match = text.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  return { contentType: match[1], base64: match[2] };
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes) {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
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

function normalizeUserId(value) {
  const text = normalizeText(value);
  if (!text) return "";
  // Keep user id strict and short for storage/query safety.
  return /^[a-zA-Z0-9_-]{6,128}$/.test(text) ? text : "";
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

function getCampaignMonthStart(value) {
  const raw = normalizeText(value);
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return `${raw}-01 00:00:00`;
  }
  // Default: 2026-02 campaign window
  return "2026-02-01 00:00:00";
}

function getCampaignMonthKey(value) {
  const raw = normalizeText(value);
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  return "2026-02";
}

function getNowKstMonthKey() {
  const nowKst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return nowKst.toISOString().slice(0, 7);
}

let couponReservationSchemaReady = false;
async function ensureCouponReservationSchema(env) {
  if (!env?.DB || couponReservationSchemaReady) return;
  await env.DB
    .prepare(
      `CREATE TABLE IF NOT EXISTS coupon_reservations (
        order_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        campaign_key TEXT NOT NULL,
        coupons INTEGER NOT NULL,
        status TEXT NOT NULL, -- reserved | consumed | released
        reason TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT
      )`
    )
    .run();
  await env.DB
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_coupon_reservations_campaign_status
       ON coupon_reservations(campaign_key, status, expires_at DESC)`
    )
    .run();
  couponReservationSchemaReady = true;
}

async function cleanupExpiredCouponReservations(env, campaignKey) {
  if (!env?.DB || !campaignKey) return;
  await ensureCouponReservationSchema(env);
  await env.DB
    .prepare(
      `UPDATE coupon_reservations
       SET status = 'released',
           reason = COALESCE(reason, 'expired'),
           updated_at = CURRENT_TIMESTAMP
       WHERE campaign_key = ?1
         AND status = 'reserved'
         AND datetime(expires_at) <= datetime('now')`
    )
    .bind(campaignKey)
    .run();
}

async function getCampaignReservationStats(env, campaignKey) {
  if (!env?.DB || !campaignKey) {
    return { consumedCoupons: 0, reservedCoupons: 0 };
  }
  await ensureCouponReservationSchema(env);
  const row = await env.DB
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'consumed' THEN coupons ELSE 0 END), 0) AS consumed_coupons,
         COALESCE(SUM(CASE WHEN status = 'reserved' THEN coupons ELSE 0 END), 0) AS reserved_coupons
       FROM coupon_reservations
       WHERE campaign_key = ?1`
    )
    .bind(campaignKey)
    .first();
  return {
    consumedCoupons: Number(row?.consumed_coupons || 0),
    reservedCoupons: Number(row?.reserved_coupons || 0)
  };
}

async function reserveCampaignCoupons(env, { orderId, userId, campaignKey, coupons, maxCoupons, ttlMinutes = 30 }) {
  if (!env?.DB || !orderId || !userId || !campaignKey || !Number.isFinite(coupons) || coupons <= 0) {
    return { ok: false, remainingCoupons: 0 };
  }
  await ensureCouponReservationSchema(env);
  await cleanupExpiredCouponReservations(env, campaignKey);
  const insertRes = await env.DB
    .prepare(
      `INSERT INTO coupon_reservations
       (order_id, user_id, campaign_key, coupons, status, reason, expires_at, created_at)
       SELECT ?1, ?2, ?3, ?4, 'reserved', NULL, datetime('now', ?5), CURRENT_TIMESTAMP
       WHERE (
         SELECT COALESCE(SUM(coupons), 0)
         FROM coupon_reservations
         WHERE campaign_key = ?3
           AND status IN ('reserved', 'consumed')
       ) + ?4 <= ?6`
    )
    .bind(orderId, userId, campaignKey, coupons, `+${Math.max(1, Math.floor(ttlMinutes))} minutes`, maxCoupons)
    .run();

  if (!Number(insertRes?.meta?.changes || 0)) {
    const stats = await getCampaignReservationStats(env, campaignKey);
    const remainingCoupons = Math.max(0, maxCoupons - (stats.consumedCoupons + stats.reservedCoupons));
    return { ok: false, remainingCoupons };
  }
  return { ok: true };
}

async function consumeCampaignReservation(env, orderId) {
  if (!env?.DB || !orderId) return false;
  await ensureCouponReservationSchema(env);
  const res = await env.DB
    .prepare(
      `UPDATE coupon_reservations
       SET status = 'consumed',
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?1
         AND status = 'reserved'`
    )
    .bind(orderId)
    .run();
  return Number(res?.meta?.changes || 0) > 0;
}

async function releaseCampaignReservation(env, orderId, reason = "released") {
  if (!env?.DB || !orderId) return false;
  await ensureCouponReservationSchema(env);
  const res = await env.DB
    .prepare(
      `UPDATE coupon_reservations
       SET status = 'released',
           reason = ?2,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?1
         AND status = 'reserved'`
    )
    .bind(orderId, normalizeText(reason) || "released")
    .run();
  return Number(res?.meta?.changes || 0) > 0;
}

async function getCampaignReservationByOrder(env, orderId) {
  if (!env?.DB || !orderId) return null;
  await ensureCouponReservationSchema(env);
  return env.DB
    .prepare(
      `SELECT order_id, user_id, campaign_key, coupons, status, expires_at
       FROM coupon_reservations
       WHERE order_id = ?1
       LIMIT 1`
    )
    .bind(orderId)
    .first();
}

async function getCouponCampaignStatus(env) {
  if (!env?.DB) {
    return {
      active: false,
      label: "2월 한정 쿠폰",
      max_coupons: 50,
      issued_coupons: 0,
      remaining_coupons: 50,
      sold_out: false,
      window_start: "2026-02-01 00:00:00",
      window_end: "2026-03-01 00:00:00"
    };
  }
  const label = normalizeText(env.COUPON_CAMPAIGN_LABEL) || "2월 한정 쿠폰";
  const maxCoupons = parsePositiveInt(env.COUPON_CAMPAIGN_MAX_COUPONS, 50);
  const campaignKey = getCampaignMonthKey(env.COUPON_CAMPAIGN_MONTH);
  const monthStart = getCampaignMonthStart(env.COUPON_CAMPAIGN_MONTH);
  const isOpenNow = getNowKstMonthKey() === campaignKey;
  await cleanupExpiredCouponReservations(env, campaignKey);
  const stats = await getCampaignReservationStats(env, campaignKey);
  const issuedCoupons = stats.consumedCoupons;
  const reservedCoupons = stats.reservedCoupons;
  const usedCoupons = issuedCoupons + reservedCoupons;
  const remainingCoupons = Math.max(0, maxCoupons - usedCoupons);
  const soldOutOrClosed = !isOpenNow || remainingCoupons <= 0;
  return {
    active: isOpenNow,
    label,
    campaign_key: campaignKey,
    max_coupons: maxCoupons,
    issued_coupons: issuedCoupons,
    reserved_coupons: reservedCoupons,
    remaining_coupons: remainingCoupons,
    sold_out: soldOutOrClosed,
    status: !isOpenNow ? "ended" : remainingCoupons <= 0 ? "sold_out" : "open",
    window_start: monthStart,
    window_end: "auto:+1month"
  };
}

async function getWelcomeCouponStatus(env) {
  const label = normalizeText(env.WELCOME_COUPON_LABEL) || "첫 로그인 체험 쿠폰";
  const maxCoupons = parsePositiveInt(env.WELCOME_COUPON_MAX_COUPONS, 30);
  const unitCost = parsePositiveInt(env.COUPON_UNIT_CREDITS, 250);
  const row = await env.DB
    .prepare(
      `SELECT COALESCE(SUM(
         CASE
           WHEN (paid_delta + bonus_delta) > 0 THEN (paid_delta + bonus_delta)
           ELSE 0
         END
       ), 0) AS issued_credits
       FROM credit_ledger
       WHERE entry_type = 'welcome_bonus'`
    )
    .first();
  const issuedCredits = Number(row?.issued_credits || 0);
  const issuedCoupons = Math.floor(issuedCredits / unitCost);
  const remainingCoupons = Math.max(0, maxCoupons - issuedCoupons);
  return {
    active: true,
    label,
    max_coupons: maxCoupons,
    issued_coupons: issuedCoupons,
    remaining_coupons: remainingCoupons,
    sold_out: remainingCoupons <= 0
  };
}

function shouldApplyGrantLimit(entryType, grantAmount) {
  if (!Number.isFinite(grantAmount) || grantAmount <= 0) return false;
  // Revert는 기존 차감 복구이므로 리밋 적용 시 사용자 손실이 발생할 수 있어 제외.
  if (entryType === "revert") return false;
  return true;
}

async function enforceCreditGrantLimits(env, userId, entryType, grantAmount) {
  if (!env?.DB) return;
  if (!shouldApplyGrantLimit(entryType, grantAmount)) return;

  const perTxnCap = parsePositiveInt(env.CREDIT_GRANT_MAX_PER_TXN, 20000);
  const dailyCap = parsePositiveInt(env.CREDIT_GRANT_DAILY_CAP_PER_USER, 20000);
  const monthlyCap = parsePositiveInt(env.CREDIT_GRANT_MONTHLY_CAP_PER_USER, 100000);
  const walletCap = parsePositiveInt(env.CREDIT_WALLET_MAX_BALANCE, 200000);

  if (grantAmount > perTxnCap) {
    throw new Error(`Credit grant exceeds per-transaction limit (${perTxnCap})`);
  }

  const dailyRow = await env.DB
    .prepare(
      `SELECT COALESCE(SUM(
         CASE
           WHEN (paid_delta + bonus_delta) > 0 THEN (paid_delta + bonus_delta)
           ELSE 0
         END
       ), 0) AS granted
       FROM credit_ledger
       WHERE user_id = ?1
         AND entry_type != 'revert'
         AND datetime(created_at) >= datetime('now', 'start of day')`
    )
    .bind(userId)
    .first();
  const grantedToday = Number(dailyRow?.granted || 0);
  if (grantedToday + grantAmount > dailyCap) {
    throw new Error(`Daily credit grant limit exceeded (${dailyCap})`);
  }

  const monthlyRow = await env.DB
    .prepare(
      `SELECT COALESCE(SUM(
         CASE
           WHEN (paid_delta + bonus_delta) > 0 THEN (paid_delta + bonus_delta)
           ELSE 0
         END
       ), 0) AS granted
       FROM credit_ledger
       WHERE user_id = ?1
         AND entry_type != 'revert'
         AND datetime(created_at) >= datetime('now', 'start of month')`
    )
    .bind(userId)
    .first();
  const grantedThisMonth = Number(monthlyRow?.granted || 0);
  if (grantedThisMonth + grantAmount > monthlyCap) {
    throw new Error(`Monthly credit grant limit exceeded (${monthlyCap})`);
  }

  const wallet = await getWallet(env, userId);
  const currentTotal = Number(wallet?.paid_credits || 0) + Number(wallet?.bonus_credits || 0);
  if (currentTotal + grantAmount > walletCap) {
    throw new Error(`Wallet balance cap exceeded (${walletCap})`);
  }
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

function extractFeaturePayload(rawText) {
  const text = normalizeText(rawText);
  const fallback = {
    combined_features_english: "soft almond-shaped eyes, a small nose, gentle lips, and a smooth side profile",
    eye_features_english: "soft almond-shaped eyes",
    nose_features_english: "a small nose",
    mouth_features_english: "gentle lips",
    side_profile_features_english: "a smooth side profile"
  };
  if (!text) return fallback;
  const pickPayload = (parsed) => ({
    combined_features_english: normalizeText(parsed?.combined_features_english) || fallback.combined_features_english,
    eye_features_english: normalizeText(parsed?.eye_features_english) || fallback.eye_features_english,
    nose_features_english: normalizeText(parsed?.nose_features_english) || fallback.nose_features_english,
    mouth_features_english: normalizeText(parsed?.mouth_features_english) || fallback.mouth_features_english,
    side_profile_features_english: normalizeText(parsed?.side_profile_features_english) || fallback.side_profile_features_english
  });
  try {
    const parsed = JSON.parse(text);
    return pickPayload(parsed);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return pickPayload(parsed);
      } catch (_) {
        return fallback;
      }
    }
  }
  return fallback;
}

function buildRealisticFeatureSentence(featurePayload) {
  const eyes = normalizeText(featurePayload?.eye_features_english);
  const nose = normalizeText(featurePayload?.nose_features_english);
  const mouth = normalizeText(featurePayload?.mouth_features_english);
  const profile = normalizeText(featurePayload?.side_profile_features_english);
  const parts = [eyes, nose, mouth, profile].filter(Boolean);
  return parts.length ? parts.join(", ") : "soft almond-shaped eyes, a small nose, gentle lips, and a smooth side profile";
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

function jsonWithCookie(data, status = 200, extraHeaders = {}, setCookie = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return new Response(JSON.stringify(data), { status, headers });
}

function getOrCreateGuestId(req) {
  const cookieHeader = req.headers.get("Cookie") || "";
  const existing = cookieHeader
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("guest_id="));
  const cookieValue = existing ? existing.split("=")[1] || "" : "";
  const fromCookie = normalizeUserId(cookieValue);
  if (fromCookie) {
    return { userId: `guest_${fromCookie}`, setCookie: "" };
  }
  const rand = crypto.randomUUID().replace(/-/g, "");
  const guestToken = rand.slice(0, 24);
  const setCookie = `guest_id=${guestToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
  return { userId: `guest_${guestToken}`, setCookie };
}

function resolveUserId(req, body = {}) {
  const explicit =
    normalizeUserId(body.user_id) ||
    normalizeUserId(req.headers.get("x-user-id") || "");
  if (explicit) return { userId: explicit, setCookie: "" };
  return getOrCreateGuestId(req);
}

function getBearerToken(req) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return "";
  return auth.slice(7).trim();
}

async function verifyFirebaseIdToken(idToken, env) {
  const projectId = normalizeText(env.FIREBASE_PROJECT_ID);
  const webApiKey = normalizeText(env.FIREBASE_WEB_API_KEY);
  if (!projectId) return { ok: false, reason: "FIREBASE_PROJECT_ID is not configured" };
  if (!webApiKey) return { ok: false, reason: "FIREBASE_WEB_API_KEY is not configured" };
  if (!idToken) return { ok: false, reason: "Missing Bearer token" };

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(webApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );
  if (!res.ok) return { ok: false, reason: "Invalid Firebase ID token" };
  const data = await res.json().catch(() => ({}));
  const user = Array.isArray(data?.users) ? data.users[0] : null;
  const uid = normalizeText(user?.localId);
  const email = normalizeText(user?.email);
  const tokenParts = idToken.split(".");
  if (tokenParts.length < 2) return { ok: false, reason: "Malformed token" };
  let payload = {};
  try {
    const json = atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"));
    payload = JSON.parse(json);
  } catch (_) {
    return { ok: false, reason: "Token payload parse failed" };
  }
  const aud = normalizeText(payload?.aud);
  const iss = normalizeText(payload?.iss);
  const exp = Number(payload?.exp || 0);
  const now = Math.floor(Date.now() / 1000);
  if (!uid) return { ok: false, reason: "Token has no user_id" };
  if (aud !== projectId) return { ok: false, reason: "Token audience mismatch" };
  if (iss !== `https://securetoken.google.com/${projectId}`) {
    return { ok: false, reason: "Token issuer mismatch" };
  }
  if (!exp || exp <= now) return { ok: false, reason: "Token expired" };
  return { ok: true, uid, email };
}

async function requireFirebaseUser(req, env, cors) {
  const token = getBearerToken(req);
  const verified = await verifyFirebaseIdToken(token, env);
  if (!verified.ok) {
    return {
      ok: false,
      response: json({ error: "Unauthorized", detail: verified.reason }, 401, cors)
    };
  }
  return { ok: true, uid: verified.uid, email: verified.email };
}

async function getWallet(env, userId) {
  await env.DB
    .prepare(
      `INSERT INTO wallets (user_id, paid_credits, bonus_credits, updated_at)
       VALUES (?1, 0, 0, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO NOTHING`
    )
    .bind(userId)
    .run();
  return env.DB
    .prepare(
      `SELECT user_id, paid_credits, bonus_credits, updated_at
       FROM wallets
       WHERE user_id = ?1`
    )
    .bind(userId)
    .first();
}

async function addCredits(env, userId, paidAmount, bonusAmount, entryType, sourceId) {
  const paidDelta = Math.trunc(Number(paidAmount || 0));
  const bonusDelta = Math.trunc(Number(bonusAmount || 0));
  const grantAmount = Math.max(0, paidDelta) + Math.max(0, bonusDelta);
  const normalizedSourceId = normalizeText(sourceId);

  if (normalizedSourceId) {
    const existing = await env.DB
      .prepare(
        `SELECT id
         FROM credit_ledger
         WHERE user_id = ?1
           AND entry_type = ?2
           AND source_id = ?3
         LIMIT 1`
      )
      .bind(userId, entryType, normalizedSourceId)
      .first();
    if (existing) {
      return getWallet(env, userId);
    }
  }

  await enforceCreditGrantLimits(env, userId, entryType, grantAmount);

  await env.DB
    .prepare(
      `INSERT INTO wallets (user_id, paid_credits, bonus_credits, updated_at)
       VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         paid_credits = wallets.paid_credits + excluded.paid_credits,
         bonus_credits = wallets.bonus_credits + excluded.bonus_credits,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, paidDelta, bonusDelta)
    .run();

  await env.DB
    .prepare(
      `INSERT INTO credit_ledger (user_id, entry_type, paid_delta, bonus_delta, source_id, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)`
    )
    .bind(userId, entryType, paidDelta, bonusDelta, normalizedSourceId || null)
    .run();

  return getWallet(env, userId);
}

async function deductCreditsOrThrow(env, userId, amount, sourceId) {
  const before = await getWallet(env, userId);
  const paidBefore = Number(before?.paid_credits || 0);
  const bonusBefore = Number(before?.bonus_credits || 0);
  if (paidBefore + bonusBefore < amount) {
    return { ok: false, paidDelta: 0, bonusDelta: 0 };
  }

  const updateRes = await env.DB
    .prepare(
      `UPDATE wallets
       SET
         paid_credits = paid_credits - CASE
           WHEN paid_credits >= ?2 THEN ?2
           ELSE paid_credits
         END,
         bonus_credits = bonus_credits - CASE
           WHEN paid_credits >= ?2 THEN 0
           ELSE (?2 - paid_credits)
         END,
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?1
         AND (paid_credits + bonus_credits) >= ?2`
    )
    .bind(userId, amount)
    .run();

  if (!Number(updateRes?.meta?.changes || 0)) {
    return { ok: false, paidDelta: 0, bonusDelta: 0 };
  }

  const after = await getWallet(env, userId);
  const paidAfter = Number(after?.paid_credits || 0);
  const bonusAfter = Number(after?.bonus_credits || 0);
  const paidDelta = paidAfter - paidBefore;
  const bonusDelta = bonusAfter - bonusBefore;

  await env.DB
    .prepare(
      `INSERT INTO credit_ledger (user_id, entry_type, paid_delta, bonus_delta, source_id, created_at)
       VALUES (?1, 'usage', ?2, ?3, ?4, CURRENT_TIMESTAMP)`
    )
    .bind(userId, paidDelta, bonusDelta, sourceId || null)
    .run();

  return { ok: true, paidDelta, bonusDelta };
}

async function revertDeduction(env, userId, paidDelta, bonusDelta, sourceId) {
  if (!paidDelta && !bonusDelta) return;
  await addCredits(env, userId, Math.abs(paidDelta), Math.abs(bonusDelta), "revert", sourceId);
}

async function cleanupExpiredPhotoHistory(env, userId) {
  if (!env.DB || !env.AI_PHOTO_BUCKET || !userId) return;
  const expired = await env.DB
    .prepare(
      `SELECT id, r2_key
       FROM generated_photos
       WHERE user_id = ?1
         AND delete_after IS NOT NULL
         AND datetime(delete_after) <= datetime('now')
       ORDER BY datetime(delete_after) ASC, id ASC
       LIMIT 50`
    )
    .bind(userId)
    .all();
  const rows = Array.isArray(expired?.results) ? expired.results : [];
  for (const row of rows) {
    const key = normalizeText(row?.r2_key);
    if (key) await env.AI_PHOTO_BUCKET.delete(key);
    if (Number.isFinite(row?.id)) {
      await env.DB.prepare(`DELETE FROM generated_photos WHERE id = ?1`).bind(row.id).run();
    }
  }
}

async function savePhotoHistory(env, userId, imageDataUrl) {
  if (!env.DB || !env.AI_PHOTO_BUCKET || !userId || !imageDataUrl) return;
  const parsed = parseImageDataUrl(imageDataUrl);
  if (!parsed) return;
  const bytes = base64ToUint8Array(parsed.base64);
  const ext = parsed.contentType.includes("jpeg") ? "jpg" : "png";
  const r2Key = `generated/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await env.AI_PHOTO_BUCKET.put(r2Key, bytes, {
    httpMetadata: { contentType: parsed.contentType }
  });

  await env.DB
    .prepare(
      `INSERT INTO generated_photos (user_id, r2_key, visible_until, delete_after, created_at)
       VALUES (?1, ?2, datetime('now', '+7 days'), datetime('now', '+10 days'), CURRENT_TIMESTAMP)`
    )
    .bind(userId, r2Key)
    .run();

  const overflow = await env.DB
    .prepare(
      `SELECT id, r2_key
       FROM generated_photos
       WHERE user_id = ?1
       ORDER BY datetime(created_at) DESC, id DESC
       LIMIT -1 OFFSET 4`
    )
    .bind(userId)
    .all();
  const overflowRows = Array.isArray(overflow?.results) ? overflow.results : [];
  for (const row of overflowRows) {
    const key = normalizeText(row?.r2_key);
    if (key) await env.AI_PHOTO_BUCKET.delete(key);
    if (Number.isFinite(row?.id)) {
      await env.DB.prepare(`DELETE FROM generated_photos WHERE id = ?1`).bind(row.id).run();
    }
  }

  await cleanupExpiredPhotoHistory(env, userId);
}

async function listPhotoHistory(env, userId) {
  if (!env.DB || !env.AI_PHOTO_BUCKET || !userId) return [];
  await cleanupExpiredPhotoHistory(env, userId);
  const rows = await env.DB
    .prepare(
      `SELECT id, r2_key, created_at
       FROM generated_photos
       WHERE user_id = ?1
         AND visible_until IS NOT NULL
         AND datetime(visible_until) >= datetime('now')
       ORDER BY datetime(created_at) DESC, id DESC
       LIMIT 4`
    )
    .bind(userId)
    .all();
  const list = Array.isArray(rows?.results) ? rows.results : [];
  const out = [];
  for (const row of list) {
    const key = normalizeText(row?.r2_key);
    if (!key) continue;
    const obj = await env.AI_PHOTO_BUCKET.get(key);
    if (!obj) continue;
    const bytes = new Uint8Array(await obj.arrayBuffer());
    const contentType = normalizeText(obj.httpMetadata?.contentType) || "image/png";
    out.push({
      id: row.id,
      created_at: row.created_at,
      image_data_url: `data:${contentType};base64,${uint8ArrayToBase64(bytes)}`
    });
  }
  return out;
}

async function handleWalletApi(req, env, cors) {
  if (!env.DB) {
    return json({ error: "DB binding is not configured" }, 500, cors);
  }
  const auth = await requireFirebaseUser(req, env, cors);
  if (!auth.ok) return auth.response;
  const userId = auth.uid;
  const welcomeStatusBefore = await getWelcomeCouponStatus(env);
  let welcomeCouponIssued = false;
  if (!welcomeStatusBefore.sold_out) {
    const welcomeSourceId = "welcome_first_login_coupon";
    const existingWelcome = await env.DB
      .prepare(
        `SELECT id
         FROM credit_ledger
         WHERE user_id = ?1
           AND entry_type = 'welcome_bonus'
           AND source_id = ?2
         LIMIT 1`
      )
      .bind(userId, welcomeSourceId)
      .first();
    if (!existingWelcome) {
      try {
        await addCredits(env, userId, 0, 250, "welcome_bonus", welcomeSourceId);
        welcomeCouponIssued = true;
      } catch (_) {
        // Ignore grant errors to keep wallet API stable.
      }
    }
  }
  const wallet = await getWallet(env, userId);
  const paid = Number(wallet?.paid_credits || 0);
  const bonus = Number(wallet?.bonus_credits || 0);
  const total = paid + bonus;
  const campaign = await getCouponCampaignStatus(env);
  const welcomeCampaign = await getWelcomeCouponStatus(env);
  const body = {
    ok: true,
    user_id: userId,
    paid_credits: paid,
    bonus_credits: bonus,
    total_credits: total,
    image_unit_cost: 250,
    can_generate_images: Math.floor(total / 250),
    coupon_campaign: campaign,
    welcome_coupon: {
      ...welcomeCampaign,
      issued_now: welcomeCouponIssued
    }
  };
  return json(body, 200, cors);
}

async function handleBabyPhotoHistoryApi(req, env, cors) {
  if (!env.DB) {
    return json({ error: "DB binding is not configured" }, 500, cors);
  }
  if (!env.AI_PHOTO_BUCKET) {
    return json({ error: "AI_PHOTO_BUCKET binding is not configured" }, 500, cors);
  }
  const auth = await requireFirebaseUser(req, env, cors);
  if (!auth.ok) return auth.response;
  const rows = await listPhotoHistory(env, auth.uid);
  return json({ ok: true, items: rows }, 200, cors);
}

async function handleBillingCheckout(req, env, cors) {
  if (!env.DB) {
    return json({ error: "DB binding is not configured" }, 500, cors);
  }
  const auth = await requireFirebaseUser(req, env, cors);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const userId = auth.uid;
  const packageId = normalizeText(body.package_id) || "usd_credit_topup";
  const requestedDollars = Math.floor(Number(body.dollar_amount || 1));
  const amountUsd = Math.min(20, Math.max(1, Number.isFinite(requestedDollars) ? requestedDollars : 1));
  const amountCents = amountUsd * 100;
  const credits = amountUsd * 1000;
  const amountKrw = amountUsd * 1000;
  const requestedCoupons = Math.floor(credits / 250);
  const campaign = await getCouponCampaignStatus(env);
  if (campaign.status === "ended") {
    return json(
      {
        error: "이벤트 기간이 종료되었습니다.",
        detail: "2월 한정 쿠폰 이벤트가 종료되어 충전/결제가 비활성화되었습니다.",
        coupon_campaign: campaign
      },
      409,
      cors
    );
  }
  if (campaign.sold_out) {
    return json(
      {
        error: "쿠폰이 모두 소진되었습니다.",
        detail: "2월 한정 50장 쿠폰이 모두 발급되어 충전/결제가 비활성화되었습니다.",
        coupon_campaign: campaign
      },
      409,
      cors
    );
  }
  if (requestedCoupons > Number(campaign.remaining_coupons || 0)) {
    return json(
      {
        error: "남은 쿠폰 수량을 초과했습니다.",
        detail: `현재 남은 쿠폰은 ${campaign.remaining_coupons}장입니다.`,
        coupon_campaign: campaign
      },
      409,
      cors
    );
  }
  const orderId = `ord_${crypto.randomUUID()}`;
  const reserve = await reserveCampaignCoupons(env, {
    orderId,
    userId,
    campaignKey: normalizeText(campaign.campaign_key) || getCampaignMonthKey(env.COUPON_CAMPAIGN_MONTH),
    coupons: requestedCoupons,
    maxCoupons: Number(campaign.max_coupons || 50),
    ttlMinutes: parsePositiveInt(env.COUPON_RESERVATION_TTL_MINUTES, 30)
  });
  if (!reserve.ok) {
    return json(
      {
        error: "남은 쿠폰 수량을 초과했습니다.",
        detail: `현재 남은 쿠폰은 ${Number(reserve.remainingCoupons || 0)}장입니다.`,
        coupon_campaign: await getCouponCampaignStatus(env)
      },
      409,
      cors
    );
  }

  try {
    await env.DB
      .prepare(
        `INSERT INTO payments
        (order_id, user_id, provider, amount_krw, paid_credits, status, created_at)
        VALUES (?1, ?2, 'polar', ?3, ?4, 'created_reserved', CURRENT_TIMESTAMP)`
      )
      .bind(orderId, userId, amountKrw, credits)
      .run();
  } catch (err) {
    await releaseCampaignReservation(env, orderId, "payment_row_insert_failed");
    throw err;
  }

  const checkoutUrlBase = normalizeText(env.POLAR_CHECKOUT_BASE_URL);
  const checkoutUrl = (() => {
    if (!checkoutUrlBase) {
      return `https://sandbox.polar.sh/checkout?reference_id=${encodeURIComponent(orderId)}&amount=${amountCents}`;
    }
    try {
      const u = new URL(checkoutUrlBase);
      u.searchParams.set("reference_id", orderId);
      u.searchParams.set("amount", String(amountCents));
      return u.toString();
    } catch (_) {
      const sep = checkoutUrlBase.includes("?") ? "&" : "?";
      return `${checkoutUrlBase}${sep}reference_id=${encodeURIComponent(orderId)}&amount=${amountCents}`;
    }
  })();

  const payload = {
    ok: true,
    provider: "polar",
    package_id: packageId,
    order_id: orderId,
    amount_krw: amountKrw,
    amount_usd: amountUsd,
    amount_cents: amountCents,
    paid_credits: credits,
    checkout_url: checkoutUrl
  };
  return json(payload, 200, cors);
}

async function handleBillingWebhook(req, env, cors) {
  if (!env.DB) {
    return json({ error: "DB binding is not configured" }, 500, cors);
  }
  const body = await req.json().catch(() => ({}));
  const signature = req.headers.get("x-polar-signature") || "";
  const expected = normalizeText(env.POLAR_WEBHOOK_SECRET);
  if (!expected) {
    return json({ error: "POLAR_WEBHOOK_SECRET is not configured" }, 500, cors);
  }
  if (expected && signature !== expected) {
    return json({ error: "Invalid webhook signature" }, 401, cors);
  }

  const eventType = normalizeText(body.type);
  const orderId = normalizeText(body.order_id);
  if (!orderId) return json({ error: "`order_id` is required" }, 400, cors);

  const payment = await env.DB
    .prepare(`SELECT order_id, user_id, paid_credits, status FROM payments WHERE order_id = ?1`)
    .bind(orderId)
    .first();
  if (!payment) return json({ error: "Payment not found" }, 404, cors);
  if (payment.status === "succeeded") {
    return json({ ok: true, deduped: true }, 200, cors);
  }
  if (eventType !== "payment.succeeded") {
    // 결제 실패/취소/만료 웹훅인 경우 예약 수량을 즉시 반납
    await releaseCampaignReservation(env, orderId, eventType || "payment_not_succeeded");
    await env.DB
      .prepare(`UPDATE payments SET status = ?2, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?1`)
      .bind(orderId, normalizeText(eventType) || "failed")
      .run();
    return json({ ok: true, ignored: true }, 200, cors);
  }

  const reservation = await getCampaignReservationByOrder(env, orderId);
  if (reservation?.status === "consumed") {
    await env.DB
      .prepare(`UPDATE payments SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?1`)
      .bind(orderId)
      .run();
    return json({ ok: true, deduped: true }, 200, cors);
  }
  if (!reservation || reservation.status !== "reserved") {
    await env.DB
      .prepare(`UPDATE payments SET status = 'failed_no_reservation', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?1`)
      .bind(orderId)
      .run();
    return json(
      {
        error: "Reserved quota not found",
        detail: "예약된 쿠폰 수량을 찾을 수 없어 지급을 중단했습니다. 결제 확인 후 환불 처리 대상입니다.",
        order_id: orderId
      },
      409,
      cors
    );
  }

  try {
    await addCredits(env, payment.user_id, Number(payment.paid_credits || 0), 0, "charge", orderId);
    await consumeCampaignReservation(env, orderId);
  } catch (err) {
    const detail = normalizeText(err?.message) || "Credit grant rejected";
    await releaseCampaignReservation(env, orderId, "grant_limit");
    await env.DB
      .prepare(`UPDATE payments SET status = 'failed_limit', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?1`)
      .bind(orderId)
      .run();
    return json({ error: "Credit grant blocked by limit", detail, order_id: orderId }, 409, cors);
  }
  await env.DB
    .prepare(`UPDATE payments SET status = 'succeeded', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?1`)
    .bind(orderId)
    .run();
  return json({ ok: true }, 200, cors);
}

async function handleAuthWhoAmI(req, env, cors) {
  const auth = await requireFirebaseUser(req, env, cors);
  if (!auth.ok) return auth.response;
  return json({ ok: true, uid: auth.uid, email: auth.email || null }, 200, cors);
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
  if (ultrasoundImageDataUrls.length < 1 || ultrasoundImageDataUrls.length > 2) {
    return json({ error: "`ultrasound_image_data_urls` must contain 1~2 images" }, 400, cors);
  }
  if (!gestationalWeeks || gestationalWeeks < 4 || gestationalWeeks > 42) {
    return json({ error: "`gestational_weeks` must be between 4 and 42" }, 400, cors);
  }
  if (!gender) {
    return json({ error: "`gender` is required (`female` | `male` | `unknown`)" }, 400, cors);
  }

  const totalImageCount = 2 + ultrasoundImageDataUrls.length;
  if (totalImageCount < 3 || totalImageCount > 4) {
    return json({ error: "Total image count must be 3~4" }, 400, cors);
  }

  const requestContext = {
    path: new URL(req.url).pathname,
    cf_country: req?.cf?.country || null,
    cf_colo: req?.cf?.colo || null
  };

  let usageState = null;
  let deductionReverted = false;
  const maybeRevertDeduction = async (reason) => {
    if (!usageState || deductionReverted) return;
    await revertDeduction(
      env,
      usageState.uid,
      usageState.paidDelta,
      usageState.bonusDelta,
      `${usageState.sourceId}:${reason}`
    );
    deductionReverted = true;
  };

  if (env.DB) {
    const auth = await requireFirebaseUser(req, env, cors);
    if (!auth.ok) return auth.response;
    const sourceId = `img_${crypto.randomUUID()}`;
    const deduction = await deductCreditsOrThrow(env, auth.uid, 250, sourceId);
    if (!deduction.ok) {
      const wallet = await getWallet(env, auth.uid);
      return json(
        {
          error: "Insufficient credits",
          required_credits: 250,
          paid_credits: Number(wallet?.paid_credits || 0),
          bonus_credits: Number(wallet?.bonus_credits || 0)
        },
        402,
        cors
      );
    }
    usageState = {
      uid: auth.uid,
      sourceId,
      paidDelta: deduction.paidDelta,
      bonusDelta: deduction.bonusDelta
    };
  }

  try {
  const explicitTestMode = body?.test_mode === true;
  const testMode = explicitTestMode;
  const genderLabel =
    gender === "female" ? "girl" : gender === "male" ? "boy" : "unknown";

  const analysisUserContent = [
    {
      type: "input_text",
      text: [
        "Analyze parent photos and ultrasound photos together and infer likely newborn face traits.",
        "Focus on eyes, nose, mouth, and side profile from all references.",
        "Default to a Korean newborn appearance baseline unless parent features clearly indicate another ethnicity.",
        "If either parent has visible non-Korean traits, preserve and reflect those traits naturally.",
        "Return strict JSON only with these keys:",
        "{\"combined_features_english\":\"...\",\"eye_features_english\":\"...\",\"nose_features_english\":\"...\",\"mouth_features_english\":\"...\",\"side_profile_features_english\":\"...\"}.",
        "Use concise phrases, no diagnosis.",
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

  let featurePayload = extractFeaturePayload("");
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
            content: [{ type: "input_text", text: "You extract newborn facial traits from reference images for a realistic portrait prompt." }]
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
      await maybeRevertDeduction("analysis_error");
      return json(buildOpenAiErrorPayload(analysisJson, "Failed to analyze parent/ultrasound images", requestContext), analysisRes.status, cors);
    }
    featurePayload = extractFeaturePayload(extractResponseText(analysisJson));
  }
  const combinedFeatures = normalizeText(featurePayload.combined_features_english);
  const featureSentence = buildRealisticFeatureSentence(featurePayload);

  const imagePrompt = [
    "A high-quality photorealistic portrait of a newborn baby, just a few days old.",
    "The baby is sleeping peacefully, swaddled in a clean white newborn blanket, wearing a tiny white knit beanie.",
    "Default appearance baseline: Korean newborn (East Asian) unless parent traits clearly suggest otherwise.",
    "If parent photos show non-Korean ancestry traits, blend and preserve those traits naturally.",
    "Preserve natural newborn proportions and skin texture.",
    `Use parent resemblance cues and ultrasound cues for facial structure: ${featureSentence}.`,
    `Combined newborn facial traits: ${combinedFeatures}.`,
    "Bright, clean, high-key lighting with a soft white background and minimal visual clutter.",
    "Overall tone should be bright, neat, and gentle with realistic color grading.",
    "Close-up camera angle, shallow depth of field.",
    "No cartoon, no 3D animation, no illustration, no stylization.",
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
      quality: "medium",
      n: 1
    })
  });

  const imageJson = await imageRes.json().catch(() => ({}));
  if (!imageRes.ok) {
    await maybeRevertDeduction("image_error");
    return json(buildOpenAiErrorPayload(imageJson, "Failed to generate image", requestContext), imageRes.status, cors);
  }

  const b64 = imageJson?.data?.[0]?.b64_json || "";
  if (!b64) {
    await maybeRevertDeduction("empty_image");
    return json({ error: "Image API returned no image payload" }, 500, cors);
  }

  const imageDataUrl = `data:image/png;base64,${b64}`;

  let walletSnapshot = null;
  if (usageState && env.DB) {
    // Keep serving the generated image even if history persistence fails.
    try {
      await savePhotoHistory(env, usageState.uid, imageDataUrl);
    } catch (_) {
      // no-op
    }
    walletSnapshot = await getWallet(env, usageState.uid);
  }

  return json(
    {
      ok: true,
      image_data_url: imageDataUrl,
      prompt_used: imagePrompt,
      combined_features_english: combinedFeatures,
      eye_features_english: featurePayload.eye_features_english,
      nose_features_english: featurePayload.nose_features_english,
      mouth_features_english: featurePayload.mouth_features_english,
      side_profile_features_english: featurePayload.side_profile_features_english,
      test_mode: testMode,
      wallet: walletSnapshot
        ? {
            paid_credits: Number(walletSnapshot.paid_credits || 0),
            bonus_credits: Number(walletSnapshot.bonus_credits || 0),
            total_credits:
              Number(walletSnapshot.paid_credits || 0) +
              Number(walletSnapshot.bonus_credits || 0)
          }
        : null
    },
    200,
    cors
  );
  } catch (err) {
    await maybeRevertDeduction("unexpected_error");
    const message = normalizeText(err?.message) || "Unexpected server error";
    return json({ error: message }, 500, cors);
  }
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

    if (url.pathname === "/api/auth/whoami") {
      if (req.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
      return handleAuthWhoAmI(req, env, cors);
    }
    if (url.pathname === "/api/wallet") {
      if (req.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
      return handleWalletApi(req, env, cors);
    }
    if (url.pathname === "/api/baby-photo/history") {
      if (req.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
      return handleBabyPhotoHistoryApi(req, env, cors);
    }
    if (url.pathname === "/api/billing/checkout") {
      if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      return handleBillingCheckout(req, env, cors);
    }
    if (url.pathname === "/api/billing/webhook") {
      if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      return handleBillingWebhook(req, env, cors);
    }

    if (url.pathname === "/api/ai") {
      if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      if (!env.OPENAI_API_KEY) {
        return json({ error: "OPENAI_API_KEY is not configured" }, 500, cors);
      }
      return handleAiApi(req, env, cors);
    }
    if (url.pathname === "/api/baby-photo") {
      if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);
      if (!env.OPENAI_API_KEY) {
        return json({ error: "OPENAI_API_KEY is not configured" }, 500, cors);
      }
      return handleBabyPhoto(req, env, cors);
    }
    return json({ error: "Not found" }, 404, cors);
  }
};
