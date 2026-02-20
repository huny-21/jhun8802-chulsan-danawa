import { governmentBenefits, localBenefitsData } from './data.js?v=2';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const GA_MEASUREMENT_ID = 'G-Z1R3F1Y8C5';
const CLARITY_PROJECT_ID = 'viza42872j';
const DEFAULT_AI_API_BASE = 'https://chulsan-danawa-ai.jhun8802.workers.dev';
const AI_API_BASE = typeof window !== 'undefined' && typeof window.AI_API_BASE === 'string'
    ? (window.AI_API_BASE.replace(/\/+$/, '') || DEFAULT_AI_API_BASE)
    : DEFAULT_AI_API_BASE;
const FIREBASE_AUTH_CONFIG = typeof window !== 'undefined' && window.FIREBASE_AUTH_CONFIG
    ? window.FIREBASE_AUTH_CONFIG
    : { enabled: false };

// DOM 요소
const citySelect = document.getElementById('citySelect');
const districtSelect = document.getElementById('districtSelect');
const benefitForm = document.getElementById('benefitForm');
const dueDateInput = document.getElementById('dueDate');
const submitBtn = benefitForm ? benefitForm.querySelector('.btn-primary') : null;
const formError = document.getElementById('formError');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultSection = document.getElementById('resultSection');
const govBenefitList = document.getElementById('govBenefitList');
const localBenefitList = document.getElementById('localBenefitList');
const selectedRegionName = document.getElementById('selectedRegionName');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const governmentTabContent = document.getElementById('government');
const localTabContent = document.getElementById('local');

// 체크리스트 요소
const checklistSection = document.getElementById('checklistSection');
const dDayDisplay = document.getElementById('dDayDisplay');
const dDayMessage = document.getElementById('dDayMessage');
const checklistItems = document.getElementById('checklistItems');
const serviceTabBtns = document.querySelectorAll('.service-tab');
const servicePanels = {
    benefit: document.getElementById('benefitServicePanel'),
    calculator: document.getElementById('calculatorServicePanel'),
    calendar: document.getElementById('calendarServicePanel'),
    ai: document.getElementById('aiServicePanel')
};
const quickStartBtns = document.querySelectorAll('.quick-start-btn');
const babyPhotoForm = document.getElementById('babyPhotoForm');
const ultrasoundImageInput = document.getElementById('ultrasoundImageInput');
const motherPhotoInput = document.getElementById('motherPhotoInput');
const fatherPhotoInput = document.getElementById('fatherPhotoInput');
const gestationalWeeksInput = document.getElementById('gestationalWeeksInput');
const babyGenderInput = document.getElementById('babyGenderInput');
const babyPhotoSubmitBtn = document.getElementById('babyPhotoSubmitBtn');
const babyPhotoStatus = document.getElementById('babyPhotoStatus');
const babyPhotoLoading = document.getElementById('babyPhotoLoading');
const babyPhotoLoadingTitle = document.getElementById('babyPhotoLoadingTitle');
const babyPhotoLoadingDetail = document.getElementById('babyPhotoLoadingDetail');
const babyPhotoResultWrap = document.getElementById('babyPhotoResultWrap');
const babyPhotoResultImage = document.getElementById('babyPhotoResultImage');
const babyPhotoDownloadBtn = document.getElementById('babyPhotoDownloadBtn');
const babyPhotoHistoryWrap = document.getElementById('babyPhotoHistoryWrap');
const babyPhotoHistoryList = document.getElementById('babyPhotoHistoryList');
const aiEventPopup = document.getElementById('aiEventPopup');
const aiEventPopupCloseBtn = document.getElementById('aiEventPopupCloseBtn');
const photoAlbumBtn = document.getElementById('photoAlbumBtn');
const photoAlbumModal = document.getElementById('photoAlbumModal');
const photoAlbumCloseBtn = document.getElementById('photoAlbumCloseBtn');
const photoAlbumList = document.getElementById('photoAlbumList');
const photoAlbumDownloadBtn = document.getElementById('photoAlbumDownloadBtn');
const aiAuthStatus = document.getElementById('aiAuthStatus');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleLogoutBtn = document.getElementById('googleLogoutBtn');
const walletBox = document.getElementById('walletBox');
const walletStatus = document.getElementById('walletStatus');
const chargeCreditsBtn = document.getElementById('chargeCreditsBtn');
const refreshWalletBtn = document.getElementById('refreshWalletBtn');
const chargeDollarInput = document.getElementById('chargeDollarInput');
const MAX_ULTRASOUND_FILES = 2;
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const CREDITS_PER_IMAGE = 250;
const AI_EVENT_POPUP_SESSION_KEY = 'ai_event_popup_seen_v1';
const AI_PHOTO_DISABLED = false;
const AI_PHOTO_HIDDEN = false;
const namingLabForm = document.getElementById('namingLabForm');
const namingLayerInputs = Array.from(document.querySelectorAll('[data-layer-input]'));
const namingLayerSummary = document.getElementById('namingLayerSummary');
const namingLayerImpactHint = document.getElementById('namingLayerImpactHint');
const namingPresetBtns = Array.from(document.querySelectorAll('[data-naming-preset]'));
const namingApplyLayersBtn = document.getElementById('namingApplyLayersBtn');
const namingInterviewGuide = document.getElementById('namingInterviewGuide');
const namingQuestionList = document.getElementById('namingQuestionList');
const namingLabSubmitBtn = document.getElementById('namingLabSubmitBtn');
const namingLabStatus = document.getElementById('namingLabStatus');
const namingPlanSelect = document.getElementById('namingPlanSelect');
const namingLabResultWrap = document.getElementById('namingLabResultWrap');
const namingLabSummary = document.getElementById('namingLabSummary');
const namingCandidateList = document.getElementById('namingCandidateList');
const namingScoreTableBody = document.getElementById('namingScoreTableBody');
const namingCertificateText = document.getElementById('namingCertificateText');
const namingChildGender = document.getElementById('namingChildGender');
const namingSurnameInput = document.getElementById('namingSurname');
const namingGivenNameMinLengthInput = document.getElementById('namingGivenNameMinLength');
const namingGivenNameMaxLengthInput = document.getElementById('namingGivenNameMaxLength');
const namingLinkSurnameInput = document.getElementById('namingLinkSurname');
const namingSiblingConsistencyInput = document.getElementById('namingSiblingConsistency');
const namingSiblingNamesWrap = document.getElementById('namingSiblingNamesWrap');
const namingSiblingNamesInput = document.getElementById('namingSiblingNames');
const namingDetailHeader = document.getElementById('namingDetailHeader');
const namingDetailName = document.getElementById('namingDetailName');
const namingDetailEnglish = document.getElementById('namingDetailEnglish');
const namingDetailHanja = document.getElementById('namingDetailHanja');
const namingDetailMeaning = document.getElementById('namingDetailMeaning');
const namingDetailExpert = document.getElementById('namingDetailExpert');
const namingLayerRadarSvg = document.getElementById('namingLayerRadarSvg');
const namingSealStatus = document.getElementById('namingSealStatus');
const namingSealImage = document.getElementById('namingSealImage');
const namingTopPick = document.getElementById('namingTopPick');
const namingTopPickName = document.getElementById('namingTopPickName');
const namingTopPickReasonBtn = document.getElementById('namingTopPickReasonBtn');
const namingTopPickReason = document.getElementById('namingTopPickReason');
const HAS_BABY_PHOTO_UI = Boolean(babyPhotoForm && ultrasoundImageInput && motherPhotoInput && fatherPhotoInput);
const uploadFieldLabelMap = {
    motherPhotoInput: '엄마 사진',
    fatherPhotoInput: '아빠 사진',
    ultrasoundImageInput: '초음파 사진'
};

let firebaseAuth = null;
let firebaseUser = null;
let firebaseIdToken = '';
let walletState = null;
let babyPhotoHistoryItems = [];
let selectedAlbumImageDataUrl = '';
let currentPlannerStep = 1;
let babyPhotoLoadingTimer = null;
let lastTrackedServiceTab = '';
let namingQuestionState = [];
let namingAnswerCache = {};
let namingReportItems = [];
const namingSealCache = new Map();
let namingConstraintsState = {
    surname: '김',
    given_name_min_length: 2,
    given_name_max_length: 2,
    consider_surname_linkage: true,
    sibling_consistency: false,
    sibling_names: []
};

const SERVICE_GA_META = {
    benefit: { path: '/service/benefit', title: '혜택 찾기' },
    calculator: { path: '/service/calculator', title: '육아휴직 계산기' },
    calendar: { path: '/service/calendar', title: '출산휴가 달력' },
    ai: { path: '/service/naming-lab' , title: '우리 아이 첫 이름 연구소' }
};

const NAMING_LAYER_META = {
    saju: {
        label: '사주',
        questions: [
            '아이 이름에서 가장 우선하고 싶은 오행/균형 포인트는 무엇인가요?',
            '전통 작명에서 꼭 지키고 싶은 기준이 있다면 적어주세요.',
            '가문/돌림자/한자 사용 관련해서 원하는 규칙이 있나요?'
        ]
    },
    trend: {
        label: '트렌드(인기)',
        questions: [
            '요즘 감성으로 봤을 때 이름의 분위기를 어떻게 가져가고 싶나요?',
            '희소한 이름과 익숙한 이름 중 어디에 더 가깝게 원하시나요?',
            '부모님이 선호하는 이름 톤(세련됨/부드러움/강인함)을 알려주세요.'
        ]
    },
    story: {
        label: '감성(스토리)',
        questions: [
            '아이가 어떤 삶의 태도를 가졌으면 좋겠나요?',
            '이름에 담고 싶은 가족의 가치나 철학을 적어주세요.',
            '아이가 커서 들었을 때 힘이 되는 한 문장을 적어주세요.'
        ]
    },
    global: {
        label: '글로벌(국제)',
        questions: [
            '영문 표기에서 발음/철자 편의성 중 무엇을 더 중시하나요?',
            '해외에서도 자연스럽게 불리길 원하는 이름 스타일이 있나요?',
            '국문 이름과 영문 이름의 유사성을 어느 정도 원하시나요?'
        ]
    },
    energy: {
        label: '에너지(파동)',
        questions: [
            '이름에서 듣고 싶은 소리의 인상(맑음/부드러움/단단함)은 무엇인가요?',
            '반복해서 불렀을 때 가장 편안한 발음 길이는 어느 정도인가요?',
            '이름이 주길 바라는 운의 방향(건강/관계/도전 등)을 적어주세요.'
        ]
    },
    religion: {
        label: '종교',
        questions: [
            '가정의 신앙/종교적 가치 중 이름에 담고 싶은 핵심은 무엇인가요?',
            '피하고 싶은 종교적 표현 또는 선호하는 상징(빛/은총/평화 등)이 있나요?',
            '아이가 공동체 안에서 어떤 덕목을 실천하길 바라시나요?'
        ]
    }
};

const NAMING_LAYER_IMPACT_HINT = {
    saju: '사주 비중이 높을수록 오행 균형과 전통 작명 규칙을 우선합니다.',
    trend: '트렌드 비중이 높을수록 세련미와 동시대 감각을 우선합니다.',
    story: '감성 비중이 높을수록 부드러운 발음과 서정적 의미를 우선합니다.',
    global: '글로벌 비중이 높을수록 영문 발음 편의와 국제 호환성을 우선합니다.',
    energy: '에너지 비중이 높을수록 소리의 울림과 긍정적 인상을 우선합니다.',
    religion: '종교 비중이 높을수록 가정의 신념과 상징 의미를 우선합니다.'
};

const NAMING_PRESET_MAP = {
    traditional: { saju: 90, trend: 30, story: 55, global: 35, energy: 60, religion: 55 },
    emotional: { saju: 55, trend: 35, story: 95, global: 45, energy: 70, religion: 40 },
    global: { saju: 40, trend: 60, story: 55, global: 95, energy: 50, religion: 35 },
    trendy: { saju: 35, trend: 95, story: 60, global: 65, energy: 55, religion: 25 },
    ai: { saju: 70, trend: 55, story: 80, global: 60, energy: 65, religion: 40 }
};

const NAMING_ANSWER_PLACEHOLDER = {
    saju: '예: 화(火) 기운이 강해 수(水)·목(木) 보완을 원해요.',
    trend: '예: 흔하지 않지만 세련된, 발음이 깔끔한 이름이 좋아요.',
    story: '예: 따뜻하고 사람을 배려하는 아이였으면 해요.',
    global: '예: 해외에서도 발음이 쉬운 2음절 이름을 원해요.',
    energy: '예: 밝고 부드럽게 들리는 소리를 우선하고 싶어요.',
    religion: '예: 은총, 평화, 사랑의 상징이 담긴 의미를 원해요.'
};

function getAvailableServiceTabBtns() {
    return Array.from(serviceTabBtns).filter((btn) => btn?.isConnected && !btn.classList.contains('hidden'));
}

function applyAiPhotoVisibility() {
    if (!AI_PHOTO_HIDDEN) return;
    const aiTabBtn = document.getElementById('service-tab-ai');
    const aiPanel = servicePanels.ai;
    if (aiTabBtn) aiTabBtn.remove();
    if (aiPanel) {
        aiPanel.classList.remove('active');
        aiPanel.setAttribute('hidden', '');
        aiPanel.classList.add('hidden');
    }
    quickStartBtns.forEach((btn) => {
        if (btn?.dataset?.quickService === 'ai') {
            btn.classList.add('hidden');
            btn.setAttribute('hidden', '');
        }
    });
}

function trackGaEvent(eventName, params = {}) {
    if (typeof window === 'undefined') return;
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
}

function trackServicePageView(target, source = 'service_tab') {
    const meta = SERVICE_GA_META[target];
    if (!meta || target === lastTrackedServiceTab) return;
    lastTrackedServiceTab = target;
    trackGaEvent('page_view', {
        page_title: meta.title,
        page_location: `${window.location.origin}${meta.path}`,
        page_path: meta.path,
        service_name: target,
        navigation_source: source
    });
}

function getUserAgent() {
    if (typeof navigator === 'undefined') return '';
    return String(navigator.userAgent || '');
}

function isKakaoInAppBrowser() {
    return /KAKAOTALK/i.test(getUserAgent());
}

function openCurrentPageInExternalBrowser() {
    if (typeof window === 'undefined') return false;
    const currentUrl = window.location.href;
    if (!currentUrl) return false;
    if (isKakaoInAppBrowser()) {
        const encodedUrl = encodeURIComponent(currentUrl);
        window.location.href = `kakaotalk://web/openExternal?url=${encodedUrl}`;
        return true;
    }
    const win = window.open(currentUrl, '_blank', 'noopener,noreferrer');
    return !!win;
}

function getBabyPhotoHistoryStatusEl() {
    if (!babyPhotoHistoryWrap || !babyPhotoHistoryList) return null;
    let statusEl = babyPhotoHistoryWrap.querySelector('[data-history-sync-status="true"]');
    if (statusEl) return statusEl;
    statusEl = document.createElement('p');
    statusEl.className = 'readonly-hint hidden';
    statusEl.setAttribute('data-history-sync-status', 'true');
    babyPhotoHistoryWrap.insertBefore(statusEl, babyPhotoHistoryList);
    return statusEl;
}

function setBabyPhotoHistoryStatus(message, isError = false) {
    const statusEl = getBabyPhotoHistoryStatusEl();
    if (!statusEl) return;
    if (!message) {
        statusEl.textContent = '';
        statusEl.classList.add('hidden');
        statusEl.removeAttribute('style');
        return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    statusEl.style.color = isError ? '#B91C1C' : '#166534';
}

function setNamingLabStatus(message, isError = false) {
    if (!namingLabStatus) return;
    if (!message) {
        namingLabStatus.textContent = '';
        namingLabStatus.classList.add('hidden');
        namingLabStatus.removeAttribute('style');
        return;
    }
    namingLabStatus.textContent = message;
    namingLabStatus.classList.remove('hidden');
    namingLabStatus.style.borderColor = isError ? '#FCA5A5' : '#86EFAC';
    namingLabStatus.style.backgroundColor = isError ? '#FEF2F2' : '#F0FDF4';
    namingLabStatus.style.color = isError ? '#B91C1C' : '#166534';
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function getNamingLayerWeights() {
    const baseInputs = namingLayerInputs.length
        ? namingLayerInputs
        : ['layerSajuWeight', 'layerTrendWeight', 'layerStoryWeight', 'layerGlobalWeight', 'layerEnergyWeight', 'layerReligionWeight']
            .map((id) => document.getElementById(id))
            .filter(Boolean);
    return baseInputs
        .map((input) => {
            const key = String(input?.dataset?.layerInput || '').trim();
            const value = Number(input?.value || 0);
            const meta = NAMING_LAYER_META[key];
            if (!key || !meta) return null;
            return {
                key,
                label: meta.label,
                weight: Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0
            };
        })
        .filter(Boolean);
}

function getTopNamingLayers(limit = 3) {
    return getNamingLayerWeights()
        .sort((a, b) => b.weight - a.weight)
        .slice(0, Math.max(1, limit));
}

function updateNamingLayerSummary() {
    if (!namingLayerSummary) return;
    const topLayers = getTopNamingLayers(3);
    const top = topLayers.map((item) => `${item.label} ${item.weight}`).join(', ');
    namingLayerSummary.textContent = `현재 우선 레이어: ${top}`;
    if (namingLayerImpactHint) {
        const topKey = topLayers[0]?.key;
        const hint = topKey ? NAMING_LAYER_IMPACT_HINT[topKey] : '';
        namingLayerImpactHint.textContent = hint ? `레이어 설명: ${hint}` : '';
    }
}

function buildNamingQuestions() {
    const topLayers = getTopNamingLayers(3);
    const questions = [];
    topLayers.forEach((layer) => {
        const bank = NAMING_LAYER_META[layer.key]?.questions || [];
        const text = bank[0] || '';
        if (!text) return;
        questions.push({
            id: `layer_${layer.key}`,
            layerKey: layer.key,
            layerLabel: layer.label,
            text
        });
    });
    return questions;
}

function renderNamingQuestions() {
    if (!namingQuestionList) return;
    // Preserve existing answers when questions re-render.
    namingQuestionState.forEach((q, idx) => {
        const input = namingQuestionList.querySelector(`#namingQuestion_${idx}`);
        if (!input) return;
        namingAnswerCache[q.id] = String(input.value || '').trim();
    });
    namingQuestionState = buildNamingQuestions();
    if (!namingQuestionState.length) {
        namingQuestionList.innerHTML = '<p class="readonly-hint">레이어 값을 읽지 못했습니다. 새로고침 후 다시 시도해주세요.</p>';
        return;
    }
    namingQuestionList.innerHTML = namingQuestionState
        .map((q, idx) => `
            <div class="form-group naming-question-card">
                <label for="namingQuestion_${idx}">Q${idx + 1}. [${q.layerLabel}] ${q.text}</label>
                <textarea class="naming-question-input" id="namingQuestion_${idx}" data-question-id="${q.id}" rows="3" placeholder="${escapeHtml(NAMING_ANSWER_PLACEHOLDER[q.layerKey] || '답변을 입력해주세요.')}">${escapeHtml(namingAnswerCache[q.id] || '')}</textarea>
            </div>
        `)
        .join('');
}

function applyNamingPreset(presetKey) {
    const key = String(presetKey || '').trim();
    let preset = NAMING_PRESET_MAP[key];
    if (key === 'ai') {
        // AI 추천은 클릭할 때마다 5단위 랜덤 점수로 새 조합을 생성합니다.
        preset = {};
        Object.keys(NAMING_LAYER_META).forEach((layerKey) => {
            const randomStep = Math.floor(Math.random() * 21); // 0..20
            preset[layerKey] = randomStep * 5; // 0..100
        });
    }
    if (!preset) return;
    namingLayerInputs.forEach((input) => {
        const layerKey = String(input?.dataset?.layerInput || '').trim();
        if (!layerKey || !Object.prototype.hasOwnProperty.call(preset, layerKey)) return;
        input.value = String(preset[layerKey]);
        const valueEl = document.getElementById(`${input.id}Value`);
        if (valueEl) valueEl.textContent = String(preset[layerKey]);
    });
    updateNamingLayerSummary();
    setNamingLabStatus(key === 'ai'
        ? 'AI 추천 랜덤 프리셋이 적용되었습니다. "레이어 설정 반영"을 눌러 질문을 생성하세요.'
        : '프리셋이 적용되었습니다. "레이어 설정 반영"을 눌러 질문을 생성하세요.');
}

function applyNamingLayerConfig() {
    updateNamingLayerSummary();
    renderNamingQuestions();
    if (namingInterviewGuide) {
        namingInterviewGuide.textContent = '레이어 설정이 반영되었습니다. 아래 질문에 답변을 입력해 주세요.';
    }
    const count = namingQuestionState.length;
    setNamingLabStatus(count > 0
        ? `레이어 설정을 반영해 맞춤 인터뷰 질문 ${count}개를 생성했습니다.`
        : '질문 생성에 실패했습니다. 새로고침 후 다시 시도해주세요.', count <= 0);
}

function collectNamingAnswers() {
    if (!namingQuestionList) return [];
    return namingQuestionState.map((q, idx) => {
        const input = namingQuestionList.querySelector(`#namingQuestion_${idx}`);
        return {
            id: q.id,
            layerKey: q.layerKey,
            question: q.text,
            answer: String(input?.value || '').trim()
        };
    });
}

function parseJsonObjectFromText(rawText) {
    const text = String(rawText || '').trim();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (_err) {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch (_err2) {
            return null;
        }
    }
}

function normalizeNameLength(value, fallback = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(2, Math.min(4, Math.round(n)));
}

function collectNamingConstraints() {
    const surname = String(namingSurnameInput?.value || '').trim();
    let minLength = normalizeNameLength(namingGivenNameMinLengthInput?.value, 2);
    let maxLength = normalizeNameLength(namingGivenNameMaxLengthInput?.value, 2);
    if (minLength > maxLength) {
        const swap = minLength;
        minLength = maxLength;
        maxLength = swap;
        if (namingGivenNameMinLengthInput) namingGivenNameMinLengthInput.value = String(minLength);
        if (namingGivenNameMaxLengthInput) namingGivenNameMaxLengthInput.value = String(maxLength);
    }
    const siblingRaw = String(namingSiblingNamesInput?.value || '').trim();
    const siblingNames = siblingRaw
        .split(/[,\n]/)
        .map((x) => String(x || '').trim())
        .filter(Boolean)
        .slice(0, 5);
    return {
        surname,
        given_name_min_length: minLength,
        given_name_max_length: maxLength,
        consider_surname_linkage: namingLinkSurnameInput ? Boolean(namingLinkSurnameInput.checked) : true,
        sibling_consistency: namingSiblingConsistencyInput ? Boolean(namingSiblingConsistencyInput.checked) : false,
        sibling_names: siblingNames
    };
}

function combineDisplayName(nameKr) {
    const baseName = String(nameKr || '').trim();
    if (!baseName) return '-';
    const surname = String(namingConstraintsState?.surname || '').trim();
    const shouldLink = Boolean(namingConstraintsState?.consider_surname_linkage);
    if (!shouldLink || !surname) return baseName;
    if (baseName.startsWith(surname)) return baseName;
    return `${surname}${baseName}`;
}

async function generateNamingSealImage(nameText, topItem = null) {
    const name = String(nameText || '').trim();
    if (!namingSealStatus || !namingSealImage) return;
    if (!name) {
        namingSealStatus.textContent = '이름이 없어서 도장 이미지를 만들 수 없습니다.';
        namingSealImage.classList.add('hidden');
        namingSealImage.removeAttribute('src');
        return;
    }
    if (namingSealCache.has(name)) {
        namingSealImage.src = namingSealCache.get(name);
        namingSealImage.classList.remove('hidden');
        namingSealStatus.textContent = '1순위 이름 캘리그라피 도장입니다.';
        return;
    }
    namingSealStatus.textContent = '1순위 이름 도장 이미지를 생성하는 중...';
    namingSealImage.classList.add('hidden');
    namingSealImage.removeAttribute('src');
    if (!firebaseIdToken) {
        namingSealStatus.textContent = '로그인 후 도장 이미지를 생성할 수 있습니다.';
        return;
    }
    try {
        const response = await fetch(`${AI_API_BASE}/api/naming-seal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseIdToken}`
            },
            body: JSON.stringify({
                display_name: name,
                name_hanja: String(topItem?.name_hanja || '').trim(),
                name_meaning: String(topItem?.name_meaning || '').trim(),
                story: String(topItem?.story || '').trim()
            })
        });
        const data = await response.json().catch(() => ({}));
        const imageDataUrl = String(data?.image_data_url || '').trim();
        if (!response.ok || !data?.ok || !imageDataUrl.startsWith('data:image/')) {
            throw new Error(String(data?.error || '도장 이미지 생성 실패'));
        }
        namingSealCache.set(name, imageDataUrl);
        namingSealImage.src = imageDataUrl;
        namingSealImage.classList.remove('hidden');
        namingSealStatus.textContent = '1순위 이름 캘리그라피 도장입니다.';
    } catch (err) {
        namingSealStatus.textContent = err instanceof Error ? err.message : '도장 이미지 생성에 실패했습니다.';
    }
}

function scoreCell(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

function getLayerScore(item, key) {
    const s = item?.scores || {};
    return scoreCell(s[key]);
}

function renderNamingRadar(scores = {}) {
    if (!namingLayerRadarSvg) return;
    const axes = [
        { key: 'saju', label: '사주' },
        { key: 'trend', label: '트렌드' },
        { key: 'story', label: '감성' },
        { key: 'global', label: '글로벌' },
        { key: 'energy', label: '에너지' },
        { key: 'religion', label: '종교' }
    ];
    const cx = 180;
    const cy = 150;
    const radius = 95;
    const toPoint = (idx, ratio) => {
        const angle = (-Math.PI / 2) + (idx * (Math.PI * 2 / axes.length));
        const r = radius * ratio;
        return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    };
    const grid = [0.25, 0.5, 0.75, 1].map((step) => {
        const pts = axes.map((_, idx) => toPoint(idx, step).join(',')).join(' ');
        return `<polygon points="${pts}" fill="none" stroke="#d1d5db" stroke-width="1"/>`;
    }).join('');
    const spokes = axes.map((_, idx) => {
        const [x, y] = toPoint(idx, 1);
        return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    }).join('');
    const labels = axes.map((axis, idx) => {
        const [x, y] = toPoint(idx, 1.15);
        return `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="#334155">${axis.label}</text>`;
    }).join('');
    const valuePts = axes.map((axis, idx) => {
        const v = scoreCell(scores[axis.key]) / 100;
        return toPoint(idx, v).join(',');
    }).join(' ');
    namingLayerRadarSvg.innerHTML = `
      ${grid}
      ${spokes}
      <polygon points="${valuePts}" fill="rgba(74,143,134,0.22)" stroke="#2f766d" stroke-width="2"></polygon>
      ${labels}
    `;
}

function renderNamingDetail(item) {
    if (!item) return;
    if (namingDetailHeader) namingDetailHeader.textContent = `${combineDisplayName(item.name_kr || '-')} 상세 분석`;
    if (namingDetailName) namingDetailName.textContent = `${combineDisplayName(item.name_kr || '-')} ${item.name_hanja ? `(${item.name_hanja})` : ''}`.trim();
    if (namingDetailEnglish) namingDetailEnglish.textContent = item.name_en || '-';
    if (namingDetailHanja) namingDetailHanja.textContent = item.hanja_meaning ? `${item.name_hanja || '-'}: ${item.hanja_meaning}` : (item.name_hanja || '-');
    if (namingDetailMeaning) namingDetailMeaning.textContent = item.name_meaning || item.story || '-';
    if (namingDetailExpert) {
        const c = String(item.expert_commentary || '').trim();
        namingDetailExpert.textContent = c || '-';
    }
    renderNamingRadar(item.scores || {});
}

function renderNamingReport(report) {
    if (!namingLabResultWrap || !namingCandidateList || !namingScoreTableBody || !namingCertificateText || !namingLabSummary) return;
    const items = Array.isArray(report?.top_recommendations) ? report.top_recommendations : [];
    namingReportItems = items;
    namingCandidateList.innerHTML = items.map((item) => {
        const nameKr = combineDisplayName(item?.name_kr || '');
        const nameHanja = String(item?.name_hanja || '').trim();
        const nameEn = String(item?.name_en || '').trim();
        const story = String(item?.story || '').trim();
        return `
            <article class="ai-review-card naming-candidate-card" data-candidate-idx="${items.indexOf(item)}">
                <p class="ai-review-meta"><strong>${escapeHtml(nameKr)}</strong>${nameHanja ? ` · ${escapeHtml(nameHanja)}` : ''}${nameEn ? ` · ${escapeHtml(nameEn)}` : ''}</p>
                <p class="ai-review-text">${escapeHtml(story || '추천 스토리 준비 중')}</p>
            </article>
        `;
    }).join('') || '<p class="readonly-hint">추천 결과가 비어 있습니다. 답변을 더 구체적으로 작성해 다시 시도해 주세요.</p>';

    namingCandidateList.querySelectorAll('.naming-candidate-card').forEach((el) => {
        el.addEventListener('click', () => {
            namingCandidateList.querySelectorAll('.naming-candidate-card').forEach((c) => c.classList.remove('is-selected'));
            el.classList.add('is-selected');
            const idx = Number(el.getAttribute('data-candidate-idx'));
            renderNamingDetail(namingReportItems[idx] || null);
        });
    });

    namingScoreTableBody.innerHTML = items.map((item) => {
        const nameKr = combineDisplayName(item?.name_kr || '');
        return `<tr>
            <td>${escapeHtml(nameKr)}</td>
            <td>${getLayerScore(item, 'saju')}</td>
            <td>${getLayerScore(item, 'trend')}</td>
            <td>${getLayerScore(item, 'story')}</td>
            <td>${getLayerScore(item, 'global')}</td>
            <td>${getLayerScore(item, 'energy')}</td>
            <td>${getLayerScore(item, 'religion')}</td>
        </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty-table">점수 데이터가 없습니다.</td></tr>';

    namingLabSummary.textContent = String(report?.interview_summary || report?.naming_strategy || '').trim() || '인터뷰 요약이 없습니다.';
    namingCertificateText.textContent = String(report?.certificate_text || '').trim() || '인증서 문안이 없습니다.';
    const topPick = items[0] || null;
    if (topPick && namingTopPick && namingTopPickName && namingTopPickReason) {
        const topName = combineDisplayName(topPick.name_kr || '');
        const topReasonParts = [String(topPick.story || '').trim(), String(topPick.expert_commentary || '').trim()].filter(Boolean);
        namingTopPickName.textContent = topName;
        namingTopPickReason.textContent = topReasonParts.join(' ');
        namingTopPick.classList.remove('hidden');
        namingTopPickReason.classList.add('hidden');
        if (namingTopPickReasonBtn) namingTopPickReasonBtn.textContent = '이 이름을 추천한 이유 ▼';
        generateNamingSealImage(topName, topPick);
    } else if (namingTopPick) {
        namingTopPick.classList.add('hidden');
        if (namingSealStatus) namingSealStatus.textContent = '1순위 이름이 정해지면 도장 이미지를 자동 생성합니다.';
        if (namingSealImage) {
            namingSealImage.classList.add('hidden');
            namingSealImage.removeAttribute('src');
        }
    }
    renderNamingDetail(items[0] || null);
    const firstCard = namingCandidateList.querySelector('.naming-candidate-card');
    if (firstCard) firstCard.classList.add('is-selected');
    namingLabResultWrap.classList.remove('hidden');
}

function renderNamingFallbackText(rawText) {
    if (!namingLabResultWrap || !namingCandidateList || !namingScoreTableBody || !namingCertificateText || !namingLabSummary) return;
    const text = String(rawText || '').trim();
    namingLabSummary.textContent = '리포트 생성은 완료되었고, 아래에 텍스트 결과를 표시합니다.';
    namingCandidateList.innerHTML = `<article class="ai-review-card"><p class="ai-review-text">${escapeHtml(text || '결과 텍스트가 없습니다.')}</p></article>`;
    namingScoreTableBody.innerHTML = '<tr><td colspan="7" class="empty-table">점수형 JSON이 아니어서 표는 비워두었습니다.</td></tr>';
    namingCertificateText.textContent = text || '인증서 문안을 추출하지 못했습니다.';
    namingLabResultWrap.classList.remove('hidden');
}

async function handleNamingLabSubmit(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!AI_API_BASE) {
        setNamingLabStatus('AI 백엔드 주소가 설정되지 않았습니다.', true);
        return;
    }
    if (!firebaseIdToken) {
        setNamingLabStatus('Google 로그인 후 이용해주세요.', true);
        return;
    }
    const layers = getNamingLayerWeights();
    const answers = collectNamingAnswers();
    const constraints = collectNamingConstraints();
    if (!constraints.surname) {
        setNamingLabStatus('성을 입력해 주세요.', true);
        return;
    }
    if (constraints.sibling_consistency && (!Array.isArray(constraints.sibling_names) || !constraints.sibling_names.length)) {
        setNamingLabStatus('형제자매 일관성 옵션을 켠 경우, 형제/자매 이름을 1개 이상 입력해 주세요.', true);
        return;
    }
    const hasAnswer = answers.some((x) => x.answer.length >= 3);
    if (!hasAnswer) {
        setNamingLabStatus('맞춤 질문에 최소 1개 이상 답변해 주세요.', true);
        return;
    }

    const prev = namingLabSubmitBtn?.textContent || 'AI 작명 리포트 생성하기';
    if (namingLabSubmitBtn) {
        namingLabSubmitBtn.disabled = true;
        namingLabSubmitBtn.textContent = '리포트 생성 중...';
    }
    setNamingLabStatus('레이어와 답변을 분석해 이름 후보를 만들고 있습니다.');

    try {
        const payload = {
            child_gender: String(namingChildGender?.value || 'unknown'),
            layer_weights: layers,
            interview_answers: answers,
            naming_constraints: constraints,
            naming_plan: String(namingPlanSelect?.value || 'plus'),
            model: 'gpt-4.1-mini'
        };
        namingConstraintsState = constraints;
        const response = await fetch(`${AI_API_BASE}/api/naming-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseIdToken}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok || !data?.text) {
            const parts = [];
            if (data?.error) parts.push(String(data.error));
            if (data?.required_credits) parts.push(`필요 쿠폰: ${creditsToCoupons(data.required_credits)}장`);
            if (Number.isFinite(data?.paid_credits) || Number.isFinite(data?.bonus_credits)) {
                parts.push(`현재 쿠폰: ${creditsToCoupons((data?.paid_credits || 0) + (data?.bonus_credits || 0))}장`);
            }
            throw new Error(parts.join('\n') || '작명 리포트 생성에 실패했습니다.');
        }
        const report = parseJsonObjectFromText(data.text);
        if (!report) {
            renderNamingFallbackText(data.text);
            setNamingLabStatus('리포트는 생성되었으나 JSON 형식이 아니어서 텍스트 결과로 표시했습니다.');
            return;
        }
        renderNamingReport(report);
        setNamingLabStatus('작명 리포트 생성이 완료되었습니다.');
        await fetchWallet();
    } catch (err) {
        setNamingLabStatus(err instanceof Error ? err.message : '리포트 생성 실패', true);
    } finally {
        if (namingLabSubmitBtn) {
            namingLabSubmitBtn.disabled = false;
            namingLabSubmitBtn.textContent = prev;
        }
    }
}

function initNamingLab() {
    if (!namingLabForm) return;
    namingLayerInputs.forEach((input) => {
        const update = () => {
            updateNamingLayerSummary();
            const valueEl = document.getElementById(`${input.id}Value`);
            if (valueEl) valueEl.textContent = String(input.value || '0');
        };
        input.addEventListener('input', update);
        input.addEventListener('change', update);
    });
    updateNamingLayerSummary();
    namingLayerInputs.forEach((input) => {
        const valueEl = document.getElementById(`${input.id}Value`);
        if (valueEl) valueEl.textContent = String(input.value || '0');
    });
    if (namingQuestionList) namingQuestionList.innerHTML = '';
    const syncLengthBounds = () => {
        const minLength = normalizeNameLength(namingGivenNameMinLengthInput?.value, 2);
        const maxLength = normalizeNameLength(namingGivenNameMaxLengthInput?.value, 2);
        if (minLength > maxLength && namingGivenNameMaxLengthInput) namingGivenNameMaxLengthInput.value = String(minLength);
    };
    const syncSiblingNameInput = () => {
        if (!namingSiblingNamesWrap || !namingSiblingConsistencyInput) return;
        const enabled = Boolean(namingSiblingConsistencyInput.checked);
        namingSiblingNamesWrap.classList.toggle('hidden', !enabled);
    };
    namingGivenNameMinLengthInput?.addEventListener('change', syncLengthBounds);
    namingGivenNameMaxLengthInput?.addEventListener('change', syncLengthBounds);
    namingSiblingConsistencyInput?.addEventListener('change', syncSiblingNameInput);
    syncSiblingNameInput();
    namingPresetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            applyNamingPreset(btn.dataset.namingPreset);
        });
    });
    namingApplyLayersBtn?.addEventListener('click', applyNamingLayerConfig);
    window.applyNamingLayerConfig = applyNamingLayerConfig;
    if (namingTopPickReasonBtn && namingTopPickReason) {
        namingTopPickReasonBtn.addEventListener('click', () => {
            const hidden = namingTopPickReason.classList.contains('hidden');
            namingTopPickReason.classList.toggle('hidden', !hidden);
            namingTopPickReasonBtn.textContent = hidden ? '이 이름을 추천한 이유 ▲' : '이 이름을 추천한 이유 ▼';
        });
    }
    namingLabForm.addEventListener('submit', handleNamingLabSubmit);
    namingLabSubmitBtn?.addEventListener('click', handleNamingLabSubmit);
}

function showAiEventPopup() {
    if (!aiEventPopup) return;
    let seen = false;
    try {
        seen = sessionStorage.getItem(AI_EVENT_POPUP_SESSION_KEY) === '1';
    } catch (_err) {
        seen = false;
    }
    if (seen) return;
    aiEventPopup.classList.remove('hidden');
}

function hideAiEventPopup(markSeen = true) {
    if (!aiEventPopup) return;
    aiEventPopup.classList.add('hidden');
    if (markSeen) {
        try {
            sessionStorage.setItem(AI_EVENT_POPUP_SESSION_KEY, '1');
        } catch (_err) {
            // ignore storage errors
        }
    }
}

function getLocalHistoryKey() {
    if (!firebaseUser?.uid) return '';
    return `baby_photo_history_local:${firebaseUser.uid}`;
}

function loadLocalHistory() {
    try {
        const key = getLocalHistoryKey();
        if (!key) return [];
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) => typeof item?.image_data_url === 'string' && item.image_data_url.startsWith('data:image/'))
            .slice(0, 4);
    } catch (_err) {
        return [];
    }
}

function saveLocalHistory(items) {
    try {
        const key = getLocalHistoryKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify((items || []).slice(0, 4)));
    } catch (_err) {
        // ignore localStorage errors
    }
}

function mergeHistoryItems(serverItems = [], localItems = []) {
    const merged = [];
    const seen = new Set();
    const pushItem = (item) => {
        const image = String(item?.image_data_url || '');
        if (!image || seen.has(image)) return;
        seen.add(image);
        merged.push({
            image_data_url: image,
            created_at: item?.created_at || new Date().toISOString()
        });
    };
    serverItems.forEach(pushItem);
    localItems.forEach(pushItem);
    return merged.slice(0, 4);
}

// 육아휴직 계산기/달력 요소
const leavePlannerForm = document.getElementById('leavePlannerForm');
const plannerWizard = document.getElementById('plannerWizard');
const plannerWizardStepBtns = document.querySelectorAll('.planner-wizard-step');
const plannerSteps = document.querySelectorAll('.planner-step');
const plannerStepPrevBtn = document.getElementById('plannerStepPrevBtn');
const plannerStepNextBtn = document.getElementById('plannerStepNextBtn');
const plannerStepCounter = document.getElementById('plannerStepCounter');
const plannerUserType = document.getElementById('plannerUserType');
const plannerWage = document.getElementById('plannerWage');
const plannerWageHelpBtn = document.getElementById('plannerWageHelpBtn');
const plannerWageHelpText = document.getElementById('plannerWageHelpText');
const childbirthStartInput = document.getElementById('childbirthStart');
const childbirthEndInput = document.getElementById('childbirthEnd');
const plannerMultipleBirth = document.getElementById('plannerMultipleBirth');
const plannerPremature = document.getElementById('plannerPremature');
const priorityCompany = document.getElementById('priorityCompany');
const spouseMonthsInput = document.getElementById('spouseMonths');
const monthlyPresetToggle = document.getElementById('monthlyPresetToggle');
const monthlyPresetOptions = document.getElementById('monthlyPresetOptions');
const motherPresetRange = document.getElementById('motherPresetRange');
const motherPresetValue = document.getElementById('motherPresetValue');
const fatherMonthlyPresetToggle = document.getElementById('fatherMonthlyPresetToggle');
const fatherMonthlyPresetOptions = document.getElementById('fatherMonthlyPresetOptions');
const fatherPresetRange = document.getElementById('fatherPresetRange');
const fatherPresetValue = document.getElementById('fatherPresetValue');
const includeFatherInput = document.getElementById('includeFather');
const includeGovBenefitsInput = document.getElementById('includeGovBenefits');
const includeGovBenefitsHint = document.getElementById('includeGovBenefitsHint');
const fatherWageSection = document.getElementById('fatherWageSection');
const fatherInputSection = document.getElementById('fatherInputSection');
const fatherWageInput = document.getElementById('fatherWage');
const addFatherSegmentBtn = document.getElementById('addFatherSegmentBtn');
const fatherSegmentList = document.getElementById('fatherSegmentList');
const addSegmentBtn = document.getElementById('addSegmentBtn');
const segmentList = document.getElementById('segmentList');
const childcareQuotaInfo = document.getElementById('childcareQuotaInfo');
const plannerFormMessage = document.getElementById('plannerFormMessage');
const paymentTableBody = document.getElementById('paymentTableBody');
const paymentMobileCards = document.getElementById('paymentMobileCards');
const primaryChildcareHeader = document.getElementById('primaryChildcareHeader');
const fatherChildcareHeader = document.getElementById('fatherChildcareHeader');
const benefitHeader = document.getElementById('benefitHeader');
const plannerBadges = document.getElementById('plannerBadges');
const paymentResultToggleBtn = document.getElementById('paymentResultToggleBtn');
const paymentResultContent = document.getElementById('paymentResultContent');
const paymentChartSection = document.getElementById('paymentChartSection');
const paymentChartSvg = document.getElementById('paymentChartSvg');
const paymentChartTooltip = document.getElementById('paymentChartTooltip');
const paymentChartToggles = document.getElementById('paymentChartToggles');
const chartSelfTotal = document.getElementById('chartSelfTotal');
const chartSpouseTotal = document.getElementById('chartSpouseTotal');
const chartGovBenefitTotal = document.getElementById('chartGovBenefitTotal');
const chartCombinedTotal = document.getElementById('chartCombinedTotal');
const calendarChildbirthStartInput = document.getElementById('calendarChildbirthStart');
const calendarChildbirthEndInput = document.getElementById('calendarChildbirthEnd');
const calendarChildbirthInfo = document.getElementById('calendarChildbirthInfo');
const applyCalendarChildbirthBtn = document.getElementById('applyCalendarChildbirthBtn');
const calendarChildcareSegmentIndex = document.getElementById('calendarChildcareSegmentIndex');
const calendarChildcareStartInput = document.getElementById('calendarChildcareStart');
const calendarChildcareDaysInput = document.getElementById('calendarChildcareDays');
const calendarChildcareEndInput = document.getElementById('calendarChildcareEnd');
const calendarChildcareResidualHint = document.getElementById('calendarChildcareResidualHint');
const calendarChildcareRemainingInfo = document.getElementById('calendarChildcareRemainingInfo');
const calendarActorTabs = document.getElementById('calendarActorTabs');
const calendarSpouseUsagePlannedInput = document.getElementById('calendarSpouseUsagePlanned');
const calendarSpouseUsageLabel = document.getElementById('calendarSpouseUsageLabel');
const addCalendarChildcareSegmentBtn = document.getElementById('addCalendarChildcareSegmentBtn');
const applyCalendarChildcareBtn = document.getElementById('applyCalendarChildcareBtn');
const calendarPrevBtn = document.getElementById('calendarPrevBtn');
const calendarNextBtn = document.getElementById('calendarNextBtn');
const calendarCurrentLabel = document.getElementById('calendarCurrentLabel');
const calendarNavMeta = document.getElementById('calendarNavMeta');
const viewMonthBtn = document.getElementById('viewMonthBtn');
const viewWeekBtn = document.getElementById('viewWeekBtn');
const plannerCalendarGrid = document.getElementById('plannerCalendarGrid');
const calendarDaySheet = document.getElementById('calendarDaySheet');
const calendarDaySheetTitle = document.getElementById('calendarDaySheetTitle');
const calendarDaySheetList = document.getElementById('calendarDaySheetList');
const calendarDaySheetCloseBtn = document.getElementById('calendarDaySheetCloseBtn');
const calendarMessage = document.getElementById('calendarMessage');
const calendarBadges = document.getElementById('calendarBadges');
const holidayStatusMessage = document.getElementById('holidayStatusMessage');
const benefitLinkContext = {
    linked: false,
    city: '',
    district: '',
    dueDate: '',
    childOrder: 1
};
const GOV_BENEFIT_EXCLUDE_NOTE = '※ 지자체 장려금·축하금 등 지역 특화 지원금은 포함되지 않습니다.';
const GOV_BENEFIT_FALLBACK_NOTE = '※ 출산예정일 미입력 시 출산휴가 시작일 + 1개월을 출산 기준일로 계산합니다.';
let renderedHolidayMap = {};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initGoogleAnalytics();
    initMicrosoftClarity();
    applyAiPhotoVisibility();
    initAuth();
    initServiceTabs();
    initQuickStart();
    initLeavePlanner();
    initBabyPhotoGenerator();
    initNamingLab();
    initBenefitLinkState();

    if (benefitForm && citySelect && districtSelect && dueDateInput) {
        initCityDropdown();
        setDueDateInputRange();
        setLoadingState(false);
        syncBenefitDueDateToCalendar();

        // 이벤트 리스너
        citySelect.addEventListener('change', handleCityChange);
        benefitForm.addEventListener('submit', handleFormSubmit);
        tabBtns.forEach((btn) => {
            btn.addEventListener('click', handleTabClick);
            btn.addEventListener('keydown', (e) => handleArrowNavigation(e, tabBtns, true));
        });
        [citySelect, districtSelect, dueDateInput].forEach(field => {
            field.addEventListener('change', clearFormError);
            field.addEventListener('input', clearFormError);
        });
        dueDateInput.addEventListener('change', syncBenefitDueDateToCalendar);
        dueDateInput.addEventListener('input', syncBenefitDueDateToCalendar);
    }
});

function setAiAuthStatus(message, isError = false) {
    if (!aiAuthStatus) return;
    aiAuthStatus.textContent = message;
    aiAuthStatus.style.color = isError ? '#B91C1C' : '';
}

function setWalletStatus(message, isError = false) {
    if (!walletStatus) return;
    walletStatus.textContent = message;
    walletStatus.style.color = isError ? '#B91C1C' : '';
}

function applyCouponCampaignUi(campaign) {
    const ended = campaign?.status === 'ended';
    const soldOut = Boolean(campaign?.sold_out);
    if (chargeCreditsBtn) {
        chargeCreditsBtn.disabled = soldOut;
        chargeCreditsBtn.title = ended
            ? '2월 한정 쿠폰 이벤트가 종료되었습니다.'
            : soldOut ? '2월 한정 쿠폰이 모두 소진되었습니다.' : '';
    }
    if (chargeDollarInput) {
        chargeDollarInput.disabled = soldOut;
    }
    if (refreshWalletBtn) {
        refreshWalletBtn.disabled = false;
    }
    if (ended) {
        setWalletStatus('이벤트 기간이 종료되었습니다. 2월 한정 쿠폰 이벤트가 마감되어 충전/결제가 비활성화되었습니다.', true);
        return;
    }
    if (soldOut) {
        setWalletStatus('쿠폰이 모두 소진되었습니다. 2월 한정 50장 쿠폰이 마감되어 충전/결제가 비활성화되었습니다.', true);
        return;
    }
    const welcomeIssuedNow = Boolean(walletState?.welcome_coupon?.issued_now);
    if (welcomeIssuedNow) {
        setWalletStatus(`첫 로그인 쿠폰 1장이 지급되었습니다. 내 쿠폰 ${Number(walletState?.can_generate_images || 0)}장`);
        return;
    }
    setWalletStatus(`내 쿠폰 ${Number(walletState?.can_generate_images || 0)}장`);
}

function creditsToCoupons(credits) {
    const value = Number(credits || 0);
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.floor(value / CREDITS_PER_IMAGE);
}

function formatHistoryTime(value) {
    if (!value) return '';
    const dt = new Date(value.replace(' ', 'T') + 'Z');
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function selectHistoryImage(imageDataUrl) {
    if (!imageDataUrl || !babyPhotoResultImage) return;
    babyPhotoResultImage.src = imageDataUrl;
    if (babyPhotoDownloadBtn) {
        babyPhotoDownloadBtn.href = imageDataUrl;
        babyPhotoDownloadBtn.setAttribute('download', getBabyPhotoFileName());
    }
    babyPhotoResultWrap?.classList.remove('hidden');
    if (babyPhotoStatus && babyPhotoResultWrap && babyPhotoStatus.parentElement) {
        babyPhotoStatus.insertAdjacentElement('afterend', babyPhotoResultWrap);
    }
    setBabyPhotoStatus('최근 생성 결과를 불러왔습니다.');
}

function setPhotoAlbumSelection(imageDataUrl = '', selectedBtn = null) {
    selectedAlbumImageDataUrl = imageDataUrl || '';
    if (photoAlbumList) {
        photoAlbumList.querySelectorAll('.ai-history-item').forEach((btn) => {
            btn.classList.toggle('is-selected', btn === selectedBtn);
        });
    }
    if (!photoAlbumDownloadBtn) return;
    if (!selectedAlbumImageDataUrl) {
        photoAlbumDownloadBtn.classList.add('hidden');
        photoAlbumDownloadBtn.setAttribute('href', '#');
        return;
    }
    photoAlbumDownloadBtn.classList.remove('hidden');
    photoAlbumDownloadBtn.setAttribute('href', selectedAlbumImageDataUrl);
    photoAlbumDownloadBtn.setAttribute('download', getBabyPhotoFileName());
}

function renderHistoryInto(container, items = [], options = {}) {
    const { closeModalOnSelect = false, enableAlbumSelection = false } = options;
    if (!container) return;
    if (!Array.isArray(items) || !items.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = items.map((item) => {
        const created = formatHistoryTime(item?.created_at);
        const safeCreated = created || '저장됨';
        const imageDataUrl = typeof item?.image_data_url === 'string' ? item.image_data_url : '';
        return `
            <button type="button" class="ai-history-item" data-history-image="${imageDataUrl.replace(/"/g, '&quot;')}">
                <img src="${imageDataUrl}" alt="최근 생성 이미지">
                <p class="ai-history-meta">${safeCreated}</p>
            </button>
        `;
    }).join('');
    container.querySelectorAll('.ai-history-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            const imageDataUrl = btn.getAttribute('data-history-image') || '';
            selectHistoryImage(imageDataUrl);
            if (enableAlbumSelection) {
                setPhotoAlbumSelection(imageDataUrl, btn);
            }
            if (closeModalOnSelect && photoAlbumModal) photoAlbumModal.classList.add('hidden');
        });
    });
}

function renderBabyPhotoHistory(items = []) {
    if (!babyPhotoHistoryWrap || !babyPhotoHistoryList) return;
    babyPhotoHistoryItems = Array.isArray(items) ? items : [];
    if (!Array.isArray(items) || !items.length) {
        babyPhotoHistoryList.innerHTML = '';
        if (photoAlbumList) photoAlbumList.innerHTML = '';
        setPhotoAlbumSelection('', null);
        babyPhotoHistoryWrap.classList.add('hidden');
        return;
    }
    renderHistoryInto(babyPhotoHistoryList, items, { closeModalOnSelect: true });
    renderHistoryInto(photoAlbumList, items, { enableAlbumSelection: true });
    setPhotoAlbumSelection('', null);
    babyPhotoHistoryWrap.classList.remove('hidden');
}

async function fetchBabyPhotoHistory() {
    if (!firebaseIdToken || !AI_API_BASE) {
        const localItems = loadLocalHistory();
        renderBabyPhotoHistory(localItems);
        if (localItems.length) {
            setBabyPhotoHistoryStatus('서버 연결 전: 이 기기에 임시 저장된 사진을 표시 중입니다.');
        } else {
            setBabyPhotoHistoryStatus('');
        }
        return;
    }
    try {
        const response = await fetch(`${AI_API_BASE}/api/baby-photo/history`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${firebaseIdToken}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok) {
            throw new Error(data?.error || '최근 생성 결과 조회 실패');
        }
        const serverItems = Array.isArray(data?.items) ? data.items : [];
        const merged = mergeHistoryItems(serverItems, loadLocalHistory());
        saveLocalHistory(merged);
        renderBabyPhotoHistory(merged);
        if (!serverItems.length && merged.length) {
            setBabyPhotoHistoryStatus('서버 사진첩이 비어 있어 이 기기의 임시 저장본을 함께 표시 중입니다.');
        } else {
            setBabyPhotoHistoryStatus('');
        }
    } catch (_err) {
        const localItems = loadLocalHistory();
        renderBabyPhotoHistory(localItems);
        if (localItems.length) {
            setBabyPhotoHistoryStatus('서버 조회에 실패해 현재 기기의 임시 저장본만 표시 중입니다. 다른 기기/도메인 기록은 보이지 않을 수 있습니다.', true);
        } else {
            setBabyPhotoHistoryStatus('서버 조회에 실패했습니다. 잠시 후 다시 시도해주세요.', true);
        }
    }
}

async function fetchWallet() {
    if (!firebaseIdToken || !AI_API_BASE) return;
    try {
        const response = await fetch(`${AI_API_BASE}/api/wallet`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${firebaseIdToken}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok) {
            throw new Error(data?.error || '지갑 조회 실패');
        }
        walletState = data;
        applyCouponCampaignUi(data?.coupon_campaign || null);
    } catch (err) {
        setWalletStatus(err instanceof Error ? `지갑 조회 실패: ${err.message}` : '지갑 조회 실패', true);
    }
}

async function startCreditCheckout() {
    if (!firebaseIdToken || !AI_API_BASE) return;
    if (walletState?.coupon_campaign?.sold_out) {
        applyCouponCampaignUi(walletState.coupon_campaign);
        return;
    }
    try {
        if (firebaseUser) {
            firebaseIdToken = await firebaseUser.getIdToken(true);
        }
        const selectedDollars = Math.max(1, Math.min(20, Number(chargeDollarInput?.value || 1) || 1));
        if (chargeCreditsBtn) chargeCreditsBtn.disabled = true;
        setWalletStatus(`$${selectedDollars} 결제 페이지를 준비 중입니다...`);
        const response = await fetch(`${AI_API_BASE}/api/billing/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseIdToken}`
            },
            body: JSON.stringify({
                package_id: 'usd_credit_topup',
                dollar_amount: selectedDollars
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.ok || !data?.checkout_url) {
            if (data?.coupon_campaign) {
                walletState = { ...(walletState || {}), coupon_campaign: data.coupon_campaign };
                applyCouponCampaignUi(data.coupon_campaign);
            }
            const detail = data?.detail ? ` (${data.detail})` : '';
            throw new Error((data?.error || '결제 세션 생성 실패') + detail);
        }
        window.location.href = data.checkout_url;
    } catch (err) {
        setWalletStatus(err instanceof Error ? `결제 시작 실패: ${err.message}` : '결제 시작 실패', true);
    } finally {
        if (chargeCreditsBtn && !walletState?.coupon_campaign?.sold_out) chargeCreditsBtn.disabled = false;
    }
}

function initAuth() {
    if (!googleLoginBtn || !googleLogoutBtn) return;
    if (babyPhotoSubmitBtn) babyPhotoSubmitBtn.disabled = true;
    if (AI_PHOTO_DISABLED && HAS_BABY_PHOTO_UI) {
        setAiAuthStatus('AI 아기 사진관은 개선 작업으로 임시 비활성화되었습니다. 점검 완료 후 다시 오픈됩니다.', true);
        googleLoginBtn.classList.add('hidden');
        photoAlbumBtn?.classList.add('hidden');
        googleLogoutBtn.classList.add('hidden');
        photoAlbumModal?.classList.add('hidden');
        walletBox?.classList.add('hidden');
        setWalletStatus('점검 중');
        renderBabyPhotoHistory([]);
        setBabyPhotoHistoryStatus('');
        return;
    }
    if (!FIREBASE_AUTH_CONFIG?.enabled) {
        setAiAuthStatus('로그인 비활성화 상태입니다. 운영자에게 문의해주세요.', true);
        googleLoginBtn.classList.add('hidden');
        googleLogoutBtn.classList.add('hidden');
        return;
    }
    if (!FIREBASE_AUTH_CONFIG.apiKey || !FIREBASE_AUTH_CONFIG.appId || !FIREBASE_AUTH_CONFIG.projectId) {
        setAiAuthStatus('로그인 설정이 완료되지 않았습니다. Firebase API 키/앱 ID를 설정해주세요.', true);
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

    googleLoginBtn.addEventListener('click', async () => {
        if (isKakaoInAppBrowser()) {
            setAiAuthStatus('카카오톡 인앱브라우저에서는 Google 로그인이 차단됩니다. 외부 브라우저로 이동합니다.', true);
            const opened = openCurrentPageInExternalBrowser();
            if (!opened) {
                setAiAuthStatus('카카오톡 메뉴에서 "기본 브라우저로 열기" 후 다시 로그인해주세요.', true);
            }
            return;
        }
        try {
            await signInWithPopup(firebaseAuth, provider);
        } catch (err) {
            const rawMessage = err instanceof Error ? err.message : '알 수 없는 오류';
            const normalized = String(rawMessage || '').toLowerCase();
            if (normalized.includes('disallowed_useragent')) {
                setAiAuthStatus('현재 인앱브라우저에서는 Google 로그인이 차단됩니다. 기본 브라우저(Chrome/Safari)로 열어 다시 로그인해주세요.', true);
                return;
            }
            setAiAuthStatus(`로그인 실패: ${rawMessage}`, true);
        }
    });

    googleLogoutBtn.addEventListener('click', async () => {
        try {
            await signOut(firebaseAuth);
        } catch (err) {
            setAiAuthStatus(`로그아웃 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`, true);
        }
    });

    if (photoAlbumBtn) {
        photoAlbumBtn.addEventListener('click', async () => {
            await fetchBabyPhotoHistory();
            trackGaEvent('ai_photo_album_open', {
                service_name: 'ai',
                item_count: babyPhotoHistoryItems.length
            });
            if (!babyPhotoHistoryItems.length) {
                setBabyPhotoStatus('아직 저장된 생성 결과가 없습니다.');
                return;
            }
            setPhotoAlbumSelection('', null);
            photoAlbumModal?.classList.remove('hidden');
        });
    }
    if (photoAlbumCloseBtn) {
        photoAlbumCloseBtn.addEventListener('click', () => photoAlbumModal?.classList.add('hidden'));
    }
    if (photoAlbumModal) {
        photoAlbumModal.addEventListener('click', (e) => {
            if (e.target === photoAlbumModal) photoAlbumModal.classList.add('hidden');
        });
    }

    if (chargeCreditsBtn) {
        chargeCreditsBtn.addEventListener('click', startCreditCheckout);
    }
    if (refreshWalletBtn) {
        refreshWalletBtn.addEventListener('click', fetchWallet);
    }

    onAuthStateChanged(firebaseAuth, async (user) => {
        firebaseUser = user || null;
        firebaseIdToken = user ? await user.getIdToken() : '';
        if (firebaseUser?.email) {
            setAiAuthStatus(`로그인됨: ${firebaseUser.email}`);
            googleLoginBtn.classList.add('hidden');
            photoAlbumBtn?.classList.remove('hidden');
            googleLogoutBtn.classList.remove('hidden');
            walletBox?.classList.remove('hidden');
            if (babyPhotoSubmitBtn) babyPhotoSubmitBtn.disabled = false;
            await fetchWallet();
            if (HAS_BABY_PHOTO_UI) {
                await fetchBabyPhotoHistory();
            }
        } else {
            setAiAuthStatus('로그인 필요: Google 계정으로 로그인 후 이용 가능합니다.');
            googleLoginBtn.classList.remove('hidden');
            photoAlbumBtn?.classList.add('hidden');
            googleLogoutBtn.classList.add('hidden');
            photoAlbumModal?.classList.add('hidden');
            setPhotoAlbumSelection('', null);
            walletBox?.classList.add('hidden');
            setWalletStatus('로그인 후 내 쿠폰을 확인할 수 있습니다.');
            if (HAS_BABY_PHOTO_UI) {
                renderBabyPhotoHistory([]);
                setBabyPhotoHistoryStatus('');
            }
            if (babyPhotoSubmitBtn) babyPhotoSubmitBtn.disabled = true;
        }
    });
}

function initBabyPhotoGenerator() {
    if (!babyPhotoForm || !ultrasoundImageInput || !motherPhotoInput || !fatherPhotoInput) return;
    if (AI_PHOTO_DISABLED) {
        [motherPhotoInput, fatherPhotoInput, ultrasoundImageInput, gestationalWeeksInput, babyGenderInput].forEach((el) => {
            if (el) el.disabled = true;
        });
        if (babyPhotoSubmitBtn) {
            babyPhotoSubmitBtn.disabled = true;
            babyPhotoSubmitBtn.textContent = '서비스 점검 중';
        }
        setBabyPhotoStatus('AI 아기 사진관은 현재 개선 작업으로 임시 비활성화되었습니다.', true);
        return;
    }
    if (aiEventPopupCloseBtn) {
        aiEventPopupCloseBtn.addEventListener('click', () => hideAiEventPopup(true));
    }
    if (aiEventPopup) {
        aiEventPopup.addEventListener('click', (e) => {
            if (e.target === aiEventPopup) hideAiEventPopup(true);
        });
    }
    motherPhotoInput.addEventListener('change', enforceMotherSelectionLimit);
    fatherPhotoInput.addEventListener('change', enforceFatherSelectionLimit);
    ultrasoundImageInput.addEventListener('change', enforceUltrasoundSelectionLimit);
    updateUploadFieldState(motherPhotoInput, false);
    updateUploadFieldState(fatherPhotoInput, false);
    updateUploadFieldState(ultrasoundImageInput, true);
    babyPhotoForm.addEventListener('submit', handleBabyPhotoSubmit);
}

function setInputFiles(inputEl, files = []) {
    if (!inputEl) return;
    try {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        inputEl.files = dataTransfer.files;
    } catch (_err) {
        // Fallback for browsers that disallow programmatic FileList assignment.
    }
}

function enforceMotherSelectionLimit() {
    enforceSingleSelectionLimit(motherPhotoInput, '엄마 사진');
}

function enforceFatherSelectionLimit() {
    enforceSingleSelectionLimit(fatherPhotoInput, '아빠 사진');
}

function enforceSingleSelectionLimit(inputEl, label) {
    if (!inputEl) return;
    const selectedFile = inputEl.files?.[0] || null;
    if (!selectedFile) {
        updateUploadFieldState(inputEl, false);
        return;
    }
    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
        setInputFiles(inputEl, []);
        setBabyPhotoStatus(`${label}: 파일 크기는 3MB 이하만 업로드할 수 있습니다.`, true);
    }
    updateUploadFieldState(inputEl, false);
}

function enforceUltrasoundSelectionLimit() {
    if (!ultrasoundImageInput) return;
    const selectedFiles = Array.from(ultrasoundImageInput.files || []);
    if (!selectedFiles.length) {
        updateUploadFieldState(ultrasoundImageInput, true);
        return;
    }
    let files = selectedFiles.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
    if (files.length !== selectedFiles.length) {
        setBabyPhotoStatus('초음파 사진은 파일당 3MB 이하만 업로드할 수 있습니다. 3MB 초과 파일은 제외되었습니다.', true);
    }
    if (files.length > MAX_ULTRASOUND_FILES) {
        files = files.slice(0, MAX_ULTRASOUND_FILES);
        setBabyPhotoStatus(`초음파 사진은 최대 ${MAX_ULTRASOUND_FILES}장까지 첨부할 수 있어 앞의 ${MAX_ULTRASOUND_FILES}장만 반영했습니다.`, true);
    }
    setInputFiles(ultrasoundImageInput, files);
    updateUploadFieldState(ultrasoundImageInput, true);
}

function updateUploadFieldState(inputEl, multiple = false) {
    const group = inputEl?.closest('.ai-upload-group');
    const subtitle = group?.querySelector('.ai-upload-subtitle');
    if (!group || !subtitle || !inputEl) return;
    const fieldLabel = uploadFieldLabelMap[inputEl.id] || '사진';
    const count = (inputEl.files || []).length;
    if (!count) {
        group.classList.remove('is-uploaded');
        subtitle.textContent = '박스 전체를 눌러 파일 선택';
        return;
    }
    group.classList.add('is-uploaded');
    const normalizedCount = multiple ? count : 1;
    subtitle.textContent = `${fieldLabel} 업로드 완료 (${normalizedCount}장)`;
}

function setBabyPhotoStatus(message, isError = false) {
    if (!babyPhotoStatus) return;
    if (!message) {
        babyPhotoStatus.textContent = '';
        babyPhotoStatus.classList.add('hidden');
        babyPhotoStatus.removeAttribute('style');
        return;
    }
    babyPhotoStatus.textContent = message;
    babyPhotoStatus.classList.remove('hidden');
    babyPhotoStatus.style.borderColor = isError ? '#FCA5A5' : '#86EFAC';
    babyPhotoStatus.style.backgroundColor = isError ? '#FEF2F2' : '#F0FDF4';
    babyPhotoStatus.style.color = isError ? '#B91C1C' : '#166534';
}

function startBabyPhotoLoading() {
    if (!babyPhotoLoading) return;
    const steps = [
        '사진 분석을 시작합니다.',
        '입력된 사진 품질을 확인하고 있어요.',
        '엄마/아빠 닮은 특징을 정리하고 있어요.',
        '초음파 단서를 함께 반영하고 있어요.',
        '신생아 얼굴 비율을 자연스럽게 맞추고 있어요.',
        '조명과 피부톤을 현실적으로 보정하고 있어요.',
        '아기 이미지를 정성껏 생성하고 있어요.',
        '마무리 중입니다. 잠시만 기다려주세요.'
    ];
    let idx = 0;
    babyPhotoLoading.classList.remove('hidden');
    if (babyPhotoLoadingTitle) babyPhotoLoadingTitle.textContent = 'AI가 사진을 만들고 있어요...';
    if (babyPhotoLoadingDetail) babyPhotoLoadingDetail.textContent = steps[0];
    if (babyPhotoLoadingTimer) clearInterval(babyPhotoLoadingTimer);
    babyPhotoLoadingTimer = setInterval(() => {
        idx = (idx + 1) % steps.length;
        if (babyPhotoLoadingDetail) babyPhotoLoadingDetail.textContent = steps[idx];
    }, 5600);
}

function stopBabyPhotoLoading() {
    if (babyPhotoLoadingTimer) {
        clearInterval(babyPhotoLoadingTimer);
        babyPhotoLoadingTimer = null;
    }
    babyPhotoLoading?.classList.add('hidden');
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('이미지 파일을 읽는 중 오류가 발생했습니다.'));
        reader.readAsDataURL(file);
    });
}

async function readFilesAsDataUrls(files) {
    return Promise.all(files.map((file) => readFileAsDataUrl(file)));
}

function validateImageFile(file, label) {
    if (!file) {
        throw new Error(`${label} 파일을 확인해주세요.`);
    }
    const isImage = typeof file.type === 'string' && file.type.startsWith('image/');
    if (!isImage) {
        throw new Error(`${label}: 이미지 파일만 업로드할 수 있습니다.`);
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(`${label}: 파일 크기는 3MB 이하로 업로드해주세요.`);
    }
}

function getBabyPhotoFileName() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `ai-baby-photo-${y}${m}${d}-${hh}${mm}.png`;
}

async function handleBabyPhotoSubmit(e) {
    e.preventDefault();
    if (AI_PHOTO_DISABLED) {
        setBabyPhotoStatus('AI 아기 사진관은 현재 점검 중입니다. 추후 다시 이용해주세요.', true);
        return;
    }
    if (!firebaseIdToken) {
        setBabyPhotoStatus('Google 로그인 후 이용해주세요.', true);
        return;
    }
    const motherFile = motherPhotoInput?.files?.[0] || null;
    const fatherFile = fatherPhotoInput?.files?.[0] || null;
    const ultrasoundFiles = Array.from(ultrasoundImageInput?.files || []);
    const gestationalWeeks = Number(gestationalWeeksInput?.value || 0);
    const gender = (babyGenderInput?.value || '').trim();

    if (!motherFile || !fatherFile) {
        setBabyPhotoStatus('엄마/아빠 사진을 각각 1장씩 업로드해주세요.', true);
        return;
    }
    if (ultrasoundFiles.length < 1 || ultrasoundFiles.length > MAX_ULTRASOUND_FILES) {
        setBabyPhotoStatus(`초음파 사진은 1~${MAX_ULTRASOUND_FILES}장 업로드해주세요.`, true);
        return;
    }
    if (!Number.isFinite(gestationalWeeks) || gestationalWeeks < 4 || gestationalWeeks > 42) {
        setBabyPhotoStatus('임신 주차는 4~42 사이로 입력해주세요.', true);
        return;
    }
    if (!gender) {
        setBabyPhotoStatus('예상 성별을 선택해주세요.', true);
        return;
    }
    const totalImages = 2 + ultrasoundFiles.length;
    if (totalImages < 3 || totalImages > 4) {
        setBabyPhotoStatus('총 이미지 수는 3~4장이어야 합니다.', true);
        return;
    }
    trackGaEvent('ai_photo_generate_submit', {
        service_name: 'ai',
        gestational_weeks: Math.floor(gestationalWeeks),
        gender,
        ultrasound_count: ultrasoundFiles.length
    });

    const prevLabel = babyPhotoSubmitBtn?.textContent || '설레는 우리 아기 미리 만나보기';
    if (babyPhotoSubmitBtn) {
        babyPhotoSubmitBtn.disabled = true;
        babyPhotoSubmitBtn.textContent = 'AI 생성 중...';
    }
    setBabyPhotoStatus('3~4장의 이미지를 분석하고 있습니다. 잠시만 기다려주세요.');
    startBabyPhotoLoading();

    try {
        if (!AI_API_BASE) {
            throw new Error('AI 백엔드 URL이 설정되지 않았습니다. 운영자에게 문의해주세요.');
        }
        validateImageFile(motherFile, '엄마 사진');
        validateImageFile(fatherFile, '아빠 사진');
        ultrasoundFiles.forEach((file, idx) => validateImageFile(file, `초음파 사진 ${idx + 1}`));

        const [motherImageDataUrl, fatherImageDataUrl, ultrasoundImageDataUrls] = await Promise.all([
            readFileAsDataUrl(motherFile),
            readFileAsDataUrl(fatherFile),
            readFilesAsDataUrls(ultrasoundFiles)
        ]);
        const payload = {
            gestational_weeks: Math.floor(gestationalWeeks),
            gender,
            mother_image_data_url: motherImageDataUrl,
            father_image_data_url: fatherImageDataUrl,
            ultrasound_image_data_urls: ultrasoundImageDataUrls
        };

        const apiUrl = `${AI_API_BASE}/api/baby-photo`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${firebaseIdToken}`
            },
            body: JSON.stringify(payload)
        });
        const raw = await response.text();
        let data = {};
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (parseError) {
            throw new Error('AI 서버 응답 형식이 올바르지 않습니다. 잠시 후 다시 시도해주세요.');
        }
        if (!response.ok || !data?.ok || !data?.image_data_url) {
            const parts = [];
            if (data?.error) parts.push(String(data.error));
            if (data?.required_credits) parts.push(`필요 쿠폰: ${creditsToCoupons(data.required_credits)}장`);
            if (Number.isFinite(data?.paid_credits) || Number.isFinite(data?.bonus_credits)) {
                parts.push(`현재 쿠폰: ${creditsToCoupons((data?.paid_credits || 0) + (data?.bonus_credits || 0))}장`);
            }
            if (data?.error_code) parts.push(`코드: ${data.error_code}`);
            if (data?.error_type) parts.push(`유형: ${data.error_type}`);
            if (data?.error_help) parts.push(String(data.error_help));
            throw new Error(parts.join('\n') || '이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }

        babyPhotoResultImage.src = data.image_data_url;
        if (babyPhotoDownloadBtn) {
            babyPhotoDownloadBtn.href = data.image_data_url;
            babyPhotoDownloadBtn.setAttribute('download', getBabyPhotoFileName());
        }
        babyPhotoResultWrap?.classList.remove('hidden');
        const modelLabel = typeof data?.model_used === 'string' ? data.model_used : '';
        const promptVersion = typeof data?.prompt_version === 'string' ? data.prompt_version : '';
        if (modelLabel || promptVersion) {
            console.info('[baby-photo] generation model/version:', modelLabel || '-', promptVersion || '-');
        }
        setBabyPhotoStatus(`생성이 완료되었습니다. 결과 이미지를 확인해주세요.${promptVersion ? ` (prompt: ${promptVersion})` : ''}`);
        if (babyPhotoStatus && babyPhotoResultWrap && babyPhotoStatus.parentElement) {
            babyPhotoStatus.insertAdjacentElement('afterend', babyPhotoResultWrap);
        }
        const localMerged = mergeHistoryItems(
            [{ image_data_url: data.image_data_url, created_at: new Date().toISOString() }],
            loadLocalHistory()
        );
        saveLocalHistory(localMerged);
        await fetchWallet();
        await fetchBabyPhotoHistory();
    } catch (err) {
        setBabyPhotoStatus(err instanceof Error ? err.message : '이미지 생성 중 오류가 발생했습니다.', true);
    } finally {
        stopBabyPhotoLoading();
        if (babyPhotoSubmitBtn) {
            babyPhotoSubmitBtn.disabled = false;
            babyPhotoSubmitBtn.textContent = prevLabel;
        }
    }
}

function initGoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return;
    if (window.__gaInitialized) return;
    const hasExistingGtag = !!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`);
    if (hasExistingGtag && typeof window.gtag === 'function') {
        window.__gaInitialized = true;
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    window.__gaInitialized = true;
}

function initMicrosoftClarity() {
    if (!CLARITY_PROJECT_ID) return;
    if (window.__clarityInitialized) return;

    (function (c, l, a, r, i, m, s) {
        c[a] = c[a] || function clarity() {
            (c[a].q = c[a].q || []).push(arguments);
        };
        m = l.createElement(r);
        m.async = 1;
        m.src = `https://www.clarity.ms/tag/${i}`;
        s = l.getElementsByTagName(r)[0];
        s.parentNode.insertBefore(m, s);
    }(window, document, 'clarity', 'script', CLARITY_PROJECT_ID));

    window.__clarityInitialized = true;
}

function handleArrowNavigation(e, nodeList, isHorizontal = false) {
    const buttons = Array.from(nodeList);
    if (!buttons.length) return;
    const currentIndex = buttons.indexOf(e.currentTarget);
    if (currentIndex < 0) return;

    const key = e.key;
    const prevKeys = isHorizontal ? ['ArrowLeft', 'ArrowUp'] : ['ArrowUp', 'ArrowLeft'];
    const nextKeys = isHorizontal ? ['ArrowRight', 'ArrowDown'] : ['ArrowDown', 'ArrowRight'];
    let nextIndex = currentIndex;

    if (prevKeys.includes(key)) nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    else if (nextKeys.includes(key)) nextIndex = (currentIndex + 1) % buttons.length;
    else if (key === 'Home') nextIndex = 0;
    else if (key === 'End') nextIndex = buttons.length - 1;
    else return;

    e.preventDefault();
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
}

function initQuickStart() {
    if (!quickStartBtns.length) return;

    quickStartBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.quickService;
            if (!target || !servicePanels[target]) return;
            if (AI_PHOTO_HIDDEN && target === 'ai') return;
            trackGaEvent('service_quick_start_click', {
                service_name: target,
                click_text: (btn.textContent || '').trim()
            });
            switchServiceTab(target);
            servicePanels[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initBenefitLinkState() {
    if (!includeGovBenefitsInput) return;
    setGovBenefitLinkStatus(false);
}

function syncBenefitDueDateToCalendar() {
    const dueDate = dueDateInput?.value || '';
    benefitLinkContext.dueDate = dueDate;
    if (plannerCalendarGrid) {
        renderPlannerCalendar();
    }
}

function setGovBenefitLinkStatus(linked, context = null) {
    if (!includeGovBenefitsInput) return;

    benefitLinkContext.linked = !!linked;
    if (linked && context) {
        benefitLinkContext.city = context.city || '';
        benefitLinkContext.district = context.district || '';
        benefitLinkContext.dueDate = context.dueDate || '';
        benefitLinkContext.childOrder = Number(context.childOrder) || 1;
    }

    if (!linked) {
        if (includeGovBenefitsHint) {
            includeGovBenefitsHint.innerHTML = `※ 혜택 조회 없이도 체크 시 정부 공통지원금(첫만남/부모급여/아동수당/의료비)이 반영됩니다.<br>${GOV_BENEFIT_FALLBACK_NOTE}<br>${GOV_BENEFIT_EXCLUDE_NOTE}`;
        }
        return;
    }

    includeGovBenefitsInput.checked = true;
    plannerState.includeGovBenefits = true;
    if (includeGovBenefitsHint) {
        const childLabel = benefitLinkContext.childOrder >= 5 ? '다섯째 이상' : `${benefitLinkContext.childOrder}째`;
        includeGovBenefitsHint.innerHTML = `※ 최근 조회 기준(${childLabel}, ${benefitLinkContext.city} ${benefitLinkContext.district}) 정부 공통지원금을 월별 급여에 자동 반영합니다.<br>${GOV_BENEFIT_FALLBACK_NOTE}<br>${GOV_BENEFIT_EXCLUDE_NOTE}`;
    }
}

// 숫자 포맷팅 (콤마 추가)
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
        return "-";
    }
    if (typeof amount === 'number') {
        return amount.toLocaleString('ko-KR') + '원';
    }
    // 문자열인 경우 (예: "200 ~ 300만원") 그대로 반환
    return amount;
};

const formatDateForInput = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

function setDueDateInputRange() {
    if (!dueDateInput) return;
    const today = new Date();
    const min = new Date(today);
    const max = new Date(today);

    // 과거 출산 가정도 확인할 수 있도록 범위를 넓게 허용
    min.setFullYear(today.getFullYear() - 3);
    max.setFullYear(today.getFullYear() + 2);

    dueDateInput.min = formatDateForInput(min);
    dueDateInput.max = formatDateForInput(max);
}

function showFormError(message, field) {
    if (!formError) return;
    formError.textContent = message;
    formError.classList.remove('hidden');
    if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
    }
}

function clearFormError() {
    if (!formError) return;
    formError.textContent = '';
    formError.classList.add('hidden');
    [citySelect, districtSelect, dueDateInput].forEach(field => field.removeAttribute('aria-invalid'));
}

function setLoadingState(isLoading) {
    if (!submitBtn || !loadingSpinner || !benefitForm) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? '조회 중...' : '혜택 조회하기';
    loadingSpinner.classList.toggle('hidden', !isLoading);
    loadingSpinner.setAttribute('aria-hidden', String(!isLoading));
    benefitForm.setAttribute('aria-busy', String(isLoading));
}

// 1. 시/도 드롭다운 초기화
function initCityDropdown() {
    // 기본 옵션 외에 데이터 기반 옵션 추가
    const cityKeys = Object.keys(localBenefitsData).sort((a, b) =>
        localBenefitsData[a].name.localeCompare(localBenefitsData[b].name, 'ko')
    );

    cityKeys.forEach((key) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = localBenefitsData[key].name;
        citySelect.appendChild(option);
    });
}

// 2. 시/도 변경 핸들러 (종속 드롭다운)
function handleCityChange(e) {
    const selectedCity = e.target.value;

    // 시/군/구 리셋
    districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    districtSelect.disabled = true;

    if (selectedCity && localBenefitsData[selectedCity]) {
        const districts = localBenefitsData[selectedCity].districts;
        const districtKeys = Object.keys(districts).sort((a, b) =>
            districts[a].name.localeCompare(districts[b].name, 'ko')
        );

        districtKeys.forEach((key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = districts[key].name;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    }
}

// 3. 폼 제출 핸들러
function handleFormSubmit(e) {
    e.preventDefault();
    if (submitBtn.disabled) return;

    clearFormError();
    const city = citySelect.value;
    const district = districtSelect.value;
    const dueDate = dueDateInput.value;
    const childOrder = Number(document.getElementById('childOrder').value);

    if (!city) {
        showFormError('시/도를 선택해주세요.', citySelect);
        return;
    }
    if (!district) {
        showFormError('시/군/구를 선택해주세요.', districtSelect);
        return;
    }
    if (!dueDate) {
        showFormError('출산 예정일을 입력해주세요.', dueDateInput);
        return;
    }
    if (dueDate < dueDateInput.min || dueDate > dueDateInput.max) {
        showFormError('출산(예정)일은 최근 3년부터 향후 2년 범위에서 입력해주세요.', dueDateInput);
        return;
    }
    trackGaEvent('benefit_search_submit', {
        service_name: 'benefit',
        city,
        district,
        child_order: childOrder
    });

    // 로딩 UI 표시
    resultSection.classList.add('hidden');
    checklistSection.classList.add('hidden');
    setLoadingState(true);

    // 데이터 처리 시뮬레이션 (0.5초)
    setTimeout(() => {
        // 1. 전국 비교 분석 (신규)
        const comparison = findMaxMinRegions(childOrder);
        renderComparisonSummary(comparison);

        // 2. 선택 지역 혜택 렌더링
        renderBenefits(city, district, childOrder);
        renderChecklist(dueDate);
        renderTotalSummary(city, district, childOrder); // 총액 계산 함수 호출
        setGovBenefitLinkStatus(true, { city, district, dueDate, childOrder });
        
        setLoadingState(false);
        resultSection.classList.remove('hidden');
        document.getElementById('comparisonSection').classList.remove('hidden'); // 비교 섹션 표시
        checklistSection.classList.remove('hidden');
        document.getElementById('totalSummarySection').classList.remove('hidden');
        
        // 기본으로 '전체 혜택' 탭 활성화
        handleTabClick({ target: document.querySelector('.tab-btn[data-tab="all"]') });

        // 스크롤 이동 (비교 섹션으로)
        document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth' });
        resultSection.focus();
        trackGaEvent('benefit_search_result_view', {
            service_name: 'benefit',
            city,
            district,
            child_order: childOrder
        });
    }, 500);
}

// ==========================================
// 신규: 전국 혜택 비교 및 총액 계산 로직
// ==========================================

// 1. 특정 혜택의 금액 계산 (단일 항목)
function calculateBenefitAmount(benefit, childOrder) {
    if (!benefit || !benefit.amount) return 0;

    if (typeof benefit.amount === 'number') {
        return benefit.amount;
    } 
    
    if (typeof benefit.amount === 'object') {
        if (benefit.amount.value) {
            // 자녀 순서별 차등 지급
            // 데이터가 { 1: 100, 2: 200 } 형태이므로 childOrder를 키로 사용
            // 4, 5의 경우 데이터가 없으면 3(셋째 이상)의 값을 사용 (3이 "셋째 이상"을 의미하므로)
            let val = benefit.amount.value[childOrder];
            if (!val && childOrder >= 4) {
                val = benefit.amount.value[3];
            }
            return val || 0;
        } 
        if (benefit.amount.monthly && benefit.amount.duration_months) {
            // 월 지급형 (월금액 * 개월수)
            return benefit.amount.monthly * benefit.amount.duration_months;
        }
        if (benefit.amount.total) {
            // 총액 명시형
            return benefit.amount.total;
        }
    }
    return 0; // 계산 불가 또는 문자열
}

// 2. 특정 지역의 지자체 지원금 총액 계산
function calculateLocalTotal(cityKey, districtKey, childOrder) {
    const districtData = localBenefitsData[cityKey]?.districts[districtKey];
    if (!districtData || !districtData.benefits) return 0;

    return districtData.benefits.reduce((total, benefit) => {
        return total + calculateBenefitAmount(benefit, childOrder);
    }, 0);
}

// 3. 정부 지원금 총액 계산 (전국 공통)
function calculateGovTotal(childOrder) {
    // A. 월 지급액 (부모급여 + 아동수당)
    const parentBenefit0 = 1000000 * 12; // 0세 1년
    const parentBenefit1 = 500000 * 12;  // 1세 1년
    const childAllowance = 100000 * 96;  // 8년 (96개월)
    const govMonthlyTotal = parentBenefit0 + parentBenefit1 + childAllowance;

    // B. 일시금 (첫만남 + 진료비)
    let firstMeeting = 2000000;
    if (childOrder >= 2) firstMeeting = 3000000;
    const medicalSupport = 1000000; // 단태아 가정
    
    return govMonthlyTotal + firstMeeting + medicalSupport;
}

// 4. 전국 최고/최저 지원 지역 찾기 (수정)
function findMaxMinRegions(childOrder) {
    let maxTotal = -1;
    let minTotal = Number.MAX_SAFE_INTEGER;
    
    let maxRegions = [];
    let minRegions = [];
    
    const govTotal = calculateGovTotal(childOrder);

    for (const cityKey in localBenefitsData) {
        const cityData = localBenefitsData[cityKey];
        if (!cityData.districts) continue;

        for (const districtKey in cityData.districts) {
            const districtData = cityData.districts[districtKey];
            const localTotal = calculateLocalTotal(cityKey, districtKey, childOrder);
            const grandTotal = govTotal + localTotal;
            const fullName = `${cityData.name} ${districtData.name}`;

            // 최고액 갱신 또는 추가
            if (grandTotal > maxTotal) {
                maxTotal = grandTotal;
                maxRegions = [{ name: fullName, total: grandTotal, local: localTotal }];
            } else if (grandTotal === maxTotal) {
                maxRegions.push({ name: fullName, total: grandTotal, local: localTotal });
            }

            // 최저액 갱신 또는 추가
            if (grandTotal < minTotal) {
                minTotal = grandTotal;
                minRegions = [{ name: fullName, total: grandTotal, local: localTotal }];
            } else if (grandTotal === minTotal) {
                minRegions.push({ name: fullName, total: grandTotal, local: localTotal });
            }
        }
    }

    // 예외 처리
    if (maxTotal === -1) {
         return { 
            max: [{ name: "데이터 없음", total: 0, local: 0 }], 
            min: [{ name: "데이터 없음", total: 0, local: 0 }], 
            govTotal: 0 
        };
    }

    return { max: maxRegions, min: minRegions, govTotal: govTotal };
}

// 5. 비교 요약 렌더링 (수정)
function renderComparisonSummary(comparison) {
    const section = document.getElementById('comparisonSection');
    if (!section) return;

    // 대표 지역 및 '외 N곳' 처리 함수
    const formatRegionName = (regions) => {
        if (regions.length === 0) return "-";
        if (regions.length === 1) return regions[0].name;
        return `${regions[0].name} 외 ${regions.length - 1}곳`;
    };

    const maxItem = comparison.max[0];
    const minItem = comparison.min[0];

    const maxTotalStr = formatCurrency(maxItem.total);
    const maxLocalStr = formatCurrency(maxItem.local);
    const minTotalStr = formatCurrency(minItem.total);
    
    // 정부 지원금만 받는 경우 (지자체 추가 0원) 확인
    const isGovOnly = minItem.total === comparison.govTotal;

    section.innerHTML = `
        <h3 class="comparison-title">🏆 전국 출산 지원금 랭킹 (예상 총액)</h3>
        <div class="comparison-box">
            <div class="rank-item max">
                <span class="rank-label">👑 최고 지원 지역</span>
                <span class="rank-name" title="${comparison.max.map(r => r.name).join(', ')}">${formatRegionName(comparison.max)}</span>
                <span class="rank-amount">${maxTotalStr}</span>
                <span class="rank-detail">(지자체 추가 ${maxLocalStr})</span>
            </div>
            <div class="vs-divider">VS</div>
            <div class="rank-item min">
                <span class="rank-label">기본 지원 지역</span>
                <span class="rank-name" title="${comparison.min.map(r => r.name).join(', ')}">${formatRegionName(comparison.min)}</span>
                <span class="rank-amount">${minTotalStr}</span>
                <span class="rank-detail">${isGovOnly ? '(정부 기본 혜택 위주)' : '(지자체 소액 지원)'}</span>
            </div>
        </div>
        <p class="comparison-note">※ ${isGovOnly ? '최저 금액은 정부 공통 지원금(부모급여, 아동수당 등 8년 총액)과 동일합니다.' : ''}</p>
    `;
}

// 4. 혜택 데이터 렌더링
function renderBenefits(cityKey, districtKey, childOrder) {
    const cityData = localBenefitsData[cityKey];
    const districtData = cityData.districts[districtKey];
    
    // 지역명 업데이트
    selectedRegionName.textContent = `${cityData.name} ${districtData.name}`;

    // A. 정부 혜택 렌더링
    govBenefitList.innerHTML = '';
    governmentBenefits.forEach(benefit => {
        govBenefitList.appendChild(createBenefitCard(benefit, childOrder));
    });

    // B. 지자체 혜택 렌더링
    localBenefitList.innerHTML = '';
    if (districtData.benefits && districtData.benefits.length > 0) {
        districtData.benefits.forEach(benefit => {
            localBenefitList.appendChild(createBenefitCard(benefit, childOrder));
        });
    } else {
        localBenefitList.innerHTML = '<p class="no-data">등록된 지자체 특화 혜택이 없습니다.</p>';
    }
}

// 7. 총액 리포트 렌더링 (리팩토링됨)
function renderTotalSummary(cityKey, districtKey, childOrder) {
    const summaryContent = document.getElementById('summaryContent');
    const districtData = localBenefitsData[cityKey].districts[districtKey];
    
    const govTotal = calculateGovTotal(childOrder);
    const localTotal = calculateLocalTotal(cityKey, districtKey, childOrder);
    const grandTotal = govTotal + localTotal;

    // 상세 내역 표시용 (정부 월/일시금 분리)
    const parentBenefit0 = 1000000 * 12;
    const parentBenefit1 = 500000 * 12;
    const childAllowance = 100000 * 96;
    const govMonthly = parentBenefit0 + parentBenefit1 + childAllowance;
    const govOneTime = govTotal - govMonthly;

    // HTML 생성
    summaryContent.innerHTML = `
        <!-- 정부 지원 섹션 -->
        <div class="summary-section">
            <h4 class="summary-header">🏛️ 정부 공통 지원 (전국)</h4>
            <div class="summary-row">
                <span>월 지급 (부모급여+아동수당)</span>
                <span>${formatCurrency(govMonthly)}</span>
            </div>
            <div class="summary-row">
                <span>일시금/바우처 (첫만남+진료비)</span>
                <span>${formatCurrency(govOneTime)}</span>
            </div>
            <div class="summary-row highlight total-sub">
                <span>정부 지원 소계</span>
                <span>${formatCurrency(govTotal)}</span>
            </div>
        </div>

        <!-- 지자체 지원 섹션 -->
        <div class="summary-section" style="margin-top: 20px;">
            <h4 class="summary-header">🏡 ${districtData.name} 특화 지원</h4>
            <div class="summary-row">
                <span>지자체 지원금 합계</span>
                <span>${formatCurrency(localTotal)}</span>
            </div>
            <div class="summary-row highlight total-sub">
                <span>지자체 지원 소계</span>
                <span>${formatCurrency(localTotal)}</span>
            </div>
        </div>

        <div class="total-amount-row">
            <span>총 예상 지원금</span>
            <span>${formatCurrency(grandTotal)}</span>
        </div>
        <p class="note-text">※ 아동수당(만 8세 미만) 등 모든 혜택을 전 기간 수령했을 때의 단순 합계입니다.</p>
    `;
}

function classifyBenefitTag(benefit) {
    const text = `${benefit?.title || ''} ${benefit?.note || ''} ${benefit?.target || ''}`.toLowerCase();
    if (text.includes('바우처') || text.includes('쿠폰')) return '바우처';
    if (text.includes('용품') || text.includes('대여') || text.includes('선물')) return '물품 지원';
    return '현금 지원';
}

function buildBenefitShareText(benefit, amountText) {
    const title = benefit?.title || '출산 혜택';
    const target = benefit?.target || '대상 조건 확인';
    const contact = benefit?.contact ? ` / 문의 ${benefit.contact}` : '';
    return `[출산 혜택 공유]\n${title}\n금액: ${amountText}\n대상: ${target}${contact}\nhttps://chulsan-danawa.com/`;
}

async function handleBenefitShare(payload) {
    const text = payload || '';
    if (!text) return;
    try {
        if (navigator.share) {
            await navigator.share({ title: '우리동네 출산 혜택', text });
            return;
        }
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            alert('혜택 정보를 복사했어요. 카카오톡에 붙여넣어 공유해보세요.');
            return;
        }
    } catch (_err) {
        // ignore and fallback below
    }
    window.prompt('아래 내용을 복사해 공유하세요.', text);
}

// 카드 HTML 생성
function createBenefitCard(benefit, childOrder) {
    const card = document.createElement('div');
    card.className = 'benefit-card';
    
    // 금액 결정 로직
    let displayAmount = "";
    let badgeText = "";

    if (typeof benefit.amount === 'object') {
        if (benefit.amount.display) {
            // 표시 전용 문자열이 있는 경우 (예: "월 50만원")
            displayAmount = benefit.amount.display;
        } else if (benefit.amount.value) {
            // 자녀 수에 맞는 금액 찾기
            // 4, 5의 경우 데이터가 없으면 3(셋째 이상)으로 폴백
            let exactAmount = benefit.amount.value[childOrder];
            if (!exactAmount && childOrder >= 4) {
                exactAmount = benefit.amount.value[3];
            }

            if (exactAmount) {
                displayAmount = formatCurrency(exactAmount);
                
                let badgeLabel = "";
                if (childOrder === 1) badgeLabel = "첫째 기준";
                else if (childOrder === 2) badgeLabel = "둘째 기준";
                else if (childOrder === 3) badgeLabel = "셋째 기준";
                else if (childOrder === 4) badgeLabel = "넷째 기준";
                else badgeLabel = "다섯째 이상";

                // 폴백 사용 시 배지 텍스트 조정 (데이터는 3인데 선택은 4인 경우 등)
                if (childOrder >= 4 && !benefit.amount.value[childOrder] && benefit.amount.value[3]) {
                    badgeLabel = "셋째 이상 기준";
                }

                badgeText = `<span class="badge-child">${badgeLabel}</span>`;
            } else {
                displayAmount = benefit.amount.summary || "대상 아님 (상세 조건 확인)";
            }
        } else if (benefit.amount.total) {
             // 총액만 있는 경우
             displayAmount = benefit.amount.summary || formatCurrency(benefit.amount.total);
        } else if (benefit.amount.summary) {
             displayAmount = benefit.amount.summary;
        } else {
             displayAmount = "금액 정보 확인 필요";
        }
    } else {
        // 일반 숫자나 문자열인 경우
        displayAmount = formatCurrency(benefit.amount);
    }

    const methodText = (typeof benefit.method === 'string' && benefit.method.trim()) ? benefit.method : '해당 지자체 문의';
    const benefitTag = classifyBenefitTag(benefit);
    const sharePayload = encodeURIComponent(buildBenefitShareText(benefit, displayAmount));

    card.innerHTML = `
        <div class="benefit-card-head">
            <h3 class="benefit-title">${benefit.title} ${badgeText}</h3>
            <button type="button" class="btn-secondary benefit-share-btn" data-benefit-share="${sharePayload}">공유</button>
        </div>
        <div class="benefit-tags">
            <span class="benefit-tag">${benefitTag}</span>
        </div>
        <div class="benefit-amount">${displayAmount}</div>
        <div class="benefit-detail"><strong>대상</strong> <span>${benefit.target}</span></div>
        <div class="benefit-detail"><strong>신청</strong> <span>${methodText}</span></div>
        ${benefit.contact ? `<div class="benefit-detail"><strong>문의</strong> <span>${benefit.contact}</span></div>` : ''}
        ${benefit.note ? `<div class="benefit-detail"><strong>참고</strong> <span>${benefit.note}</span></div>` : ''}
    `;
    const shareBtn = card.querySelector('[data-benefit-share]');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const payload = decodeURIComponent(shareBtn.getAttribute('data-benefit-share') || '');
            handleBenefitShare(payload);
        });
    }
    return card;
}

// 5. 체크리스트 및 D-Day 로직
function renderChecklist(dueDateStr) {
    const today = new Date();
    // 시간 초기화 (날짜만 비교하기 위해)
    today.setHours(0, 0, 0, 0);
    
    // YYYY-MM-DD 형식 파싱
    const [year, month, day] = dueDateStr.split('-').map(Number);
    const due = new Date(year, month - 1, day);
    
    // 날짜 차이 계산 (밀리초 -> 일)
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dDayText = "";
    let message = "";
    let items = [];

    if (diffDays > 0) {
        dDayText = `D-${diffDays}`;
        
        if (diffDays > 60) {
            message = "아직 여유가 있어요! 천천히 준비해볼까요?";
            items = [
                "태아보험 가입 확인하기",
                "산후조리원 예약 알아보기",
                "국민행복카드 발급 신청하기"
            ];
        } else if (diffDays > 30) {
            message = "이제 슬슬 출산 용품을 준비할 시기입니다.";
            items = [
                "출산 가방(캐리어) 싸두기",
                "아기 옷, 손수건 세탁해두기",
                "보건소 산후도우미 지원 신청 확인"
            ];
        } else {
            message = "곧 아기를 만나요! 마지막 점검을 해보세요.";
            items = [
                "입원 시 필요한 서류 챙기기 (신분증 등)",
                "카시트 설치 및 사용법 익히기",
                "마음의 준비 단단히 하기 ❤️"
            ];
        }

    } else if (diffDays === 0) {
        dDayText = "D-Day";
        message = "드디어 오늘이네요! 순산을 기원합니다.";
        items = ["병원 갈 준비 최종 점검", "보호자 연락망 확인"];
    } else {
        dDayText = `D+${Math.abs(diffDays)}`;
        message = "이미 아기와 함께하고 계시군요! 축하드립니다.";
        items = ["출생신고 및 첫만남이용권 신청", "예방접종 일정 확인"];
    }

    dDayDisplay.textContent = dDayText;
    dDayMessage.textContent = message;
    
    checklistItems.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        checklistItems.appendChild(li);
    });
}

// 6. 탭 전환 로직
function handleTabClick(e) {
    const clickedBtn = e.target.closest('.tab-btn');
    if (!clickedBtn) return;
    const targetId = clickedBtn.dataset.tab;

    // 버튼 활성화 상태 변경
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    clickedBtn.classList.add('active');
    clickedBtn.setAttribute('aria-pressed', 'true');

    // 콘텐츠 표시 상태 변경
    if (targetId === 'all') {
        governmentTabContent.classList.add('active');
        localTabContent.classList.add('active');
        governmentTabContent.removeAttribute('hidden');
        localTabContent.removeAttribute('hidden');
    } else {
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.setAttribute('hidden', '');
            if (content.id === targetId) {
                content.classList.add('active');
                content.removeAttribute('hidden');
            }
        });
    }
}

// ==========================================
// 메인 서비스 탭(3개) 전환
// ==========================================
function initServiceTabs() {
    const availableBtns = getAvailableServiceTabBtns();
    availableBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.serviceTab;
            switchServiceTab(target);
        });
        btn.addEventListener('keydown', (e) => handleArrowNavigation(e, availableBtns, true));
    });
    const activeBtn = availableBtns.find((btn) => btn.classList.contains('active')) || availableBtns[0];
    const initialTarget = activeBtn?.dataset?.serviceTab;
    if (initialTarget) {
        trackServicePageView(initialTarget, 'initial_load');
    }
}

function switchServiceTab(target) {
    if (AI_PHOTO_HIDDEN && target === 'ai') target = 'benefit';
    if (!servicePanels[target]) target = 'benefit';

    const availableBtns = getAvailableServiceTabBtns();
    availableBtns.forEach((btn) => {
        const active = btn.dataset.serviceTab === target;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        btn.setAttribute('tabindex', active ? '0' : '-1');
    });

    Object.entries(servicePanels).forEach(([key, panel]) => {
        if (!panel) return;
        const active = key === target;
        panel.classList.toggle('active', active);
        if (active) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
    });

    if (target === 'calendar') {
        syncCalendarSegmentOptions();
        syncCalendarDateInputs();
        renderCalendarBadges();
        renderPlannerCalendar();
    } else {
        closeCalendarDaySheet();
    }
    if (target === 'ai') {
        showAiEventPopup();
    } else {
        hideAiEventPopup(false);
    }
    trackServicePageView(target, 'service_tab');
}

// ==========================================
// 육아휴직 계산기 + 달력
// ==========================================
const plannerState = {
    userType: 'MOTHER',
    wage: 0,
    childbirthLeave: { start: '', end: '' },
    childcareSegments: [{ start: '', end: '' }],
    isMultipleBirth: false,
    isPremature: false,
    isPriorityCompany: null,
    spouseMonths: 0,
    presetMenuOpen: false,
    selectedPresetMonths: 0,
    lastSuggestedChildcareStart: '',
    includeFather: false,
    includeGovBenefits: false,
    spouseUsagePlanned: false,
    father: {
        userType: 'FATHER',
        wage: 0,
        childcareSegments: [{ start: '', end: '' }],
        presetMenuOpen: false,
        selectedPresetMonths: 0,
        monthlyRows: []
    },
    calendarEditorActor: 'self',
    calendarView: 'month',
    calendarCursor: startOfDay(new Date()),
    returnDate: '',
    monthlyRows: [],
    isCalculated: false
};

const holidayCache = {};
const failedHolidayYears = new Set();

const paymentChartState = {
    showChildbirth: true,
    showSelf: true,
    showSpouse: true,
    showBenefit: true,
    showTotal: true
};

const leavePolicy = {
    general: [
        { from: 1, to: 3, rate: 1.0, max: 2500000, min: 700000 },
        { from: 4, to: 6, rate: 1.0, max: 2000000, min: 700000 },
        { from: 7, to: 99, rate: 0.8, max: 1600000, min: 700000 }
    ],
    sixPlus: [
        { from: 1, to: 1, rate: 1.0, max: 2500000, min: 700000 },
        { from: 2, to: 2, rate: 1.0, max: 2500000, min: 700000 },
        { from: 3, to: 3, rate: 1.0, max: 3000000, min: 700000 },
        { from: 4, to: 4, rate: 1.0, max: 3500000, min: 700000 },
        { from: 5, to: 5, rate: 1.0, max: 4000000, min: 700000 },
        { from: 6, to: 6, rate: 1.0, max: 4500000, min: 700000 }
    ],
    singleParent: [
        { from: 1, to: 3, rate: 1.0, max: 3000000, min: 700000 },
        { from: 4, to: 6, rate: 0.8, max: 1800000, min: 700000 },
        { from: 7, to: 99, rate: 0.5, max: 1200000, min: 700000 }
    ],
    childbirth: {
        govCap: 2100000,
        baseDays: 90,
        prematureDays: 100,
        multipleDays: 120
    }
};

const AVG_DAYS_PER_MONTH = 365.25 / 12;
const CHILDCARE_MAX_SEGMENTS = 4;
const PLANNER_STORAGE_KEY = 'leavePlannerSettingsV1';

function setPlannerStep(step) {
    const totalSteps = Math.max(1, plannerSteps.length || 3);
    currentPlannerStep = Math.min(Math.max(1, Number(step) || 1), totalSteps);

    plannerSteps.forEach((panel) => {
        const panelStep = Number(panel.dataset.plannerStep || 0);
        panel.toggleAttribute('hidden', panelStep !== currentPlannerStep);
    });

    plannerWizardStepBtns.forEach((btn) => {
        const target = Number(btn.dataset.plannerStepTarget || 0);
        const isActive = target === currentPlannerStep;
        const isDone = target < currentPlannerStep;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('done', isDone);
        btn.setAttribute('aria-current', isActive ? 'step' : 'false');
    });

    if (plannerStepPrevBtn) plannerStepPrevBtn.disabled = currentPlannerStep <= 1;
    if (plannerStepNextBtn) {
        plannerStepNextBtn.classList.toggle('hidden', currentPlannerStep >= totalSteps);
        plannerStepNextBtn.disabled = currentPlannerStep >= totalSteps;
    }
    if (plannerStepCounter) plannerStepCounter.textContent = `${currentPlannerStep} / ${totalSteps}`;
}

function initPlannerWizard() {
    if (!leavePlannerForm || !plannerSteps.length) return;

    plannerWizardStepBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = Number(btn.dataset.plannerStepTarget || 1);
            setPlannerStep(target);
        });
    });
    if (plannerStepPrevBtn) {
        plannerStepPrevBtn.addEventListener('click', () => setPlannerStep(currentPlannerStep - 1));
    }
    if (plannerStepNextBtn) {
        plannerStepNextBtn.addEventListener('click', () => setPlannerStep(currentPlannerStep + 1));
    }

    leavePlannerForm.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        const target = e.target;
        const isTextInput = target instanceof HTMLInputElement || target instanceof HTMLSelectElement;
        if (!isTextInput || currentPlannerStep >= plannerSteps.length) return;
        e.preventDefault();
        setPlannerStep(currentPlannerStep + 1);
    });

    setPlannerStep(1);
}

function initLeavePlanner() {
    if (!leavePlannerForm) return;
    initPlannerWizard();

    if (paymentResultToggleBtn && paymentResultContent) {
        paymentResultToggleBtn.addEventListener('click', () => {
            const expanded = paymentResultToggleBtn.getAttribute('aria-expanded') === 'true';
            setPaymentResultExpanded(!expanded);
        });
        setPaymentResultExpanded(false);
    }

    if (plannerWageHelpBtn && plannerWageHelpText) {
        plannerWageHelpBtn.addEventListener('click', () => {
            const expanded = plannerWageHelpBtn.getAttribute('aria-expanded') === 'true';
            plannerWageHelpBtn.setAttribute('aria-expanded', String(!expanded));
            plannerWageHelpText.classList.toggle('hidden', expanded);
        });
        document.addEventListener('click', (e) => {
            const inside = e.target.closest('#plannerWageHelpBtn') || e.target.closest('#plannerWageHelpText');
            if (inside) return;
            plannerWageHelpBtn.setAttribute('aria-expanded', 'false');
            plannerWageHelpText.classList.add('hidden');
        });
        plannerWageHelpBtn.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            plannerWageHelpBtn.setAttribute('aria-expanded', 'false');
            plannerWageHelpText.classList.add('hidden');
        });
    }

    if (paymentChartToggles) {
        paymentChartToggles.querySelectorAll('[data-series-toggle]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.seriesToggle;
                if (key === 'childbirth') paymentChartState.showChildbirth = !paymentChartState.showChildbirth;
                if (key === 'self') paymentChartState.showSelf = !paymentChartState.showSelf;
                if (key === 'spouse') paymentChartState.showSpouse = !paymentChartState.showSpouse;
                if (key === 'benefit') paymentChartState.showBenefit = !paymentChartState.showBenefit;
                if (key === 'total') paymentChartState.showTotal = !paymentChartState.showTotal;
                btn.classList.toggle('active', (key === 'childbirth' && paymentChartState.showChildbirth)
                    || (key === 'self' && paymentChartState.showSelf)
                    || (key === 'spouse' && paymentChartState.showSpouse)
                    || (key === 'benefit' && paymentChartState.showBenefit)
                    || (key === 'total' && paymentChartState.showTotal));
                renderPaymentChart(plannerState.monthlyRows);
            });
        });
    }

    const today = startOfDay(new Date());
    const childbirthStart = today;
    const childbirthEnd = addDays(today, 89);
    const childcareStart = addDays(childbirthEnd, 1);
    const childcareEnd = addDays(addMonths(childcareStart, 12), -1);

    plannerState.wage = 3000000;
    plannerState.childbirthLeave = {
        start: formatDateYmd(childbirthStart),
        end: formatDateYmd(childbirthEnd)
    };
    plannerState.childcareSegments = [{
        start: formatDateYmd(childcareStart),
        end: formatDateYmd(childcareEnd)
    }];
    plannerState.lastSuggestedChildcareStart = formatDateYmd(childcareStart);
    plannerState.father.childcareSegments = [{
        start: formatDateYmd(childcareStart),
        end: formatDateYmd(childcareEnd)
    }];
    plannerState.returnDate = formatDateYmd(addDays(childcareEnd, 1));

    restorePlannerSettings();

    leavePlannerForm.addEventListener('submit', handlePlannerSubmit);
    [
        plannerUserType,
        plannerWage,
        childbirthStartInput,
        childbirthEndInput,
        plannerMultipleBirth,
        plannerPremature,
        priorityCompany,
        spouseMonthsInput,
        includeFatherInput,
        includeGovBenefitsInput,
        fatherWageInput
    ].forEach((field) => {
        field.addEventListener('change', () => {
            if (field === childbirthStartInput || field === plannerMultipleBirth || field === plannerPremature) {
                syncAutoChildbirthEnd();
                syncFirstChildcareStartByChildbirthEnd();
            }
            if (field === plannerWage || field === fatherWageInput) {
                field.value = formatNumberInput(parseCurrencyInput(field.value));
            }
            collectPlannerForm();
            recalculatePlanner();
        });
    });
    childbirthStartInput.addEventListener('input', () => {
        syncAutoChildbirthEnd();
        syncFirstChildcareStartByChildbirthEnd();
        collectPlannerForm();
        recalculatePlanner();
    });
    plannerWage.addEventListener('input', () => {
        plannerWage.value = formatNumberInput(parseCurrencyInput(plannerWage.value));
    });
    fatherWageInput.addEventListener('input', () => {
        fatherWageInput.value = formatNumberInput(parseCurrencyInput(fatherWageInput.value));
    });
    addSegmentBtn.addEventListener('click', () => {
        addChildcareSegment('self');
    });
    addFatherSegmentBtn.addEventListener('click', () => {
        addChildcareSegment('spouse');
    });
    monthlyPresetToggle.addEventListener('click', () => {
        plannerState.presetMenuOpen = !plannerState.presetMenuOpen;
        renderPresetOptions();
    });
    motherPresetRange.addEventListener('input', () => {
        const maxMonths = getChildcareMaxMonths('self');
        const months = normalizeMonthCount(motherPresetRange.value, { min: 1, max: maxMonths, fallback: Math.min(12, maxMonths) });
        motherPresetRange.value = String(months);
        plannerState.selectedPresetMonths = months;
        applyMonthlyPreset(months);
        renderPresetOptions();
        collectPlannerForm();
        recalculatePlanner();
    });
    if (fatherMonthlyPresetToggle) {
        fatherMonthlyPresetToggle.addEventListener('click', () => {
            plannerState.father.presetMenuOpen = !plannerState.father.presetMenuOpen;
            renderFatherPresetOptions();
        });
    }
    fatherPresetRange.addEventListener('input', () => {
        const months = normalizeMonthCount(fatherPresetRange.value, { min: 1, max: 18, fallback: 12 });
        fatherPresetRange.value = String(months);
        plannerState.father.selectedPresetMonths = months;
        applyFatherMonthlyPreset(months);
        renderFatherPresetOptions();
        collectPlannerForm();
        recalculatePlanner();
    });
    spouseMonthsInput.addEventListener('input', () => {
        const months = normalizeMonthCount(spouseMonthsInput.value, { min: 0, max: 18, fallback: 0 });
        spouseMonthsInput.value = spouseMonthsInput.value === '' ? '' : String(months);
        plannerState.spouseMonths = spouseMonthsInput.value === '' ? 0 : months;
        renderPresetOptions();
        renderChildcareQuotaInfo();
        recalculatePlanner();
        persistPlannerSettings();
    });

    calendarPrevBtn.addEventListener('click', () => {
        plannerState.calendarCursor = plannerState.calendarView === 'month'
            ? addMonths(plannerState.calendarCursor, -1)
            : addDays(plannerState.calendarCursor, -7);
        renderPlannerCalendar();
        persistPlannerSettings();
    });
    calendarNextBtn.addEventListener('click', () => {
        plannerState.calendarCursor = plannerState.calendarView === 'month'
            ? addMonths(plannerState.calendarCursor, 1)
            : addDays(plannerState.calendarCursor, 7);
        renderPlannerCalendar();
        persistPlannerSettings();
    });
    viewMonthBtn.addEventListener('click', () => {
        plannerState.calendarView = 'month';
        viewMonthBtn.classList.add('active');
        viewWeekBtn.classList.remove('active');
        renderPlannerCalendar();
        persistPlannerSettings();
    });
    viewWeekBtn.addEventListener('click', () => {
        plannerState.calendarView = 'week';
        viewWeekBtn.classList.add('active');
        viewMonthBtn.classList.remove('active');
        renderPlannerCalendar();
        persistPlannerSettings();
    });

    if (calendarChildcareSegmentIndex) {
        calendarChildcareSegmentIndex.addEventListener('change', () => {
            syncCalendarDateInputs();
        });
    }
    if (calendarActorTabs) {
        const actorBtns = calendarActorTabs.querySelectorAll('[data-calendar-actor]');
        actorBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                switchCalendarActor(btn.dataset.calendarActor);
                persistPlannerSettings();
            });
            btn.addEventListener('keydown', (e) => handleArrowNavigation(e, actorBtns, true));
        });
    }
    if (calendarSpouseUsagePlannedInput) {
        calendarSpouseUsagePlannedInput.addEventListener('change', () => {
            plannerState.spouseUsagePlanned = !!calendarSpouseUsagePlannedInput.checked;
            renderCalendarPartnerUsageLabel();
            renderPresetOptions();
            renderChildcareQuotaInfo();
            syncCalendarDateInputs();
            recalculatePlanner();
            persistPlannerSettings();
        });
    }
    if (calendarChildcareStartInput) {
        calendarChildcareStartInput.addEventListener('change', () => {
            const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
            const start = calendarChildcareStartInput.value;
            if (!start) return;
            if (idx === 0) {
                const actor = plannerState.calendarEditorActor;
                const autoMonths = getChildcareMaxMonths(actor);
                const autoEnd = formatDateYmd(addDays(addMonths(parseDateYmd(start), autoMonths), -1));
                calendarChildcareEndInput.value = autoEnd;
                if (calendarChildcareDaysInput) {
                    calendarChildcareDaysInput.value = String(expandDateRange(start, autoEnd).length);
                }
            } else {
                if (!calendarChildcareDaysInput.value) calendarChildcareDaysInput.value = '30';
                const maxDays = getChildcareMaxDays(plannerState.calendarEditorActor);
                const days = normalizeMonthCount(calendarChildcareDaysInput.value, { min: 1, max: maxDays, fallback: 30 });
                calendarChildcareDaysInput.value = String(days);
                if (!calendarChildcareEndInput.value || calendarChildcareEndInput.value < start) {
                    calendarChildcareEndInput.value = suggestSegmentEndByDays(start, days, idx, plannerState.calendarEditorActor);
                }
            }
            renderCalendarChildcareDerivedFields();
        });
    }
    if (calendarChildcareDaysInput) {
        calendarChildcareDaysInput.addEventListener('input', () => {
            const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
            const start = calendarChildcareStartInput?.value || '';
            if (!start) return;
            const raw = (calendarChildcareDaysInput.value || '').trim();
            if (!raw) {
                renderCalendarChildcareDerivedFields();
                return;
            }
            const parsed = Number(raw);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                renderCalendarChildcareDerivedFields();
                return;
            }
            const maxDays = getChildcareMaxDays(plannerState.calendarEditorActor);
            const days = Math.min(Math.floor(parsed), maxDays);
            calendarChildcareEndInput.value = suggestSegmentEndByDays(start, days, idx, plannerState.calendarEditorActor);
            renderCalendarChildcareDerivedFields();
        });
        calendarChildcareDaysInput.addEventListener('change', () => {
            const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
            const start = calendarChildcareStartInput?.value || '';
            if (!start) return;
            const raw = (calendarChildcareDaysInput.value || '').trim();
            if (!raw) {
                renderCalendarChildcareDerivedFields();
                return;
            }
            const maxDays = getChildcareMaxDays(plannerState.calendarEditorActor);
            const days = normalizeMonthCount(raw, { min: 1, max: maxDays, fallback: 30 });
            calendarChildcareDaysInput.value = String(days);
            calendarChildcareEndInput.value = suggestSegmentEndByDays(start, days, idx, plannerState.calendarEditorActor);
            renderCalendarChildcareDerivedFields();
        });
    }
    if (calendarChildcareEndInput) {
        calendarChildcareEndInput.addEventListener('change', () => {
            const start = calendarChildcareStartInput?.value || '';
            const end = calendarChildcareEndInput.value;
            if (isValidRange(start, end)) {
                calendarChildcareDaysInput.value = String(expandDateRange(start, end).length);
            }
            renderCalendarChildcareDerivedFields();
        });
    }
    if (calendarChildbirthStartInput) {
        calendarChildbirthStartInput.addEventListener('change', () => {
            const start = calendarChildbirthStartInput.value;
            if (!start) {
                if (calendarChildbirthEndInput) calendarChildbirthEndInput.value = '';
                renderCalendarChildbirthInfo();
                return;
            }
            const startDate = parseDateYmd(start);
            if (startDate && calendarChildbirthEndInput) {
                calendarChildbirthEndInput.value = formatDateYmd(
                    addDays(startDate, leavePolicy.childbirth.baseDays - 1)
                );
            }
            renderCalendarChildbirthInfo();
        });
    }
    if (calendarChildbirthEndInput) {
        calendarChildbirthEndInput.addEventListener('change', () => renderCalendarChildbirthInfo());
    }
    if (addCalendarChildcareSegmentBtn) {
        addCalendarChildcareSegmentBtn.addEventListener('click', () => {
            addChildcareSegment(plannerState.calendarEditorActor);
            if (calendarChildcareSegmentIndex) {
                const list = getEditorSegments(plannerState.calendarEditorActor);
                calendarChildcareSegmentIndex.value = String(list.length - 1);
            }
            syncCalendarDateInputs();
        });
    }
    if (applyCalendarChildbirthBtn) {
        applyCalendarChildbirthBtn.addEventListener('click', () => {
            trackGaEvent('calendar_apply_childbirth', {
                service_name: 'calendar',
                actor: plannerState.calendarEditorActor
            });
            applyCalendarDateSelection('CHILDBIRTH');
        });
    }
    if (applyCalendarChildcareBtn) {
        applyCalendarChildcareBtn.addEventListener('click', () => {
            trackGaEvent('calendar_apply_childcare', {
                service_name: 'calendar',
                actor: plannerState.calendarEditorActor
            });
            applyCalendarDateSelection('CHILDCARE');
        });
    }
    if (calendarDaySheetCloseBtn) {
        calendarDaySheetCloseBtn.addEventListener('click', closeCalendarDaySheet);
    }
    document.addEventListener('click', (e) => {
        if (!calendarDaySheet || calendarDaySheet.classList.contains('hidden')) return;
        const insideSheet = e.target.closest('#calendarDaySheet');
        const insideCalendarCell = e.target.closest('.calendar-day');
        if (!insideSheet && !insideCalendarCell) {
            closeCalendarDaySheet();
        }
    });

    renderPlannerForm();
    recalculatePlanner();
}

function handlePlannerSubmit(e) {
    e.preventDefault();
    setPlannerStep(Math.max(1, plannerSteps.length || 3));
    collectPlannerForm();
    if (!validatePlannerState()) return;
    trackGaEvent('planner_calculate_submit', {
        service_name: 'calculator',
        user_type: plannerState.userType,
        include_father: plannerState.includeFather
    });
    plannerState.isCalculated = true;
    recalculatePlanner();
    setPaymentResultExpanded(true);
    showPlannerMessage('계산이 완료되었습니다.', false);
}

function setPaymentResultExpanded(expanded) {
    if (!paymentResultToggleBtn || !paymentResultContent) return;
    paymentResultToggleBtn.setAttribute('aria-expanded', String(expanded));
    paymentResultContent.classList.toggle('hidden', !expanded);
    paymentResultToggleBtn.textContent = expanded ? '월별 지급내역 접기' : '월별 지급내역 펼치기';
}

function switchCalendarActor(actor) {
    if (!calendarActorTabs) return;
    plannerState.calendarEditorActor = actor;
    calendarActorTabs.querySelectorAll('[data-calendar-actor]').forEach((btn) => {
        const active = btn.dataset.calendarActor === actor;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
    if (plannerState.calendarEditorActor === 'spouse' && !plannerState.includeFather) {
        plannerState.includeFather = true;
        includeFatherInput.checked = true;
        fatherInputSection.classList.remove('hidden');
        fatherWageSection?.classList.remove('hidden');
    }
    renderCalendarPartnerUsageLabel();
    syncCalendarSegmentOptions();
    syncCalendarDateInputs();
}

function renderPlannerForm() {
    plannerUserType.value = plannerState.userType;
    plannerWage.value = formatNumberInput(plannerState.wage);
    childbirthStartInput.value = plannerState.childbirthLeave.start;
    childbirthEndInput.value = plannerState.childbirthLeave.end;
    plannerMultipleBirth.checked = plannerState.isMultipleBirth;
    plannerPremature.checked = plannerState.isPremature;
    spouseMonthsInput.value = plannerState.spouseMonths || '';
    priorityCompany.value = plannerState.isPriorityCompany === null ? '' : String(plannerState.isPriorityCompany);
    includeFatherInput.checked = plannerState.includeFather;
    if (includeGovBenefitsInput) includeGovBenefitsInput.checked = plannerState.includeGovBenefits;
    if (calendarSpouseUsagePlannedInput) calendarSpouseUsagePlannedInput.checked = plannerState.spouseUsagePlanned;
    renderCalendarPartnerUsageLabel();
    fatherWageInput.value = formatNumberInput(plannerState.father.wage);
    fatherInputSection.classList.toggle('hidden', !plannerState.includeFather);
    fatherWageSection?.classList.toggle('hidden', !plannerState.includeFather);
    viewMonthBtn.classList.toggle('active', plannerState.calendarView === 'month');
    viewWeekBtn.classList.toggle('active', plannerState.calendarView === 'week');
    if (calendarActorTabs) {
        calendarActorTabs.querySelectorAll('[data-calendar-actor]').forEach((btn) => {
            const active = btn.dataset.calendarActor === plannerState.calendarEditorActor;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
    }
    renderSegmentList();
    renderFatherSegmentList();
    renderPresetOptions();
    renderFatherPresetOptions();
    syncCalendarSegmentOptions();
    syncCalendarDateInputs();
    renderChildcareQuotaInfo();
    updatePaymentHeaders();
}

function renderCalendarPartnerUsageLabel() {
    if (!calendarSpouseUsageLabel) return;
    const actor = plannerState.calendarEditorActor;
    const actorLabel = getEditorLabel(actor);
    const counterpartLabel = getCounterpartLabel(actor);
    calendarSpouseUsageLabel.textContent = `${counterpartLabel} 3개월 이상 사용/사용예정 (체크 시 ${actorLabel} +6개월)`;
}

function renderSegmentList() {
    segmentList.innerHTML = '';
    plannerState.childcareSegments.forEach((seg, idx) => {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.innerHTML = `
            <label>구간 ${idx + 1}</label>
            <input type="date" data-segment-input="start" data-index="${idx}" value="${seg.start || ''}">
            <span>~</span>
            <input type="date" data-segment-input="end" data-index="${idx}" value="${seg.end || ''}">
            <button type="button" class="btn-danger" data-segment-remove="${idx}" ${plannerState.childcareSegments.length === 1 ? 'disabled' : ''}>삭제</button>
        `;
        segmentList.appendChild(row);
    });

    segmentList.querySelectorAll('[data-segment-input]').forEach((input) => {
        input.addEventListener('change', () => {
            const idx = Number(input.dataset.index);
            const key = input.dataset.segmentInput;
            plannerState.childcareSegments[idx][key] = input.value;
            if (key === 'start' && plannerState.childcareSegments[idx].start) {
                const currentStart = plannerState.childcareSegments[idx].start;
                const prev = idx > 0 ? plannerState.childcareSegments[idx - 1] : null;
                if (prev && isValidRange(prev.start, prev.end) && currentStart <= prev.end) {
                    plannerState.childcareSegments[idx].start = formatDateYmd(addDays(parseDateYmd(prev.end), 1));
                    showPlannerMessage('다음 구간 시작일은 이전 구간 종료 다음날 이후로 입력해주세요.', true);
                }
                const safeStart = plannerState.childcareSegments[idx].start;
                if (idx === 0) {
                    plannerState.childcareSegments[idx].end = formatDateYmd(addDays(addMonths(parseDateYmd(safeStart), 12), -1));
                } else if (!plannerState.childcareSegments[idx].end || plannerState.childcareSegments[idx].end < safeStart) {
                    plannerState.childcareSegments[idx].end = suggestSegmentEndByDays(safeStart, 30, idx, 'self');
                }
            }
            recalculatePlanner();
        });
    });

    segmentList.querySelectorAll('[data-segment-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.segmentRemove);
            plannerState.childcareSegments.splice(idx, 1);
            renderSegmentList();
            syncCalendarSegmentOptions();
            syncCalendarDateInputs();
            renderChildcareQuotaInfo();
            recalculatePlanner();
        });
    });
}

function renderFatherSegmentList() {
    fatherSegmentList.innerHTML = '';
    plannerState.father.childcareSegments.forEach((seg, idx) => {
        const row = document.createElement('div');
        row.className = 'segment-row';
        row.innerHTML = `
            <label>배우자 ${idx + 1}</label>
            <input type="date" data-father-segment-input="start" data-index="${idx}" value="${seg.start || ''}">
            <span>~</span>
            <input type="date" data-father-segment-input="end" data-index="${idx}" value="${seg.end || ''}">
            <button type="button" class="btn-danger" data-father-segment-remove="${idx}" ${plannerState.father.childcareSegments.length === 1 ? 'disabled' : ''}>삭제</button>
        `;
        fatherSegmentList.appendChild(row);
    });

    fatherSegmentList.querySelectorAll('[data-father-segment-input]').forEach((input) => {
        input.addEventListener('change', () => {
            const idx = Number(input.dataset.index);
            const key = input.dataset.fatherSegmentInput;
            plannerState.father.childcareSegments[idx][key] = input.value;
            if (key === 'start' && plannerState.father.childcareSegments[idx].start) {
                const currentStart = plannerState.father.childcareSegments[idx].start;
                const prev = idx > 0 ? plannerState.father.childcareSegments[idx - 1] : null;
                if (prev && isValidRange(prev.start, prev.end) && currentStart <= prev.end) {
                    plannerState.father.childcareSegments[idx].start = formatDateYmd(addDays(parseDateYmd(prev.end), 1));
                    showPlannerMessage('배우자 다음 구간 시작일은 이전 구간 종료 다음날 이후로 입력해주세요.', true);
                }
                const safeStart = plannerState.father.childcareSegments[idx].start;
                if (idx === 0) {
                    plannerState.father.childcareSegments[idx].end = formatDateYmd(addDays(addMonths(parseDateYmd(safeStart), 12), -1));
                } else if (!plannerState.father.childcareSegments[idx].end || plannerState.father.childcareSegments[idx].end < safeStart) {
                    plannerState.father.childcareSegments[idx].end = suggestSegmentEndByDays(safeStart, 30, idx, 'spouse');
                }
            }
            recalculatePlanner();
        });
    });

    fatherSegmentList.querySelectorAll('[data-father-segment-remove]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.fatherSegmentRemove);
            plannerState.father.childcareSegments.splice(idx, 1);
            renderFatherSegmentList();
            recalculatePlanner();
        });
    });
}

function updatePaymentHeaders() {
    const primaryLabel = '본인';
    primaryChildcareHeader.textContent = `육아휴직(${primaryLabel})`;
    fatherChildcareHeader.textContent = '육아휴직(배우자)';
}

function syncCalendarSegmentOptions() {
    if (!calendarChildcareSegmentIndex) return;
    const prevIndex = Number(calendarChildcareSegmentIndex.value || 0);
    const segments = getEditorSegments(plannerState.calendarEditorActor);
    calendarChildcareSegmentIndex.innerHTML = '';
    segments.forEach((_, idx) => {
        const option = document.createElement('option');
        option.value = String(idx);
        option.textContent = `구간 ${idx + 1}`;
        calendarChildcareSegmentIndex.appendChild(option);
    });
    if (segments.length > 0) {
        const nextIndex = Math.min(prevIndex, segments.length - 1);
        calendarChildcareSegmentIndex.value = String(nextIndex);
    }
}

function syncCalendarDateInputs() {
    if (!calendarChildbirthStartInput || !calendarChildbirthEndInput || !calendarChildcareStartInput || !calendarChildcareEndInput) return;
    calendarChildbirthStartInput.value = plannerState.childbirthLeave.start || '';
    calendarChildbirthEndInput.value = plannerState.childbirthLeave.end || '';
    renderCalendarChildbirthInfo();

    const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
    const segments = getEditorSegments(plannerState.calendarEditorActor);
    const seg = segments[idx] || { start: '', end: '' };
    calendarChildcareStartInput.value = seg.start || '';
    calendarChildcareEndInput.value = seg.end || '';
    if (calendarChildcareDaysInput && seg.start && seg.end) {
        calendarChildcareDaysInput.value = String(expandDateRange(seg.start, seg.end).length);
    } else if (calendarChildcareDaysInput) {
        calendarChildcareDaysInput.value = '';
    }
    renderCalendarChildcareDerivedFields();
}

function getEditorSegments(actor) {
    return actor === 'spouse' ? plannerState.father.childcareSegments : plannerState.childcareSegments;
}

function getEditorLabel(actor) {
    return actor === 'spouse' ? '배우자' : '본인';
}

function getCounterpartLabel(actor) {
    return actor === 'spouse' ? '본인' : '배우자';
}

function addChildcareSegment(actor = 'self') {
    const segments = getEditorSegments(actor);
    if (segments.length >= CHILDCARE_MAX_SEGMENTS) {
        showPlannerMessage(`육아휴직 구간은 최대 ${CHILDCARE_MAX_SEGMENTS}개까지 분할 입력할 수 있습니다.`, true);
        return;
    }
    const last = segments[segments.length - 1];
    if (!last || !isValidRange(last.start, last.end)) {
        showPlannerMessage('다음 구간을 추가하려면 먼저 이전 구간의 시작일/종료일을 입력해주세요.', true);
        return;
    }
    const remainingDays = getRemainingChildcareDays(actor);
    if (remainingDays <= 0) {
        const maxDays = getChildcareMaxDays(actor);
        showPlannerMessage(`${getEditorLabel(actor)} 육아휴직 사용 가능일(${maxDays}일)을 모두 사용했습니다.`, true);
        return;
    }
    const start = formatDateYmd(addDays(parseDateYmd(last.end), 1));
    segments.push({
        start,
        end: suggestSegmentEndByDays(start, Math.min(30, remainingDays), segments.length - 1, actor)
    });
    if (actor === 'self') plannerState.selectedPresetMonths = 0;
    renderSegmentList();
    renderFatherSegmentList();
    syncCalendarSegmentOptions();
    syncCalendarDateInputs();
    renderChildcareQuotaInfo();
    recalculatePlanner();
}

function getRemainingChildcareDays(actor = 'self', excludeIndex = null) {
    const segments = getEditorSegments(actor)
        .map((seg, idx) => ({ seg, idx }))
        .filter(({ seg, idx }) => idx !== excludeIndex && seg.start && seg.end)
        .map(({ seg }) => seg);
    const used = expandChildcareDays(segments).length;
    return Math.max(0, getChildcareMaxDays(actor) - used);
}

function suggestSegmentEndByDays(start, days, excludeIndex = null, actor = 'self') {
    if (!start) return '';
    const remainingDays = getRemainingChildcareDays(actor, excludeIndex);
    if (remainingDays <= 0) return start;
    const usableDays = Math.max(1, Math.min(days || 1, remainingDays));
    return formatDateYmd(addDays(parseDateYmd(start), usableDays - 1));
}

function renderCalendarChildcareRemainingInfo() {
    if (!calendarChildcareRemainingInfo) return;
    const actor = plannerState.calendarEditorActor;
    const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
    const remaining = getRemainingChildcareDays(actor, idx);
    const maxDays = getChildcareMaxDays(actor);
    const counterpart = getCounterpartLabel(actor);
    calendarChildcareRemainingInfo.textContent = `${getEditorLabel(actor)} 남은 휴직일: ${remaining}일 / 최대 ${maxDays}일(약 ${formatMonthApprox(maxDays)}개월) · 기본 12개월, ${counterpart} 3개월 이상 사용(예정) 시 +6개월`;
}

function renderCalendarChildbirthInfo() {
    if (!calendarChildbirthInfo) return;
    const start = calendarChildbirthStartInput?.value || '';
    const end = calendarChildbirthEndInput?.value || '';
    if (!isValidRange(start, end)) {
        calendarChildbirthInfo.textContent = '기간 정보: -';
        return;
    }
    const days = expandDateRange(start, end).length;
    calendarChildbirthInfo.textContent = `기간 정보: 총 ${days}일`;
}

function renderCalendarChildcareDerivedFields() {
    renderCalendarChildcareRemainingInfo();
    if (!calendarChildcareResidualHint) return;
    const actor = plannerState.calendarEditorActor;
    const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
    const baseRemaining = getRemainingChildcareDays(actor, idx);
    const maxDays = getChildcareMaxDays(actor);
    const requestedDays = normalizeMonthCount(calendarChildcareDaysInput?.value, { min: 0, max: maxDays, fallback: 0 });
    const residual = Math.max(0, baseRemaining - requestedDays);
    calendarChildcareResidualHint.textContent = `잔여예정 ${residual}일`;
}

function renderChildcareQuotaInfo() {
    const used = expandChildcareDays(plannerState.childcareSegments.filter((seg) => seg.start && seg.end)).length;
    const maxMonths = getChildcareMaxMonths('self');
    const maxDays = getChildcareMaxDays('self');
    const remaining = Math.max(0, maxDays - used);
    if (childcareQuotaInfo) {
        childcareQuotaInfo.textContent = `사용 ${used}일 · 남은 ${remaining}일(약 ${formatMonthApprox(remaining)}개월) / 총 ${maxMonths}개월(약 ${maxDays.toFixed(1)}일) · 분할 ${plannerState.childcareSegments.length}/${CHILDCARE_MAX_SEGMENTS}`;
    }
    const disableAdd = plannerState.childcareSegments.length >= CHILDCARE_MAX_SEGMENTS || remaining <= 0;
    if (addSegmentBtn) addSegmentBtn.disabled = disableAdd;
    if (addCalendarChildcareSegmentBtn) {
        const actorSegments = getEditorSegments(plannerState.calendarEditorActor);
        const actorRemaining = getRemainingChildcareDays(plannerState.calendarEditorActor);
        addCalendarChildcareSegmentBtn.disabled = actorSegments.length >= CHILDCARE_MAX_SEGMENTS || actorRemaining <= 0;
    }
    renderCalendarChildcareDerivedFields();
}

function formatMonthApprox(days) {
    return (days / AVG_DAYS_PER_MONTH).toFixed(1);
}

function getPlannedChildcareMonths(actor = 'self') {
    const segments = getEditorSegments(actor).filter((seg) => seg.start && seg.end);
    return expandChildcareDays(segments).length / 30;
}

function hasCounterpartThreeMonths(actor = 'self') {
    if (plannerState.spouseUsagePlanned) return true;
    if (actor === 'self') {
        if (plannerState.includeFather) return getPlannedChildcareMonths('spouse') >= 3;
        return plannerState.spouseMonths >= 3;
    }
    return getPlannedChildcareMonths('self') >= 3;
}

function getChildcareMaxMonths(actor = 'self') {
    return hasCounterpartThreeMonths(actor) ? 18 : 12;
}

function getChildcareMaxDays(actor = 'self') {
    return Math.round(getChildcareMaxMonths(actor) * AVG_DAYS_PER_MONTH);
}

function collectPlannerForm() {
    plannerState.userType = plannerUserType.value;
    plannerState.wage = parseCurrencyInput(plannerWage.value);
    plannerState.childbirthLeave.start = childbirthStartInput.value;
    plannerState.childbirthLeave.end = childbirthEndInput.value;
    plannerState.isMultipleBirth = plannerMultipleBirth.checked;
    plannerState.isPremature = plannerPremature.checked;
    plannerState.spouseMonths = normalizeMonthCount(spouseMonthsInput.value, { min: 0, max: 18, fallback: 0 });
    spouseMonthsInput.value = plannerState.spouseMonths === 0 ? '' : String(plannerState.spouseMonths);
    plannerState.includeFather = includeFatherInput.checked;
    plannerState.includeGovBenefits = !!includeGovBenefitsInput?.checked;
    plannerState.father.wage = parseCurrencyInput(fatherWageInput.value);
    fatherInputSection.classList.toggle('hidden', !plannerState.includeFather);
    fatherWageSection?.classList.toggle('hidden', !plannerState.includeFather);
    updatePaymentHeaders();
    plannerState.isPriorityCompany = priorityCompany.value === '' ? null : priorityCompany.value === 'true';
}

function syncAutoChildbirthEnd() {
    if (!childbirthStartInput || !childbirthEndInput) return;
    if (!childbirthStartInput.value) {
        childbirthEndInput.value = '';
        return;
    }
    const leaveDays = plannerMultipleBirth.checked
        ? leavePolicy.childbirth.multipleDays
        : plannerPremature.checked
            ? leavePolicy.childbirth.prematureDays
            : leavePolicy.childbirth.baseDays;
    // 시작일 포함 leaveDays일(= +(leaveDays - 1)일) 자동 계산
    const end = addDays(parseDateYmd(childbirthStartInput.value), leaveDays - 1);
    childbirthEndInput.value = formatDateYmd(end);
}

function syncFirstChildcareStartByChildbirthEnd() {
    if (!childbirthEndInput.value) return;
    const suggestedStart = formatDateYmd(addDays(parseDateYmd(childbirthEndInput.value), 1));
    const first = plannerState.childcareSegments[0];
    if (!first) return;

    if (!first.start || first.start === plannerState.lastSuggestedChildcareStart) {
        first.start = suggestedStart;
        if (!first.end || first.end < first.start) {
            first.end = suggestSegmentEndByDays(suggestedStart, 30, 0, 'self');
        }
    }
    plannerState.lastSuggestedChildcareStart = suggestedStart;
    if (plannerState.selectedPresetMonths > 0) {
        applyMonthlyPreset(plannerState.selectedPresetMonths);
    } else {
        renderSegmentList();
    }
}

function applyMonthlyPreset(months) {
    if (!childbirthEndInput.value || !months) return;
    const start = formatDateYmd(addDays(parseDateYmd(childbirthEndInput.value), 1));
    const end = formatDateYmd(addDays(addMonths(parseDateYmd(start), months), -1));
    if (!plannerState.childcareSegments[0]) plannerState.childcareSegments[0] = { start: '', end: '' };
    plannerState.childcareSegments[0].start = start;
    plannerState.childcareSegments[0].end = end;
    plannerState.selectedPresetMonths = months;
    plannerState.lastSuggestedChildcareStart = start;
    renderSegmentList();
}

function renderPresetOptions() {
    if (!monthlyPresetOptions || !monthlyPresetToggle) return;
    monthlyPresetOptions.classList.toggle('hidden', !plannerState.presetMenuOpen);
    monthlyPresetToggle.classList.toggle('active', plannerState.presetMenuOpen);
    monthlyPresetToggle.setAttribute('aria-expanded', String(plannerState.presetMenuOpen));
    const maxMonths = getChildcareMaxMonths('self');
    motherPresetRange.max = String(maxMonths);
    const fallbackMonths = Math.min(12, maxMonths);
    const value = plannerState.selectedPresetMonths || normalizeMonthCount(motherPresetRange.value, { min: 1, max: maxMonths, fallback: fallbackMonths });
    plannerState.selectedPresetMonths = value;
    motherPresetRange.value = String(value);
    motherPresetValue.textContent = `${value}개월`;
}

function applyFatherMonthlyPreset(months) {
    if (!months) return;
    const baseStart = plannerState.father.childcareSegments[0]?.start
        || plannerState.childcareSegments[0]?.start
        || formatDateYmd(addDays(parseDateYmd(plannerState.childbirthLeave.end), 1));
    const end = formatDateYmd(addDays(addMonths(parseDateYmd(baseStart), months), -1));
    if (!plannerState.father.childcareSegments[0]) plannerState.father.childcareSegments[0] = { start: '', end: '' };
    plannerState.father.childcareSegments[0].start = baseStart;
    plannerState.father.childcareSegments[0].end = end;
    plannerState.father.selectedPresetMonths = months;
    renderFatherSegmentList();
}

function renderFatherPresetOptions() {
    if (!fatherMonthlyPresetOptions || !fatherMonthlyPresetToggle) return;
    fatherMonthlyPresetOptions.classList.toggle('hidden', !plannerState.father.presetMenuOpen);
    fatherMonthlyPresetToggle.classList.toggle('active', plannerState.father.presetMenuOpen);
    fatherMonthlyPresetToggle.setAttribute('aria-expanded', String(plannerState.father.presetMenuOpen));
    const value = plannerState.father.selectedPresetMonths || normalizeMonthCount(fatherPresetRange.value, { min: 1, max: 18, fallback: 12 });
    fatherPresetRange.value = String(value);
    fatherPresetValue.textContent = `${value}개월`;
}

function normalizeMonthCount(value, options = {}) {
    const min = options.min ?? 0;
    const max = options.max ?? 99;
    const fallback = options.fallback ?? min;
    const parsed = Number(String(value ?? '').trim());
    if (!Number.isFinite(parsed)) return fallback;
    const rounded = Math.round(parsed);
    return Math.min(max, Math.max(min, rounded));
}

function parseCurrencyInput(value) {
    const numeric = String(value || '').replace(/[^\d]/g, '');
    return numeric ? Number(numeric) : 0;
}

function formatNumberInput(value) {
    if (!value) return '';
    return Number(value).toLocaleString('ko-KR');
}

function validatePlannerState() {
    clearPlannerMessage();
    if (plannerState.wage <= 0) {
        showPlannerMessage('월 통상임금을 입력해주세요.', true);
        return false;
    }
    if (!isValidRange(plannerState.childbirthLeave.start, plannerState.childbirthLeave.end)) {
        showPlannerMessage('출산전후휴가 시작일/종료일을 확인해주세요.', true);
        return false;
    }
    const validSegments = plannerState.childcareSegments.filter((seg) => seg.start && seg.end);
    if (!validSegments.length) {
        showPlannerMessage('육아휴직 구간을 최소 1개 입력해주세요.', true);
        return false;
    }
    if (validSegments.length > CHILDCARE_MAX_SEGMENTS) {
        showPlannerMessage(`육아휴직 구간은 최대 ${CHILDCARE_MAX_SEGMENTS}개까지만 입력할 수 있습니다.`, true);
        return false;
    }
    for (const seg of validSegments) {
        if (!isValidRange(seg.start, seg.end)) {
            showPlannerMessage('육아휴직 구간의 시작일/종료일을 확인해주세요.', true);
            return false;
        }
    }
    for (let i = 1; i < plannerState.childcareSegments.length; i += 1) {
        const prev = plannerState.childcareSegments[i - 1];
        const cur = plannerState.childcareSegments[i];
        if (isValidRange(prev.start, prev.end) && isValidRange(cur.start, cur.end) && cur.start <= prev.end) {
            showPlannerMessage(`구간 ${i + 1} 시작일은 구간 ${i} 종료 다음날 이후로 입력해주세요.`, true);
            return false;
        }
    }
    if (hasSegmentOverlap(validSegments)) {
        showPlannerMessage('육아휴직 구간이 서로 겹치지 않도록 조정해주세요.', true);
        return false;
    }
    const selfMaxDays = getChildcareMaxDays('self');
    if (expandChildcareDays(validSegments).length > selfMaxDays) {
        showPlannerMessage(`육아휴직 총 사용일이 ${selfMaxDays}일을 초과했습니다.`, true);
        return false;
    }
    const expectedStart = formatDateYmd(addDays(parseDateYmd(plannerState.childbirthLeave.end), 1));
    if (validSegments[0].start < expectedStart) {
        showPlannerMessage('본인 육아휴직 시작일은 출산전후휴가 종료 다음날 이후로 입력해주세요.', true);
        return false;
    }
    if (plannerState.includeFather) {
        if (plannerState.father.wage <= 0) {
            showPlannerMessage('배우자 월 통상임금을 입력해주세요.', true);
            return false;
        }
        const fatherSegments = plannerState.father.childcareSegments.filter((seg) => seg.start && seg.end);
        if (!fatherSegments.length) {
            showPlannerMessage('배우자 육아휴직 구간을 최소 1개 입력해주세요.', true);
            return false;
        }
        if (fatherSegments.length > CHILDCARE_MAX_SEGMENTS) {
            showPlannerMessage(`배우자 육아휴직 구간은 최대 ${CHILDCARE_MAX_SEGMENTS}개까지만 입력할 수 있습니다.`, true);
            return false;
        }
        for (const seg of fatherSegments) {
            if (!isValidRange(seg.start, seg.end)) {
                showPlannerMessage('배우자 육아휴직 구간의 시작일/종료일을 확인해주세요.', true);
                return false;
            }
        }
        for (let i = 1; i < plannerState.father.childcareSegments.length; i += 1) {
            const prev = plannerState.father.childcareSegments[i - 1];
            const cur = plannerState.father.childcareSegments[i];
            if (isValidRange(prev.start, prev.end) && isValidRange(cur.start, cur.end) && cur.start <= prev.end) {
                showPlannerMessage(`배우자 구간 ${i + 1} 시작일은 구간 ${i} 종료 다음날 이후로 입력해주세요.`, true);
                return false;
            }
        }
        if (hasSegmentOverlap(fatherSegments)) {
            showPlannerMessage('배우자 육아휴직 구간이 서로 겹치지 않도록 조정해주세요.', true);
            return false;
        }
        const spouseMaxDays = getChildcareMaxDays('spouse');
        if (expandChildcareDays(fatherSegments).length > spouseMaxDays) {
            showPlannerMessage(`배우자 육아휴직 총 사용일이 ${spouseMaxDays}일을 초과했습니다.`, true);
            return false;
        }
    }
    return true;
}

function recalculatePlanner() {
    renderChildcareQuotaInfo();

    if (!plannerState.isCalculated) {
        plannerState.monthlyRows = [];
        renderPaymentTable([]);
        renderPlannerBadges();
        renderCalendarBadges();
        renderPlannerCalendar();
        persistPlannerSettings();
        return;
    }

    if (!validatePlannerState()) {
        plannerState.monthlyRows = [];
        renderPaymentTable([]);
        renderPlannerBadges();
        renderCalendarBadges();
        renderPlannerCalendar();
        persistPlannerSettings();
        return;
    }
    plannerState.monthlyRows = calculatePlannerRows(plannerState);
    renderPaymentTable(plannerState.monthlyRows);
    renderPlannerBadges();
    renderCalendarBadges();
    renderPlannerCalendar();
    persistPlannerSettings();
}

function cloneSegmentList(segments) {
    return (Array.isArray(segments) ? segments : [])
        .map((seg) => ({ start: seg?.start || '', end: seg?.end || '' }))
        .filter((seg) => seg.start || seg.end);
}

function getPlannerSnapshot() {
    return {
        userType: plannerState.userType,
        wage: plannerState.wage,
        childbirthLeave: { ...plannerState.childbirthLeave },
        childcareSegments: cloneSegmentList(plannerState.childcareSegments),
        isMultipleBirth: plannerState.isMultipleBirth,
        isPremature: plannerState.isPremature,
        isPriorityCompany: plannerState.isPriorityCompany,
        spouseMonths: plannerState.spouseMonths,
        selectedPresetMonths: plannerState.selectedPresetMonths,
        lastSuggestedChildcareStart: plannerState.lastSuggestedChildcareStart,
        includeFather: plannerState.includeFather,
        includeGovBenefits: plannerState.includeGovBenefits,
        father: {
            wage: plannerState.father.wage,
            childcareSegments: cloneSegmentList(plannerState.father.childcareSegments),
            selectedPresetMonths: plannerState.father.selectedPresetMonths
        },
        calendarEditorActor: plannerState.calendarEditorActor,
        calendarView: plannerState.calendarView,
        calendarCursor: formatDateYmd(plannerState.calendarCursor),
        returnDate: plannerState.returnDate
    };
}

function persistPlannerSettings() {
    try {
        localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(getPlannerSnapshot()));
    } catch (err) {
        // Ignore storage errors (private mode/quota)
    }
}

function restorePlannerSettings() {
    try {
        const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;

        plannerState.userType = saved.userType || plannerState.userType;
        plannerState.wage = Number(saved.wage) || plannerState.wage;
        plannerState.childbirthLeave = {
            start: saved.childbirthLeave?.start || plannerState.childbirthLeave.start,
            end: saved.childbirthLeave?.end || plannerState.childbirthLeave.end
        };

        const primarySegments = cloneSegmentList(saved.childcareSegments);
        if (primarySegments.length) plannerState.childcareSegments = primarySegments;

        plannerState.isMultipleBirth = !!saved.isMultipleBirth;
        plannerState.isPremature = !!saved.isPremature;
        plannerState.isPriorityCompany = saved.isPriorityCompany === null ? null : (saved.isPriorityCompany === true);
        plannerState.spouseMonths = normalizeMonthCount(saved.spouseMonths, { min: 0, max: 18, fallback: plannerState.spouseMonths });
        plannerState.selectedPresetMonths = normalizeMonthCount(saved.selectedPresetMonths, { min: 0, max: 18, fallback: 0 });
        plannerState.lastSuggestedChildcareStart = saved.lastSuggestedChildcareStart || plannerState.lastSuggestedChildcareStart;
        plannerState.includeFather = !!saved.includeFather;
        plannerState.includeGovBenefits = !!saved.includeGovBenefits;

        plannerState.father.wage = Number(saved.father?.wage) || plannerState.father.wage;
        const fatherSegments = cloneSegmentList(saved.father?.childcareSegments);
        if (fatherSegments.length) plannerState.father.childcareSegments = fatherSegments;
        plannerState.father.selectedPresetMonths = normalizeMonthCount(saved.father?.selectedPresetMonths, { min: 0, max: 18, fallback: 0 });

        plannerState.calendarEditorActor = saved.calendarEditorActor === 'spouse' ? 'spouse' : 'self';
        plannerState.calendarView = saved.calendarView === 'week' ? 'week' : 'month';
        if (saved.calendarCursor) plannerState.calendarCursor = parseDateYmd(saved.calendarCursor);
        plannerState.returnDate = saved.returnDate || plannerState.returnDate;
    } catch (err) {
        // Ignore invalid data and continue with defaults
    }
}

function getPlannerChildOrder() {
    const childOrderInput = document.getElementById('childOrder');
    const fallbackOrder = Number(childOrderInput?.value || 1) || 1;
    const parsed = Number(benefitLinkContext.childOrder || fallbackOrder);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    if (parsed >= 5) return 5;
    return Math.floor(parsed);
}

function getPlannerBirthReferenceDate(state = plannerState) {
    const dueDate = benefitLinkContext.dueDate || dueDateInput?.value || '';
    if (dueDate && !Number.isNaN(parseDateYmd(dueDate).getTime())) return dueDate;
    const childbirthStart = state?.childbirthLeave?.start || '';
    if (!childbirthStart || Number.isNaN(parseDateYmd(childbirthStart).getTime())) return '';
    return formatDateYmd(addMonths(parseDateYmd(childbirthStart), 1));
}

function getGovBenefitMonthIndex(rowYearMonth, birthRefDate) {
    if (!birthRefDate || !rowYearMonth) return 0;
    const [rowYear, rowMonth] = rowYearMonth.split('-').map((v) => Number(v));
    const birthDate = parseDateYmd(birthRefDate);
    if (!Number.isFinite(rowYear) || !Number.isFinite(rowMonth) || Number.isNaN(birthDate.getTime())) return 0;
    const monthDiff = (rowYear - birthDate.getFullYear()) * 12 + (rowMonth - (birthDate.getMonth() + 1));
    return monthDiff + 1;
}

function getSixPlusAgeCutoffDate(birthRefDate) {
    if (!birthRefDate) return '';
    // 출생(예정)일 당일을 0개월차로 보고, 18개월 창의 마지막 날까지 허용
    return formatDateYmd(addDays(addMonths(parseDateYmd(birthRefDate), 18), -1));
}

function isSixPlusAgeEligibleByMonth(yearMonth, ageCutoffDate) {
    if (!ageCutoffDate) return true;
    const monthStart = `${yearMonth}-01`;
    return monthStart <= ageCutoffDate;
}

function calculateGovBenefitByMonth(monthIndex, childOrder = 1) {
    const recurring = monthIndex <= 12 ? 1100000
        : monthIndex <= 24 ? 600000
            : monthIndex <= 96 ? 100000
                : 0;
    const firstMeeting = childOrder >= 2 ? 3000000 : 2000000;
    const medicalSupport = 1000000;
    const oneTime = monthIndex === 1 ? (firstMeeting + medicalSupport) : 0;
    return recurring + oneTime;
}

function calculatePlannerRows(state) {
    const rows = new Map();
    const notesByMonth = new Map();
    const primaryDays = expandChildcareDays(state.childcareSegments);
    const fatherDays = state.includeFather ? expandChildcareDays(state.father.childcareSegments) : [];
    const primaryUsage = buildChildcareUsageByMonth(primaryDays);
    const fatherUsage = buildChildcareUsageByMonth(fatherDays);
    const birthRefDate = getPlannerBirthReferenceDate(state);
    const sixPlusAgeCutoffDate = getSixPlusAgeCutoffDate(birthRefDate);

    applyChildcareDaysToRows(rows, notesByMonth, primaryUsage, {
        userType: state.userType,
        wage: state.wage,
        label: '본인',
        rowKey: 'childcarePrimary'
    }, state.includeFather ? fatherUsage : [], state.includeFather ? '배우자' : null, state.includeFather ? 0 : state.spouseMonths, sixPlusAgeCutoffDate);

    if (state.includeFather) {
        applyChildcareDaysToRows(rows, notesByMonth, fatherUsage, {
            userType: 'FATHER',
            wage: state.father.wage,
            label: '배우자',
            rowKey: 'childcareFather'
        }, primaryUsage, '본인', 0, sixPlusAgeCutoffDate);
    }

    const childbirthDates = expandDateRange(state.childbirthLeave.start, state.childbirthLeave.end);
    const legalDays = state.isMultipleBirth ? leavePolicy.childbirth.multipleDays
        : state.isPremature ? leavePolicy.childbirth.prematureDays
        : leavePolicy.childbirth.baseDays;
    const govMonthlyBase = Math.min(state.wage, leavePolicy.childbirth.govCap);
    const employerPaidDays = state.isMultipleBirth ? 75 : 60;

    const payableChildbirthDates = childbirthDates.slice(0, legalDays);
    payableChildbirthDates.forEach((ymd, idx) => {
        const date = parseDateYmd(ymd);
        const ym = ymd.slice(0, 7);
        const row = getOrInitRow(rows, ym);
        const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
        let govDaily = 0;
        let companyDaily = 0;

        if (state.isPriorityCompany === true) {
            govDaily = govMonthlyBase / daysInMonth;
            if (idx < employerPaidDays) {
                companyDaily = Math.max(0, state.wage - govMonthlyBase) / daysInMonth;
            } else {
                companyDaily = 0;
            }
        } else if (state.isPriorityCompany === false) {
            if (idx < employerPaidDays) {
                companyDaily = state.wage / daysInMonth;
            } else {
                govDaily = govMonthlyBase / daysInMonth;
            }
        } else {
            if (idx < employerPaidDays) {
                companyDaily = state.wage / daysInMonth;
                addMonthNote(notesByMonth, ym, '우선지원 여부 미입력: 최초 유급구간 지급주체 추정');
            } else {
                govDaily = govMonthlyBase / daysInMonth;
            }
            row.companyUnknown = true;
            addMonthNote(notesByMonth, ym, '회사 지급분 추정 필요');
        }

        row.childbirthGov += govDaily;
        row.childbirthCompany += companyDaily;
    });

    if (childbirthDates.length > legalDays) {
        const overYmd = childbirthDates[legalDays];
        if (overYmd) {
            addMonthNote(notesByMonth, overYmd.slice(0, 7), `법정 기준 ${legalDays}일 초과분 포함`);
        }
    }

    let sortedRows = Array.from(rows.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([yearMonth, row]) => {
            const childbirthGov = roundFinalAmount(row.childbirthGov);
            const childbirthCompany = roundFinalAmount(row.childbirthCompany);
            const childcarePrimary = roundFinalAmount(row.childcarePrimary);
            const childcareFather = roundFinalAmount(row.childcareFather);
            const govBenefit = 0;
            const total = childbirthGov + childbirthCompany + childcarePrimary + childcareFather + govBenefit;
            return {
                yearMonth,
                childbirthGov,
                childbirthCompany,
                childcarePrimary,
                childcareFather,
                govBenefit,
                total,
                companyUnknown: row.companyUnknown,
                notes: Array.from(notesByMonth.get(yearMonth) || [])
            };
        });

    if (state.includeGovBenefits) {
        const childOrder = getPlannerChildOrder();
        sortedRows = sortedRows.map((row) => {
            const govBenefitMonthIndex = getGovBenefitMonthIndex(row.yearMonth, birthRefDate);
            const govBenefit = govBenefitMonthIndex > 0 ? calculateGovBenefitByMonth(govBenefitMonthIndex, childOrder) : 0;
            const notes = [...row.notes];
            if (govBenefitMonthIndex === 1 && govBenefit > 0) {
                notes.push('정부공통 혜택 포함(일시금+월지급)');
            }
            return {
                ...row,
                govBenefit,
                total: row.total + govBenefit,
                notes
            };
        });
    }

    if (!state.returnDate) {
        const lastPrimary = primaryDays[primaryDays.length - 1];
        const lastFather = fatherDays[fatherDays.length - 1];
        const lastChildcareDay = [lastPrimary, lastFather].filter(Boolean).sort().pop();
        if (lastChildcareDay) {
            state.returnDate = formatDateYmd(addDays(parseDateYmd(lastChildcareDay), 1));
        }
    }

    return sortedRows;
}

function calculateChildcareMonthlyAmount(state, monthIndex) {
    const policy = resolvePolicyRule(state, monthIndex);
    const base = state.wage * policy.rate;
    return Math.max(Math.min(base, policy.max), policy.min);
}

function resolvePolicyRule(state, monthIndex) {
    if (state.userType === 'SINGLE_PARENT') {
        return leavePolicy.singleParent.find((p) => monthIndex >= p.from && monthIndex <= p.to) || leavePolicy.singleParent[leavePolicy.singleParent.length - 1];
    }
    if (state.spouseMonths > 0 && monthIndex <= 6) {
        return leavePolicy.sixPlus.find((p) => monthIndex >= p.from && monthIndex <= p.to) || leavePolicy.sixPlus[leavePolicy.sixPlus.length - 1];
    }
    return leavePolicy.general.find((p) => monthIndex >= p.from && monthIndex <= p.to) || leavePolicy.general[leavePolicy.general.length - 1];
}

function renderPaymentTable(rows) {
    const showSpouse = plannerState.includeFather;
    const showBenefit = plannerState.includeGovBenefits;
    const visibleColCount = 5 + (showSpouse ? 1 : 0) + (showBenefit ? 1 : 0);
    if (fatherChildcareHeader) fatherChildcareHeader.hidden = !showSpouse;
    if (benefitHeader) benefitHeader.hidden = !showBenefit;

    if (!rows.length) {
        paymentTableBody.innerHTML = `<tr><td colspan="${visibleColCount}" class="empty-table">입력값을 확인해주세요.</td></tr>`;
        renderPaymentMobileCards([]);
        renderPaymentChart([]);
        return;
    }

    paymentTableBody.innerHTML = rows.map((row) => {
        const childbirthTotalText = formatCurrency(row.childbirthGov + row.childbirthCompany);
        const spouseCell = showSpouse ? `<td>${formatCurrency(row.childcareFather)}</td>` : '';
        const benefitCell = showBenefit ? `<td>${formatCurrency(row.govBenefit)}</td>` : '';
        return `
            <tr>
                <td>${row.yearMonth}</td>
                <td>${childbirthTotalText}</td>
                <td>${formatCurrency(row.childcarePrimary)}</td>
                ${spouseCell}
                ${benefitCell}
                <td><strong>${formatCurrency(row.total)}</strong></td>
                <td>${row.notes.join(', ') || '-'}</td>
            </tr>
        `;
    }).join('');
    renderPaymentMobileCards(rows);
    renderPaymentChart(rows);
}

function renderPaymentMobileCards(rows) {
    if (!paymentMobileCards) return;
    if (!rows.length) {
        paymentMobileCards.classList.add('hidden');
        paymentMobileCards.innerHTML = '';
        return;
    }

    paymentMobileCards.classList.remove('hidden');
    paymentMobileCards.innerHTML = rows.map((row) => {
        const childbirthTotalText = formatCurrency(row.childbirthGov + row.childbirthCompany);
        const spouseRow = plannerState.includeFather
            ? `<div class="payment-mobile-card-row"><span>육아휴직(배우자)</span><span>${formatCurrency(row.childcareFather)}</span></div>`
            : '';
        const benefitRow = plannerState.includeGovBenefits
            ? `<div class="payment-mobile-card-row"><span>출산혜택</span><span>${formatCurrency(row.govBenefit)}</span></div>`
            : '';
        return `
            <article class="payment-mobile-card">
                <div class="payment-mobile-card-head">
                    <strong class="payment-mobile-card-month">${row.yearMonth}</strong>
                    <strong class="payment-mobile-card-total">${formatCurrency(row.total)}</strong>
                </div>
                <div class="payment-mobile-card-row"><span>출산휴가</span><span>${childbirthTotalText}</span></div>
                <div class="payment-mobile-card-row"><span>육아휴직(본인)</span><span>${formatCurrency(row.childcarePrimary)}</span></div>
                ${spouseRow}
                ${benefitRow}
                <div class="payment-mobile-card-row"><span>비고</span><span>${row.notes.join(', ') || '-'}</span></div>
            </article>
        `;
    }).join('');
}

function renderPaymentChart(rows) {
    if (!paymentChartSection || !paymentChartSvg || !paymentChartTooltip) return;
    if (!rows.length) {
        paymentChartSection.classList.add('hidden');
        paymentChartSvg.innerHTML = '';
        paymentChartTooltip.classList.add('hidden');
        updateChartTotals(0, 0, 0, 0);
        return;
    }

    paymentChartSection.classList.remove('hidden');

    const selfUsageMap = new Map(buildChildcareUsageByMonth(expandChildcareDays(plannerState.childcareSegments))
        .map((item) => [item.yearMonth, item.ratio]));
    const spouseUsageMap = new Map((plannerState.includeFather
        ? buildChildcareUsageByMonth(expandChildcareDays(plannerState.father.childcareSegments))
        : []).map((item) => [item.yearMonth, item.ratio]));

    const primaryDays = expandChildcareDays(plannerState.childcareSegments);
    const fatherDays = plannerState.includeFather ? expandChildcareDays(plannerState.father.childcareSegments) : [];
    const primarySpouseMonths = plannerState.includeFather ? (fatherDays.length / 30) : plannerState.spouseMonths;
    const fatherSpouseMonths = primaryDays.length / 30;

    const chartRows = rows.map((row, idx) => {
        const childbirth = (row.childbirthGov || 0) + (row.childbirthCompany || 0);
        const self = row.childcarePrimary || 0;
        const spouse = plannerState.includeFather ? (row.childcareFather || 0) : 0;
        const benefit = plannerState.includeGovBenefits ? (row.govBenefit || 0) : 0;
        const total = childbirth + self + spouse;
        const totalWithBenefit = total + benefit;
        const monthIndexInfo = parseMonthIndexesFromNotes(row.notes || []);
        const sixPlus = (monthIndexInfo.self > 0 && plannerState.userType !== 'SINGLE_PARENT' && primarySpouseMonths > 0 && monthIndexInfo.self <= 6)
            || (monthIndexInfo.spouse > 0 && fatherSpouseMonths > 0 && monthIndexInfo.spouse <= 6);
        return {
            idx,
            month: idx + 1,
            yearMonth: row.yearMonth,
            childbirth,
            self,
            spouse,
            benefit,
            total,
            totalWithBenefit,
            proratedSelf: (selfUsageMap.get(row.yearMonth) || 0) > 0 && (selfUsageMap.get(row.yearMonth) || 0) < 1,
            proratedSpouse: (spouseUsageMap.get(row.yearMonth) || 0) > 0 && (spouseUsageMap.get(row.yearMonth) || 0) < 1,
            sixPlus
        };
    });

    const maxValue = Math.max(
        1,
        ...chartRows.map((row) => (paymentChartState.showChildbirth ? row.childbirth : 0)),
        ...chartRows.map((row) => (paymentChartState.showSelf ? row.self : 0)),
        ...chartRows.map((row) => (paymentChartState.showSpouse ? row.spouse : 0)),
        ...chartRows.map((row) => (paymentChartState.showTotal ? row.total : 0)),
        ...chartRows.map((row) => (paymentChartState.showBenefit ? row.totalWithBenefit : 0))
    );
    const yMax = Math.ceil(maxValue / 100000) * 100000;

    const W = 920;
    const H = 360;
    const margin = { top: 18, right: 20, bottom: 72, left: 72 };
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;
    const slotW = chartRows.length ? plotW / chartRows.length : plotW;
    const xCenter = (i) => margin.left + (i * slotW) + (slotW / 2);
    const yPos = (v) => margin.top + plotH - ((v / yMax) * plotH);

    const sixPlusRects = chartRows
        .filter((row) => row.sixPlus)
        .map((row) => `<rect x="${margin.left + row.idx * slotW}" y="${margin.top}" width="${slotW}" height="${plotH}" fill="rgba(245,158,11,0.12)" />`)
        .join('');

    const phaseBands = [
        { from: 1, to: 3, color: 'rgba(37,99,235,0.06)' },
        { from: 4, to: 6, color: 'rgba(16,185,129,0.06)' },
        { from: 7, to: chartRows.length, color: 'rgba(107,114,128,0.06)' }
    ].filter((band) => band.from <= chartRows.length)
        .map((band) => {
            const fromIdx = band.from - 1;
            const toIdx = Math.min(chartRows.length, band.to) - 1;
            const x = margin.left + fromIdx * slotW;
            const width = (toIdx - fromIdx + 1) * slotW;
            return `<rect x="${x}" y="${margin.top}" width="${width}" height="${plotH}" fill="${band.color}" />`;
        }).join('');

    const yTicks = 4;
    const gridLines = Array.from({ length: yTicks + 1 }).map((_, i) => {
        const ratio = i / yTicks;
        const value = yMax * (1 - ratio);
        const y = margin.top + (plotH * ratio);
        return `
            <line x1="${margin.left}" y1="${y}" x2="${W - margin.right}" y2="${y}" stroke="#E5E7EB" stroke-width="1" />
            <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748B">${formatShortWon(value)}</text>
        `;
    }).join('');

    const activeBarSeries = [
        paymentChartState.showChildbirth ? 'childbirth' : null,
        paymentChartState.showSelf ? 'self' : null,
        paymentChartState.showSpouse ? 'spouse' : null
    ].filter(Boolean);
    const visibleBars = activeBarSeries.length || 1;
    const groupW = Math.min(42, slotW * 0.72);
    const barGap = 2;
    const barW = Math.max(5, (groupW - (barGap * Math.max(0, visibleBars - 1))) / visibleBars);
    const getBarShift = (seriesKey) => {
        const idx = activeBarSeries.indexOf(seriesKey);
        if (idx < 0) return 0;
        const centerIdx = (visibleBars - 1) / 2;
        return (idx - centerIdx) * (barW + barGap);
    };

    const childbirthBars = paymentChartState.showChildbirth ? chartRows.map((row) => {
        const shift = getBarShift('childbirth');
        const h = Math.max(0, plotH - (yPos(row.childbirth) - margin.top));
        return `<rect x="${xCenter(row.idx) + shift - barW / 2}" y="${yPos(row.childbirth)}" width="${barW}" height="${h}" rx="3" fill="#F97316" opacity="0.88" />`;
    }).join('') : '';

    const selfBars = paymentChartState.showSelf ? chartRows.map((row) => {
        const shift = getBarShift('self');
        const h = Math.max(0, plotH - (yPos(row.self) - margin.top));
        return `<rect x="${xCenter(row.idx) + shift - barW / 2}" y="${yPos(row.self)}" width="${barW}" height="${h}" rx="3" fill="#2563EB" opacity="0.9" />`;
    }).join('') : '';

    const spouseBars = paymentChartState.showSpouse ? chartRows.map((row) => {
        const shift = getBarShift('spouse');
        const h = Math.max(0, plotH - (yPos(row.spouse) - margin.top));
        return `<rect x="${xCenter(row.idx) + shift - barW / 2}" y="${yPos(row.spouse)}" width="${barW}" height="${h}" rx="3" fill="#10B981" opacity="0.85" />`;
    }).join('') : '';

    const totalAreaPath = chartRows.map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${xCenter(row.idx)} ${yPos(row.total)}`).join(' ');
    const totalLinePath = `${totalAreaPath} L ${xCenter(chartRows.length - 1)} ${margin.top + plotH} L ${xCenter(0)} ${margin.top + plotH} Z`;
    const totalLine = paymentChartState.showTotal
        ? `<path d="${chartRows.map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${xCenter(row.idx)} ${yPos(row.total)}`).join(' ')}" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="6 4" />`
        : '';
    const totalArea = paymentChartState.showTotal
        ? `<path d="${totalLinePath}" fill="rgba(55,65,81,0.12)" />`
        : '';
    const benefitBandArea = paymentChartState.showBenefit
        ? (() => {
            const top = chartRows.map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${xCenter(row.idx)} ${yPos(row.totalWithBenefit)}`).join(' ');
            const base = chartRows.slice().reverse().map((row, idx) => `${idx === 0 ? 'L' : 'L'} ${xCenter(row.idx)} ${yPos(row.total)}`).join(' ');
            return `<path d="${top} ${base} Z" fill="rgba(245,158,11,0.30)" />`;
        })()
        : '';
    const benefitTopLine = paymentChartState.showBenefit
        ? `<path d="${chartRows.map((row, idx) => `${idx === 0 ? 'M' : 'L'} ${xCenter(row.idx)} ${yPos(row.totalWithBenefit)}`).join(' ')}" fill="none" stroke="#F59E0B" stroke-width="2.2" />`
        : '';

    const xLabels = chartRows.map((row) => {
        const hasProrated = row.proratedSelf || row.proratedSpouse;
        return `
            <text x="${xCenter(row.idx)}" y="${margin.top + plotH + 18}" text-anchor="middle" font-size="11" fill="#334155">${row.yearMonth}</text>
            ${hasProrated ? `<text class="chart-prorated-marker" data-idx="${row.idx}" x="${xCenter(row.idx)}" y="${margin.top + plotH + 34}" text-anchor="middle" font-size="12" fill="#EA580C" style="cursor:pointer;" aria-label="일할 계산 안내 보기">◐</text>` : ''}
        `;
    }).join('');

    const hitAreas = chartRows.map((row) => `
        <rect class="chart-hit-area" data-idx="${row.idx}" x="${margin.left + row.idx * slotW}" y="${margin.top}" width="${slotW}" height="${plotH}" fill="transparent" />
    `).join('');

    paymentChartSvg.innerHTML = `
        <rect x="0" y="0" width="${W}" height="${H}" fill="#FFFFFF" />
        ${phaseBands}
        ${sixPlusRects}
        ${gridLines}
        <line x1="${margin.left}" y1="${margin.top + plotH}" x2="${W - margin.right}" y2="${margin.top + plotH}" stroke="#94A3B8" stroke-width="1.2" />
        ${totalArea}
        ${benefitBandArea}
        ${childbirthBars}
        ${selfBars}
        ${spouseBars}
        ${totalLine}
        ${benefitTopLine}
        ${xLabels}
        ${hitAreas}
    `;

    const selfTotal = chartRows.reduce((sum, row) => sum + row.childbirth + row.self, 0);
    const spouseTotal = chartRows.reduce((sum, row) => sum + row.spouse, 0);
    const govBenefitTotal = chartRows.reduce((sum, row) => sum + row.benefit, 0);
    const combinedTotal = rows.reduce((sum, row) => sum + (row.total || 0), 0);
    updateChartTotals(selfTotal, spouseTotal, govBenefitTotal, combinedTotal);
    bindPaymentChartTooltip(chartRows);
}

function parseMonthIndexesFromNotes(notes) {
    const parsed = { self: 0, spouse: 0 };
    notes.forEach((note) => {
        const selfMatch = note.match(/본인\s(\d+)개월차/);
        const spouseMatch = note.match(/배우자\s(\d+)개월차/);
        if (selfMatch) parsed.self = Number(selfMatch[1]);
        if (spouseMatch) parsed.spouse = Number(spouseMatch[1]);
    });
    return parsed;
}

function bindPaymentChartTooltip(chartRows) {
    const showTooltip = (row, left, top, showProratedHelp = false) => {
        paymentChartTooltip.innerHTML = `
            <strong>${row.yearMonth} (${row.month}개월차)</strong>
            <div class="payment-chart-tooltip-row"><span>출산휴가</span><span>${formatCurrency(row.childbirth)}</span></div>
            <div class="payment-chart-tooltip-row"><span>본인</span><span>${formatCurrency(row.self)}</span></div>
            <div class="payment-chart-tooltip-row"><span>배우자</span><span>${formatCurrency(row.spouse)}</span></div>
            <div class="payment-chart-tooltip-row"><span>육아휴직 합산</span><span>${formatCurrency(row.self + row.spouse)}</span></div>
            ${plannerState.includeGovBenefits ? `<div class="payment-chart-tooltip-row"><span>출산혜택</span><span>${formatCurrency(row.benefit)}</span></div>` : ''}
            <div class="payment-chart-tooltip-row"><span>총합계</span><span>${formatCurrency(row.totalWithBenefit)}</span></div>
            ${(row.proratedSelf || row.proratedSpouse) ? `<div class="payment-chart-tooltip-row"><span>일할</span><span>◐ 적용</span></div>${showProratedHelp ? '<div class="payment-chart-tooltip-row"><span>안내</span><span>월 일부 기간만 사용되어 일할 계산됨</span></div>' : ''}` : ''}
        `;
        paymentChartTooltip.classList.remove('hidden');
        paymentChartTooltip.style.left = `${left}px`;
        paymentChartTooltip.style.top = `${top}px`;
    };

    const hitAreas = paymentChartSvg.querySelectorAll('.chart-hit-area');
    hitAreas.forEach((hit) => {
        hit.addEventListener('mousemove', (e) => {
            const idx = Number(hit.dataset.idx);
            const row = chartRows[idx];
            if (!row) return;
            const wrapRect = paymentChartSvg.getBoundingClientRect();
            const parentRect = paymentChartSection.getBoundingClientRect();
            const left = Math.min(parentRect.width - 188, Math.max(10, (e.clientX - parentRect.left) + 10));
            const top = Math.max(54, e.clientY - parentRect.top - 26);
            showTooltip(row, left, top);
            if (wrapRect.width < 1) paymentChartTooltip.classList.add('hidden');
        });
        hit.addEventListener('mouseleave', () => {
            paymentChartTooltip.classList.add('hidden');
        });
        hit.addEventListener('click', (e) => {
            const idx = Number(hit.dataset.idx);
            const row = chartRows[idx];
            if (!row) return;
            const hitRect = hit.getBoundingClientRect();
            const parentRect = paymentChartSection.getBoundingClientRect();
            const left = Math.min(parentRect.width - 188, Math.max(10, hitRect.left - parentRect.left + (hitRect.width / 2) - 70));
            const top = Math.max(54, hitRect.top - parentRect.top + 12);
            showTooltip(row, left, top);
            e.stopPropagation();
        });
    });

    const proratedMarkers = paymentChartSvg.querySelectorAll('.chart-prorated-marker');
    proratedMarkers.forEach((marker) => {
        marker.addEventListener('click', (e) => {
            const idx = Number(marker.dataset.idx);
            const row = chartRows[idx];
            if (!row) return;
            const markerRect = marker.getBoundingClientRect();
            const parentRect = paymentChartSection.getBoundingClientRect();
            const left = Math.min(parentRect.width - 188, Math.max(10, markerRect.left - parentRect.left - 70));
            const top = Math.max(54, markerRect.top - parentRect.top - 84);
            showTooltip(row, left, top, true);
            e.stopPropagation();
        });
    });

    if (paymentChartTooltip && !paymentChartTooltip.dataset.outsideBound) {
        const hideTooltipOnOutsideTap = (e) => {
            if (!paymentChartSection) return;
            if (!paymentChartSection.contains(e.target)) {
                paymentChartTooltip.classList.add('hidden');
            }
        };
        document.addEventListener('click', hideTooltipOnOutsideTap);
        document.addEventListener('touchstart', hideTooltipOnOutsideTap, { passive: true });
        paymentChartTooltip.dataset.outsideBound = '1';
    }
}

function formatShortWon(amount) {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
    if (amount >= 10000) return `${Math.round(amount / 10000)}만`;
    return Number(amount).toLocaleString('ko-KR');
}

function updateChartTotals(selfTotal, spouseTotal, govBenefitTotal, combinedTotal) {
    animateAmountCounter(chartSelfTotal, selfTotal);
    animateAmountCounter(chartSpouseTotal, spouseTotal);
    animateAmountCounter(chartGovBenefitTotal, govBenefitTotal);
    animateAmountCounter(chartCombinedTotal, combinedTotal);
}

function animateAmountCounter(el, target) {
    if (!el) return;
    const start = Number(el.dataset.value || 0);
    const diff = target - start;
    const duration = 500;
    const startedAt = performance.now();

    const tick = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const value = Math.round(start + (diff * progress));
        el.textContent = formatCurrency(value);
        if (progress < 1) requestAnimationFrame(tick);
        else el.dataset.value = String(target);
    };
    requestAnimationFrame(tick);
}

function renderPlannerBadges() {
    if (!plannerBadges) return;

    if (!plannerState.isCalculated) {
        plannerBadges.innerHTML = `
        <span class="planner-badge muted">월별 급여 계산하기를 누르면 결과가 표시됩니다.</span>
    `;
        return;
    }

    const total = plannerState.monthlyRows.reduce((sum, row) => sum + row.total, 0);
    const estimateMode = plannerState.monthlyRows.some((row) => row.companyUnknown);
    const modeBadge = estimateMode ? '추정 모드' : '확정 모드';
    plannerBadges.innerHTML = `
        <span class="planner-badge">${modeBadge}</span>
        <span class="planner-badge">총 예상 수령액 ${formatCurrency(total)}</span>
        <span class="planner-badge muted">※ 달력 기반 일할 계산</span>
    `;
}

function renderCalendarBadges() {
    if (!calendarBadges) return;
    const cursorYm = formatDateYmd(plannerState.calendarCursor).slice(0, 7);
    const currentMonthRow = plannerState.monthlyRows.find((row) => row.yearMonth === cursorYm);
    const currentMonthTotal = currentMonthRow ? currentMonthRow.total : 0;

    if (calendarNavMeta) {
        calendarNavMeta.textContent = `💰 당월 예상 수령액 합계 ${formatCurrency(currentMonthTotal)}`;
    }

    calendarBadges.innerHTML = '';
    calendarBadges.classList.add('hidden');
}

async function renderPlannerCalendar() {
    if (!plannerCalendarGrid) return;
    renderCalendarBadges();
    const cursor = plannerState.calendarCursor;
    const weeks = plannerState.calendarView === 'month'
        ? buildMonthGrid(cursor)
        : [buildWeekGrid(cursor)];

    const years = new Set();
    weeks.flat().forEach((d) => years.add(d.getFullYear()));
    const holidayMap = await loadHolidayMap([...years]);
    renderedHolidayMap = holidayMap || {};
    updateHolidayStatus([...years]);

    const cursorYm = formatDateYmd(cursor).slice(0, 7);
    const currentMonthRow = plannerState.monthlyRows.find((row) => row.yearMonth === cursorYm);
    const currentMonthTotal = currentMonthRow ? currentMonthRow.total : 0;
    calendarCurrentLabel.textContent = plannerState.calendarView === 'month'
        ? `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`
        : `${formatDateYmd(weeks[0][0])} ~ ${formatDateYmd(weeks[0][6])}`;
    if (calendarPrevBtn && calendarNextBtn) {
        const weekMode = plannerState.calendarView === 'week';
        calendarPrevBtn.textContent = weekMode ? '◀ 1주일 전' : '◀ 이전';
        calendarNextBtn.textContent = weekMode ? '1주일 후 ▶' : '다음 ▶';
    }

    const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    const header = `<div class="calendar-header">${weekdayLabels.map((w) => `<div>${w}</div>`).join('')}</div>`;

    const body = weeks.map((week) => `
        <div class="calendar-row">
            ${week.map((date) => renderCalendarCell(date, cursor, holidayMap)).join('')}
        </div>
    `).join('');

    plannerCalendarGrid.innerHTML = header + body;
    bindCalendarDaySelection();
}

function renderCalendarCell(date, cursor, holidayMap) {
    const ymd = formatDateYmd(date);
    const isToday = ymd === formatDateYmd(startOfDay(new Date()));
    const inMonth = date.getMonth() === cursor.getMonth() || plannerState.calendarView === 'week';
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const holiday = holidayMap[ymd];
    const holidayLabel = holiday ? compactHolidayLabel(holiday) : '';
    const marks = [];

    const childbirthMark = buildConnectedDayMark(ymd, date, plannerState.childbirthLeave.start, plannerState.childbirthLeave.end, 'childbirth', '출산');
    if (childbirthMark) marks.push(childbirthMark);

    plannerState.childcareSegments.forEach((seg, idx) => {
        const childcareMark = buildConnectedDayMark(ymd, date, seg.start, seg.end, 'childcare', `육휴${idx + 1}`);
        if (childcareMark) marks.push(childcareMark);
    });

    if (benefitLinkContext.dueDate && benefitLinkContext.dueDate === ymd) {
        marks.push('<span class="day-mark due-date">출산예정</span>');
    }

    if (plannerState.returnDate === ymd) marks.push('<span class="day-mark return">복직</span>');

    return `
        <div class="calendar-day ${inMonth ? '' : 'other-month'} ${weekend ? 'weekend' : ''} ${isToday ? 'today' : ''}" data-date="${ymd}">
            <div class="calendar-day-top">
                <span class="day-num">${date.getDate()}</span>
            </div>
            ${holidayLabel ? `<div class="calendar-holiday-row"><span class="holiday-label" title="${holiday}">${holidayLabel}</span></div>` : ''}
            <div class="day-marks">${marks.join('')}</div>
        </div>
    `;
}

function buildConnectedDayMark(ymd, date, start, end, cls, label) {
    if (!isDateInRange(ymd, start, end)) return '';
    const prevDate = formatDateYmd(addDays(date, -1));
    const nextDate = formatDateYmd(addDays(date, 1));
    const hasPrev = date.getDay() !== 0 && isDateInRange(prevDate, start, end);
    const hasNext = date.getDay() !== 6 && isDateInRange(nextDate, start, end);
    const dayIndex = Math.floor((parseDateYmd(ymd) - parseDateYmd(start)) / (1000 * 60 * 60 * 24)) + 1;
    const joinClass = `${hasPrev ? 'connect-prev' : ''} ${hasNext ? 'connect-next' : ''}`.trim();
    const shouldSplitLines = !hasPrev && /^육휴\d+$/.test(label);
    if (shouldSplitLines) {
        return `<span class="day-mark ${cls} ${joinClass} is-split"><span class="mark-main">${label}</span><span class="mark-sub">+${dayIndex}</span></span>`;
    }
    const text = hasPrev ? `+${dayIndex}` : `${label}+${dayIndex}`;
    return `<span class="day-mark ${cls} ${joinClass}">${text}</span>`;
}

function compactHolidayLabel(name) {
    const normalized = String(name || '').replace(/\s+/g, '');
    const compact = normalized
        .replace('대체공휴일', '대체')
        .replace('임시공휴일', '임시')
        .replace('공휴일', '휴일');
    if (compact.length <= 3) return compact;
    return `${compact.slice(0, 3)}…`;
}

function getCalendarDayDetails(ymd) {
    const details = [];
    if (renderedHolidayMap[ymd]) {
        details.push(`공휴일: ${renderedHolidayMap[ymd]}`);
    }
    if (benefitLinkContext.dueDate && benefitLinkContext.dueDate === ymd) {
        details.push('출산예정일');
    }
    const childbirthInRange = isDateInRange(ymd, plannerState.childbirthLeave.start, plannerState.childbirthLeave.end);
    if (childbirthInRange) details.push('출산휴가');
    plannerState.childcareSegments.forEach((seg, idx) => {
        if (isDateInRange(ymd, seg.start, seg.end)) {
            details.push(`육아휴직 구간 ${idx + 1}`);
        }
    });
    if (plannerState.returnDate === ymd) {
        details.push('복직(예정)');
    }
    return details.length ? details : ['등록된 일정이 없습니다.'];
}

function closeCalendarDaySheet() {
    if (!calendarDaySheet) return;
    calendarDaySheet.classList.add('hidden');
}

function openCalendarDaySheet(ymd) {
    if (!calendarDaySheet || !calendarDaySheetTitle || !calendarDaySheetList) return;
    const details = getCalendarDayDetails(ymd);
    calendarDaySheetTitle.textContent = `${ymd} 일정`;
    calendarDaySheetList.innerHTML = details.map((item) => `<li>${item}</li>`).join('');
    calendarDaySheet.classList.remove('hidden');
}

function bindCalendarDaySelection() {
    if (!plannerCalendarGrid) return;
    plannerCalendarGrid.querySelectorAll('.calendar-day').forEach((cell) => {
        cell.addEventListener('click', () => {
            const ymd = cell.getAttribute('data-date') || '';
            if (!ymd) return;
            openCalendarDaySheet(ymd);
        });
    });
}

function applyCalendarDateSelection(targetType) {
    if (targetType === 'CHILDBIRTH') {
        const start = calendarChildbirthStartInput?.value || '';
        const end = calendarChildbirthEndInput?.value || '';
        if (!isValidRange(start, end)) {
            calendarMessage.textContent = '출산휴가 시작일/종료일을 확인해주세요.';
            return;
        }
        plannerState.childbirthLeave.start = start;
        plannerState.childbirthLeave.end = end;
        if (!plannerState.childcareSegments[0]) plannerState.childcareSegments[0] = { start: '', end: '' };
        if (!plannerState.childcareSegments[0].start) {
            plannerState.childcareSegments[0].start = formatDateYmd(addDays(parseDateYmd(end), 1));
        }
    } else if (targetType === 'CHILDCARE') {
        const actor = plannerState.calendarEditorActor;
        if (actor === 'spouse' && !plannerState.includeFather) {
            plannerState.includeFather = true;
            includeFatherInput.checked = true;
        }
        const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
        const start = calendarChildcareStartInput?.value || '';
        const actorMaxDays = getChildcareMaxDays(actor);
        const days = normalizeMonthCount(calendarChildcareDaysInput?.value, { min: 1, max: actorMaxDays, fallback: 30 });
        if (calendarChildcareDaysInput) calendarChildcareDaysInput.value = String(days);
        const enteredEnd = calendarChildcareEndInput?.value || '';
        const end = isValidRange(start, enteredEnd)
            ? enteredEnd
            : suggestSegmentEndByDays(start, days, idx, actor);
        if (calendarChildcareEndInput && end) {
            calendarChildcareEndInput.value = end;
        }
        if (!isValidRange(start, end)) {
            calendarMessage.textContent = '육아휴직 시작일/종료일을 확인해주세요.';
            return;
        }
        const segments = getEditorSegments(actor);
        if (idx > 0) {
            const prev = segments[idx - 1];
            if (prev && isValidRange(prev.start, prev.end) && start <= prev.end) {
                calendarMessage.textContent = `구간 ${idx + 1} 시작일은 구간 ${idx} 종료 다음날 이후로 입력해주세요.`;
                return;
            }
        }
        if (!segments[idx]) segments[idx] = { start: '', end: '' };
        const cloned = segments.map((seg) => ({ ...seg }));
        cloned[idx] = { start, end };
        const withoutCurrent = cloned.filter((_, i) => i !== idx).filter((seg) => seg.start && seg.end);
        if (hasSegmentOverlap([...withoutCurrent, cloned[idx]])) {
            calendarMessage.textContent = '육아휴직 구간이 겹쳐서 반영되지 않았습니다.';
            return;
        }
        if (expandChildcareDays(cloned.filter((seg) => seg.start && seg.end)).length > actorMaxDays) {
            calendarMessage.textContent = `총 육아휴직 사용일이 ${actorMaxDays}일을 초과합니다.`;
            return;
        }
        segments[idx] = { start, end };
        plannerState.returnDate = '';
    }

    calendarMessage.textContent = '선택한 날짜가 달력과 계산기에 반영되었습니다.';
    renderPlannerForm();
    recalculatePlanner();
}

async function loadHolidayMap(years) {
    const map = {};
    await Promise.all(years.map((year) => loadHolidayYear(year)));
    years.forEach((year) => {
        Object.assign(map, holidayCache[year] || {});
    });
    return map;
}

async function loadHolidayYear(year) {
    if (holidayCache[year]) return holidayCache[year];
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`);
        if (!response.ok) throw new Error('holiday api error');
        const data = await response.json();
        const map = {};
        data.forEach((h) => {
            map[h.date] = h.localName || h.name;
        });
        holidayCache[year] = map;
        failedHolidayYears.delete(year);
    } catch (err) {
        holidayCache[year] = {};
        failedHolidayYears.add(year);
    }
    return holidayCache[year];
}

function updateHolidayStatus(years) {
    if (!holidayStatusMessage) return;
    if (!years.length) {
        holidayStatusMessage.classList.add('hidden');
        holidayStatusMessage.textContent = '';
        return;
    }
    const failedYears = years.filter((year) => failedHolidayYears.has(year));
    holidayStatusMessage.classList.remove('hidden');
    holidayStatusMessage.classList.toggle('is-error', failedYears.length > 0);
    if (failedYears.length) {
        holidayStatusMessage.textContent = `공휴일 정보를 일부 불러오지 못했습니다 (${failedYears.join(', ')}년). 잠시 후 다시 시도해주세요.`;
        return;
    }
    holidayStatusMessage.textContent = `공휴일 정보를 정상 불러왔습니다 (${years.join(', ')}년).`;
}

function showPlannerMessage(message, isError) {
    plannerFormMessage.textContent = message;
    plannerFormMessage.classList.remove('hidden');
    plannerFormMessage.style.borderColor = isError ? '#FCA5A5' : '#86EFAC';
    plannerFormMessage.style.backgroundColor = isError ? '#FEF2F2' : '#F0FDF4';
    plannerFormMessage.style.color = isError ? '#B91C1C' : '#166534';
}

function clearPlannerMessage() {
    plannerFormMessage.textContent = '';
    plannerFormMessage.classList.add('hidden');
    plannerFormMessage.removeAttribute('style');
}

function addMonthNote(notesByMonth, yearMonth, note) {
    if (!notesByMonth.has(yearMonth)) notesByMonth.set(yearMonth, new Set());
    notesByMonth.get(yearMonth).add(note);
}

function getOrInitRow(rows, ym) {
    if (!rows.has(ym)) {
        rows.set(ym, {
            childbirthGov: 0,
            childbirthCompany: 0,
            childcarePrimary: 0,
            childcareFather: 0,
            companyUnknown: false
        });
    }
    return rows.get(ym);
}

function applyChildcareDaysToRows(rows, notesByMonth, monthlyUsage, actorState, counterpartUsage, counterpartLabel, manualSpouseMonths = 0, sixPlusAgeCutoffDate = '') {
    const counterpartCumulativeByMonth = buildCumulativeUsageByMonth(counterpartUsage);
    const counterpartMonthUnlock = buildMonthIndexUnlockMonth(counterpartUsage);
    let cumulativeMonthRatio = 0;
    const paymentRecords = [];

    monthlyUsage.forEach((usage) => {
        const row = getOrInitRow(rows, usage.yearMonth);
        const monthIndex = Math.floor(cumulativeMonthRatio + 1e-9) + 1;
        const sixPlusAgeEligible = isSixPlusAgeEligibleByMonth(usage.yearMonth, sixPlusAgeCutoffDate);
        const counterpartMonths = getCumulativeUsageUntilMonth(counterpartCumulativeByMonth, usage.yearMonth);
        const unlockMonth = counterpartMonthUnlock.get(monthIndex) || '';
        const counterpartEligibleAtPayment = !!unlockMonth && unlockMonth <= usage.yearMonth;
        const spouseMonths = sixPlusAgeEligible
            ? ((counterpartEligibleAtPayment || manualSpouseMonths > 0) ? 1 : 0)
            : 0;
        const monthlyBaseAmount = calculateChildcareMonthlyAmount({
            userType: actorState.userType,
            wage: actorState.wage,
            spouseMonths
        }, monthIndex);
        const monthlyAmount = monthlyBaseAmount * usage.ratio;

        row[actorState.rowKey] += monthlyAmount;

        addMonthNote(notesByMonth, usage.yearMonth, `${actorState.label} ${monthIndex}개월차`);
        const sixPlusApplied = actorState.userType !== 'SINGLE_PARENT' && monthIndex <= 6 && spouseMonths > 0;
        if (sixPlusApplied) {
            addMonthNote(
                notesByMonth,
                usage.yearMonth,
                `${actorState.label} ${monthIndex}개월 6+6 적용${counterpartLabel ? `(${counterpartLabel})` : ''}`
            );
        } else if (actorState.userType !== 'SINGLE_PARENT' && monthIndex <= 6 && !sixPlusAgeEligible && (counterpartMonths > 0 || manualSpouseMonths > 0)) {
            addMonthNote(
                notesByMonth,
                usage.yearMonth,
                `${actorState.label} ${monthIndex}개월 6+6 미적용(자녀 18개월 기준)`
            );
        }
        paymentRecords.push({
            yearMonth: usage.yearMonth,
            monthIndex,
            ratio: usage.ratio,
            paidBase: monthlyBaseAmount,
            counterpartEligibleAtPayment
        });

        cumulativeMonthRatio += usage.ratio;
    });

    if (actorState.userType === 'SINGLE_PARENT') return;
    paymentRecords.forEach((record) => {
        if (record.monthIndex > 6) return;
        if (!isSixPlusAgeEligibleByMonth(record.yearMonth, sixPlusAgeCutoffDate)) return;
        if (record.counterpartEligibleAtPayment) return;
        const unlockMonth = counterpartMonthUnlock.get(record.monthIndex);
        if (!unlockMonth) return;
        if (unlockMonth <= record.yearMonth) return;

        const sixPlusBase = calculateChildcareMonthlyAmount({
            userType: actorState.userType,
            wage: actorState.wage,
            spouseMonths: 1
        }, record.monthIndex);
        const retroDiff = (sixPlusBase - record.paidBase) * record.ratio;
        if (retroDiff <= 0) return;

        const targetRow = getOrInitRow(rows, unlockMonth);
        targetRow[actorState.rowKey] += retroDiff;
        addMonthNote(
            notesByMonth,
            unlockMonth,
            `${actorState.label} ${record.monthIndex}개월 6+6 소급${counterpartLabel ? `(${counterpartLabel})` : ''}`
        );
    });
}

function buildCumulativeUsageByMonth(monthlyUsage) {
    const map = new Map();
    let cumulative = 0;
    monthlyUsage.forEach((usage) => {
        cumulative += usage.ratio;
        map.set(usage.yearMonth, cumulative);
    });
    return map;
}

function getCumulativeUsageUntilMonth(cumulativeMap, yearMonth) {
    let value = 0;
    cumulativeMap.forEach((cumulative, ym) => {
        if (ym <= yearMonth) value = cumulative;
    });
    return value;
}

function buildMonthIndexUnlockMonth(monthlyUsage) {
    const map = new Map();
    let cumulative = 0;
    monthlyUsage.forEach((usage) => {
        const monthIndex = Math.floor(cumulative + 1e-9) + 1;
        if (!map.has(monthIndex)) map.set(monthIndex, usage.yearMonth);
        cumulative += usage.ratio;
    });
    return map;
}

function hasSegmentOverlap(segments) {
    const sorted = [...segments].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i += 1) {
        if (sorted[i].start <= sorted[i - 1].end) return true;
    }
    return false;
}

function expandChildcareDays(segments) {
    const sorted = [...segments]
        .filter((seg) => seg.start && seg.end)
        .sort((a, b) => a.start.localeCompare(b.start));
    const days = [];
    sorted.forEach((seg) => {
        expandDateRange(seg.start, seg.end).forEach((ymd) => {
            days.push(ymd);
        });
    });
    return days;
}

function buildChildcareUsageByMonth(days) {
    const counts = new Map();
    days.forEach((ymd) => {
        const ym = ymd.slice(0, 7);
        counts.set(ym, (counts.get(ym) || 0) + 1);
    });
    return Array.from(counts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([yearMonth, leaveDays]) => {
            const [year, month] = yearMonth.split('-').map(Number);
            const daysInMonth = getDaysInMonth(year, month - 1);
            return {
                yearMonth,
                leaveDays,
                daysInMonth,
                ratio: leaveDays / daysInMonth
            };
        });
}

function roundFinalAmount(amount) {
    return Math.round(amount);
}

function expandDateRange(start, end) {
    if (!start || !end || start > end) return [];
    const result = [];
    let cursor = parseDateYmd(start);
    const until = parseDateYmd(end);
    while (cursor <= until) {
        result.push(formatDateYmd(cursor));
        cursor = addDays(cursor, 1);
    }
    return result;
}

function buildMonthGrid(cursor) {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = addDays(first, -first.getDay());
    const weeks = [];
    let day = start;
    for (let w = 0; w < 6; w += 1) {
        const week = [];
        for (let d = 0; d < 7; d += 1) {
            week.push(day);
            day = addDays(day, 1);
        }
        weeks.push(week);
    }
    return weeks;
}

function buildWeekGrid(cursor) {
    const start = addDays(cursor, -cursor.getDay());
    const week = [];
    for (let i = 0; i < 7; i += 1) week.push(addDays(start, i));
    return week;
}

function isDateInRange(ymd, start, end) {
    if (!start || !end) return false;
    return ymd >= start && ymd <= end;
}

function isValidRange(start, end) {
    return !!start && !!end && start <= end;
}

function parseDateYmd(ymd) {
    return new Date(`${ymd}T12:00:00`);
}

function formatDateYmd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
