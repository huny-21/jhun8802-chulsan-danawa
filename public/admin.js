import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const DEFAULT_AI_API_BASE = "https://chulsan-danawa-ai.jhun8802.workers.dev";
const AI_API_BASE = typeof window !== "undefined" && typeof window.AI_API_BASE === "string"
  ? window.AI_API_BASE.replace(/\/+$/, "") || DEFAULT_AI_API_BASE
  : DEFAULT_AI_API_BASE;
const FIREBASE_AUTH_CONFIG = typeof window !== "undefined" && window.FIREBASE_AUTH_CONFIG
  ? window.FIREBASE_AUTH_CONFIG
  : { enabled: false };

const els = {
  loginBtn: document.getElementById("adminLoginBtn"),
  logoutBtn: document.getElementById("adminLogoutBtn"),
  reloadBtn: document.getElementById("adminReloadBtn"),
  authStatus: document.getElementById("adminAuthStatus"),
  dashboard: document.getElementById("adminDashboard"),
  cfgStatus: document.getElementById("cfgStatus"),
  cfgSaveBtn: document.getElementById("cfgSaveBtn"),
  cfgReloadBtn: document.getElementById("cfgReloadBtn"),
  paymentsReloadBtn: document.getElementById("paymentsReloadBtn"),
  usersReloadBtn: document.getElementById("usersReloadBtn"),
  paymentsSummary: document.getElementById("paymentsSummary"),
  paymentsBody: document.getElementById("paymentsBody"),
  usersBody: document.getElementById("usersBody")
};

const configInputs = {
  AI_DEFAULT_MODEL: document.getElementById("cfgAiDefaultModel"),
  BABY_PHOTO_PROMPT_VERSION: document.getElementById("cfgPromptVersion"),
  BABY_PHOTO_IMAGE_MODEL: document.getElementById("cfgImageModel"),
  BABY_PHOTO_IMAGE_STYLE_PROMPT: document.getElementById("cfgImageStylePrompt"),
  BABY_PHOTO_IMAGE_SCENE_PROMPT: document.getElementById("cfgImageScenePrompt"),
  BABY_PHOTO_IMAGE_SAFETY_PROMPT: document.getElementById("cfgImageSafetyPrompt"),
  BABY_PHOTO_IMAGE_NEGATIVE_PROMPT: document.getElementById("cfgImageNegativePrompt"),
  BABY_PHOTO_ANALYSIS_MODEL: document.getElementById("cfgAnalysisModel"),
  BABY_PHOTO_ANALYSIS_PROMPT_VERSION: document.getElementById("cfgAnalysisPromptVersion"),
  BABY_PHOTO_ANALYSIS_SYSTEM_PROMPT: document.getElementById("cfgAnalysisSystemPrompt"),
  BABY_PHOTO_ANALYSIS_INSTRUCTION_OVERRIDE: document.getElementById("cfgAnalysisInstructionOverride"),
  BABY_PHOTO_IMAGE_PROMPT_OVERRIDE: document.getElementById("cfgImagePromptOverride")
};

let firebaseAuth = null;
let firebaseUser = null;
let firebaseIdToken = "";
let adminAuthorized = false;

function setStatus(el, message, type = "") {
  if (!el) return;
  el.textContent = message || "";
  el.classList.remove("ok", "error");
  if (type) el.classList.add(type);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

async function apiRequest(path, options = {}) {
  if (!firebaseIdToken) {
    throw new Error("로그인이 필요합니다.");
  }
  const response = await fetch(`${AI_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${firebaseIdToken}`,
      ...(options.headers || {})
    }
  });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch (_) {
    throw new Error("서버 응답을 해석할 수 없습니다.");
  }
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.detail || data?.error || "요청에 실패했습니다.");
  }
  return data;
}

function updateAuthUi() {
  if (firebaseUser) {
    els.loginBtn?.classList.add("hidden");
    els.logoutBtn?.classList.remove("hidden");
    els.reloadBtn?.classList.remove("hidden");
  } else {
    els.loginBtn?.classList.remove("hidden");
    els.logoutBtn?.classList.add("hidden");
    els.reloadBtn?.classList.add("hidden");
  }
  if (!adminAuthorized) {
    els.dashboard?.classList.add("hidden");
  }
}

function applyRuntimeConfigToForm(config = {}) {
  Object.entries(configInputs).forEach(([key, input]) => {
    if (!input) return;
    input.value = typeof config[key] === "string" ? config[key] : "";
  });
}

async function loadRuntimeConfig() {
  const data = await apiRequest("/api/admin/runtime-config");
  applyRuntimeConfigToForm(data?.config || {});
}

async function saveRuntimeConfig() {
  const config = {};
  Object.entries(configInputs).forEach(([key, input]) => {
    config[key] = input?.value || "";
  });
  await apiRequest("/api/admin/runtime-config", {
    method: "PUT",
    body: JSON.stringify({ config })
  });
}

function renderPayments(data = {}) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rows = items.map((item) => `<tr>
    <td>${escapeHtml(item.order_id)}</td>
    <td>${escapeHtml(item.user_id)}</td>
    <td>${escapeHtml(item.amount_krw)}</td>
    <td>${escapeHtml(item.paid_credits)}</td>
    <td>${escapeHtml(item.status)}</td>
    <td>${escapeHtml(item.created_at)}</td>
  </tr>`);
  els.paymentsBody.innerHTML = rows.join("") || '<tr><td colspan="6">데이터 없음</td></tr>';
  const summary = data?.summary || {};
  setStatus(
    els.paymentsSummary,
    `실결제 ${Number(summary.succeeded_count || 0)}건, Polar 완료 매출 ${Number(summary.succeeded_amount_krw || 0).toLocaleString()}원`
  );
}

function renderUsers(data = {}) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const rows = items.map((item) => `<tr>
    <td>${escapeHtml(item.user_id)}</td>
    <td>${escapeHtml(item.paid_credits)}</td>
    <td>${escapeHtml(item.bonus_credits)}</td>
    <td>${escapeHtml(item.payment_count)}</td>
    <td>${escapeHtml(item.last_payment_at)}</td>
    <td>${escapeHtml(item.photo_count)}</td>
    <td>${escapeHtml(item.updated_at)}</td>
  </tr>`);
  els.usersBody.innerHTML = rows.join("") || '<tr><td colspan="7">데이터 없음</td></tr>';
}

async function loadPayments() {
  const data = await apiRequest("/api/admin/payments?limit=100");
  renderPayments(data);
}

async function loadUsers() {
  const data = await apiRequest("/api/admin/users?limit=100");
  renderUsers(data);
}

async function loadDashboard() {
  await Promise.all([loadRuntimeConfig(), loadPayments(), loadUsers()]);
}

async function verifyAdmin() {
  const data = await apiRequest("/api/admin/whoami");
  if (!data?.is_admin) {
    throw new Error("관리자 권한이 없습니다.");
  }
}

function initEvents(provider) {
  els.loginBtn?.addEventListener("click", async () => {
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err) {
      setStatus(els.authStatus, `로그인 실패: ${err instanceof Error ? err.message : "unknown"}`, "error");
    }
  });

  els.logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      setStatus(els.authStatus, `로그아웃 실패: ${err instanceof Error ? err.message : "unknown"}`, "error");
    }
  });

  els.reloadBtn?.addEventListener("click", async () => {
    if (!adminAuthorized) return;
    try {
      await loadDashboard();
      setStatus(els.authStatus, "새로고침 완료", "ok");
    } catch (err) {
      setStatus(els.authStatus, err instanceof Error ? err.message : "새로고침 실패", "error");
    }
  });

  els.cfgSaveBtn?.addEventListener("click", async () => {
    if (!adminAuthorized) return;
    try {
      await saveRuntimeConfig();
      await loadRuntimeConfig();
      setStatus(els.cfgStatus, "운영 설정 저장 완료", "ok");
    } catch (err) {
      setStatus(els.cfgStatus, err instanceof Error ? err.message : "저장 실패", "error");
    }
  });

  els.cfgReloadBtn?.addEventListener("click", async () => {
    if (!adminAuthorized) return;
    try {
      await loadRuntimeConfig();
      setStatus(els.cfgStatus, "설정 다시 불러오기 완료", "ok");
    } catch (err) {
      setStatus(els.cfgStatus, err instanceof Error ? err.message : "불러오기 실패", "error");
    }
  });

  els.paymentsReloadBtn?.addEventListener("click", async () => {
    if (!adminAuthorized) return;
    try {
      await loadPayments();
    } catch (err) {
      setStatus(els.authStatus, err instanceof Error ? err.message : "결제 조회 실패", "error");
    }
  });

  els.usersReloadBtn?.addEventListener("click", async () => {
    if (!adminAuthorized) return;
    try {
      await loadUsers();
    } catch (err) {
      setStatus(els.authStatus, err instanceof Error ? err.message : "사용자 조회 실패", "error");
    }
  });
}

function initAdminPage() {
  if (!FIREBASE_AUTH_CONFIG?.enabled) {
    setStatus(els.authStatus, "Firebase 인증 설정이 비활성화되어 있습니다.", "error");
    return;
  }
  if (!FIREBASE_AUTH_CONFIG.apiKey || !FIREBASE_AUTH_CONFIG.appId || !FIREBASE_AUTH_CONFIG.projectId) {
    setStatus(els.authStatus, "Firebase 설정값(apiKey/appId/projectId)이 누락되었습니다.", "error");
    return;
  }
  const app = initializeApp({
    apiKey: FIREBASE_AUTH_CONFIG.apiKey,
    authDomain: FIREBASE_AUTH_CONFIG.authDomain,
    projectId: FIREBASE_AUTH_CONFIG.projectId,
    appId: FIREBASE_AUTH_CONFIG.appId
  });
  firebaseAuth = getAuth(app);
  const provider = new GoogleAuthProvider();
  initEvents(provider);

  onAuthStateChanged(firebaseAuth, async (user) => {
    firebaseUser = user || null;
    firebaseIdToken = user ? await user.getIdToken() : "";
    adminAuthorized = false;
    updateAuthUi();
    if (!firebaseUser) {
      setStatus(els.authStatus, "로그인 필요", "");
      return;
    }
    try {
      await verifyAdmin();
      adminAuthorized = true;
      updateAuthUi();
      els.dashboard?.classList.remove("hidden");
      setStatus(els.authStatus, `관리자 로그인됨: ${firebaseUser.email || ""}`, "ok");
      await loadDashboard();
    } catch (err) {
      setStatus(els.authStatus, err instanceof Error ? err.message : "권한 확인 실패", "error");
      els.dashboard?.classList.add("hidden");
    }
  });
}

initAdminPage();
