import { governmentBenefits, localBenefitsData } from './data.js?v=2';

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
    calendar: document.getElementById('calendarServicePanel')
};
const quickStartBtns = document.querySelectorAll('.quick-start-btn');

// 육아휴직 계산기/달력 요소
const leavePlannerForm = document.getElementById('leavePlannerForm');
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
const addCalendarChildcareSegmentBtn = document.getElementById('addCalendarChildcareSegmentBtn');
const applyCalendarChildcareBtn = document.getElementById('applyCalendarChildcareBtn');
const calendarPrevBtn = document.getElementById('calendarPrevBtn');
const calendarNextBtn = document.getElementById('calendarNextBtn');
const calendarCurrentLabel = document.getElementById('calendarCurrentLabel');
const calendarNavMeta = document.getElementById('calendarNavMeta');
const viewMonthBtn = document.getElementById('viewMonthBtn');
const viewWeekBtn = document.getElementById('viewWeekBtn');
const plannerCalendarGrid = document.getElementById('plannerCalendarGrid');
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

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initServiceTabs();
    initQuickStart();
    initLeavePlanner();
    initBenefitLinkState();

    if (benefitForm && citySelect && districtSelect && dueDateInput) {
        initCityDropdown();
        setDueDateInputRange();
        setLoadingState(false);

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
    }
});

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
            switchServiceTab(target);
            servicePanels[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initBenefitLinkState() {
    if (!includeGovBenefitsInput) return;
    setGovBenefitLinkStatus(false);
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

    includeGovBenefitsInput.disabled = !linked;

    if (!linked) {
        includeGovBenefitsInput.checked = false;
        plannerState.includeGovBenefits = false;
        if (includeGovBenefitsHint) {
            includeGovBenefitsHint.textContent = '※ 동네 혜택 조회를 완료하면 정부지원금 연동 옵션이 자동 활성화됩니다.';
        }
        return;
    }

    includeGovBenefitsInput.checked = true;
    plannerState.includeGovBenefits = true;
    if (includeGovBenefitsHint) {
        const childLabel = benefitLinkContext.childOrder >= 5 ? '다섯째 이상' : `${benefitLinkContext.childOrder}째`;
        includeGovBenefitsHint.textContent = `※ 최근 조회 기준(${childLabel}, ${benefitLinkContext.city} ${benefitLinkContext.district}) 정부지원금을 월별 급여에 자동 반영합니다.`;
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

    card.innerHTML = `
        <h3 class="benefit-title">${benefit.title} ${badgeText}</h3>
        <div class="benefit-amount">${displayAmount}</div>
        <div class="benefit-detail"><strong>대상</strong> <span>${benefit.target}</span></div>
        <div class="benefit-detail"><strong>신청</strong> <span>${methodText}</span></div>
        ${benefit.contact ? `<div class="benefit-detail"><strong>문의</strong> <span>${benefit.contact}</span></div>` : ''}
        ${benefit.note ? `<div class="benefit-detail"><strong>참고</strong> <span>${benefit.note}</span></div>` : ''}
    `;
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
    serviceTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.serviceTab;
            switchServiceTab(target);
        });
        btn.addEventListener('keydown', (e) => handleArrowNavigation(e, serviceTabBtns, true));
    });
}

function switchServiceTab(target) {
    serviceTabBtns.forEach((btn) => {
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
    }
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
    monthlyRows: []
};

const holidayCache = {};
const failedHolidayYears = new Set();

const paymentChartState = {
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

const CHILDCARE_MAX_MONTHS = 18;
const AVG_DAYS_PER_MONTH = 365.25 / 12;
const CHILDCARE_MAX_DAYS = Math.round(CHILDCARE_MAX_MONTHS * AVG_DAYS_PER_MONTH);
const CHILDCARE_MAX_SEGMENTS = 4;
const PLANNER_STORAGE_KEY = 'leavePlannerSettingsV1';

function initLeavePlanner() {
    if (!leavePlannerForm) return;

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
                if (key === 'self') paymentChartState.showSelf = !paymentChartState.showSelf;
                if (key === 'spouse') paymentChartState.showSpouse = !paymentChartState.showSpouse;
                if (key === 'benefit') paymentChartState.showBenefit = !paymentChartState.showBenefit;
                if (key === 'total') paymentChartState.showTotal = !paymentChartState.showTotal;
                btn.classList.toggle('active', (key === 'self' && paymentChartState.showSelf)
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
        const months = normalizeMonthCount(motherPresetRange.value, { min: 1, max: 18, fallback: 12 });
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
    if (calendarChildcareStartInput) {
        calendarChildcareStartInput.addEventListener('change', () => {
            const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
            const start = calendarChildcareStartInput.value;
            if (!start) return;
            if (!calendarChildcareDaysInput.value) calendarChildcareDaysInput.value = '30';
            const days = normalizeMonthCount(calendarChildcareDaysInput.value, { min: 1, max: CHILDCARE_MAX_DAYS, fallback: 30 });
            calendarChildcareDaysInput.value = String(days);
            if (!calendarChildcareEndInput.value || calendarChildcareEndInput.value < start) {
                calendarChildcareEndInput.value = suggestSegmentEndByDays(start, days, idx, plannerState.calendarEditorActor);
            }
            renderCalendarChildcareDerivedFields();
        });
    }
    if (calendarChildcareDaysInput) {
        calendarChildcareDaysInput.addEventListener('input', () => {
            const idx = Number((calendarChildcareSegmentIndex && calendarChildcareSegmentIndex.value) || 0);
            const start = calendarChildcareStartInput?.value || '';
            if (!start) return;
            const days = normalizeMonthCount(calendarChildcareDaysInput.value, { min: 1, max: CHILDCARE_MAX_DAYS, fallback: 30 });
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
        calendarChildbirthStartInput.addEventListener('change', () => renderCalendarChildbirthInfo());
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
            applyCalendarDateSelection('CHILDBIRTH');
        });
    }
    if (applyCalendarChildcareBtn) {
        applyCalendarChildcareBtn.addEventListener('click', () => {
            applyCalendarDateSelection('CHILDCARE');
        });
    }

    renderPlannerForm();
    recalculatePlanner();
}

function handlePlannerSubmit(e) {
    e.preventDefault();
    collectPlannerForm();
    if (!validatePlannerState()) return;
    recalculatePlanner();
    showPlannerMessage('계산이 완료되었습니다.', false);
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
    }
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
    fatherWageInput.value = formatNumberInput(plannerState.father.wage);
    fatherInputSection.classList.toggle('hidden', !plannerState.includeFather);
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
                if (!plannerState.childcareSegments[idx].end || plannerState.childcareSegments[idx].end < safeStart) {
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
                if (!plannerState.father.childcareSegments[idx].end || plannerState.father.childcareSegments[idx].end < safeStart) {
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
        showPlannerMessage(`${getEditorLabel(actor)} 육아휴직 사용 가능일(${CHILDCARE_MAX_DAYS}일)을 모두 사용했습니다.`, true);
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
    return Math.max(0, CHILDCARE_MAX_DAYS - used);
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
    calendarChildcareRemainingInfo.textContent = `${getEditorLabel(actor)} 남은 휴직일: ${remaining}일(약 ${formatMonthApprox(remaining)}개월)`;
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
    const requestedDays = normalizeMonthCount(calendarChildcareDaysInput?.value, { min: 0, max: CHILDCARE_MAX_DAYS, fallback: 0 });
    const residual = Math.max(0, baseRemaining - requestedDays);
    calendarChildcareResidualHint.textContent = `잔여예정 ${residual}일`;
}

function renderChildcareQuotaInfo() {
    const used = expandChildcareDays(plannerState.childcareSegments.filter((seg) => seg.start && seg.end)).length;
    const remaining = Math.max(0, CHILDCARE_MAX_DAYS - used);
    if (childcareQuotaInfo) {
        childcareQuotaInfo.textContent = `사용 ${used}일 · 남은 ${remaining}일(약 ${formatMonthApprox(remaining)}개월) / 총 ${CHILDCARE_MAX_MONTHS}개월(약 ${(CHILDCARE_MAX_MONTHS * AVG_DAYS_PER_MONTH).toFixed(1)}일) · 분할 ${plannerState.childcareSegments.length}/${CHILDCARE_MAX_SEGMENTS}`;
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
    const value = plannerState.selectedPresetMonths || normalizeMonthCount(motherPresetRange.value, { min: 1, max: 18, fallback: 12 });
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
    if (expandChildcareDays(validSegments).length > CHILDCARE_MAX_DAYS) {
        showPlannerMessage(`육아휴직 총 사용일이 ${CHILDCARE_MAX_DAYS}일을 초과했습니다.`, true);
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
        if (expandChildcareDays(fatherSegments).length > CHILDCARE_MAX_DAYS) {
            showPlannerMessage(`배우자 육아휴직 총 사용일이 ${CHILDCARE_MAX_DAYS}일을 초과했습니다.`, true);
            return false;
        }
    }
    return true;
}

function recalculatePlanner() {
    renderChildcareQuotaInfo();
    if (!validatePlannerState()) {
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
    const parsed = Number(benefitLinkContext.childOrder || 1);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    if (parsed >= 5) return 5;
    return Math.floor(parsed);
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

    applyChildcareDaysToRows(rows, notesByMonth, primaryUsage, {
        userType: state.userType,
        wage: state.wage,
        label: '본인',
        rowKey: 'childcarePrimary'
    }, state.includeFather ? fatherUsage : [], state.includeFather ? '배우자' : null, state.spouseMonths);

    if (state.includeFather) {
        applyChildcareDaysToRows(rows, notesByMonth, fatherUsage, {
            userType: 'FATHER',
            wage: state.father.wage,
            label: '배우자',
            rowKey: 'childcareFather'
        }, primaryUsage, '본인', 0);
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
        sortedRows = sortedRows.map((row, idx) => {
            const govBenefit = calculateGovBenefitByMonth(idx + 1, childOrder);
            const notes = [...row.notes];
            if (idx === 0 && govBenefit > 0) {
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
        const childbirthTotalText = row.companyUnknown
            ? `${formatCurrency(row.childbirthGov)} + 회사 추정 필요`
            : formatCurrency(row.childbirthGov + row.childbirthCompany);
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
        const childbirthTotalText = row.companyUnknown
            ? `${formatCurrency(row.childbirthGov)} + 회사 추정 필요`
            : formatCurrency(row.childbirthGov + row.childbirthCompany);
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
        const self = row.childcarePrimary || 0;
        const spouse = plannerState.includeFather ? (row.childcareFather || 0) : 0;
        const benefit = plannerState.includeGovBenefits ? (row.govBenefit || 0) : 0;
        const total = self + spouse;
        const totalWithBenefit = total + benefit;
        const monthIndexInfo = parseMonthIndexesFromNotes(row.notes || []);
        const sixPlus = (monthIndexInfo.self > 0 && plannerState.userType !== 'SINGLE_PARENT' && primarySpouseMonths > 0 && monthIndexInfo.self <= 6)
            || (monthIndexInfo.spouse > 0 && fatherSpouseMonths > 0 && monthIndexInfo.spouse <= 6);
        return {
            idx,
            month: idx + 1,
            yearMonth: row.yearMonth,
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

    const visibleBars = [paymentChartState.showSelf, paymentChartState.showSpouse].filter(Boolean).length || 1;
    const groupW = Math.min(28, slotW * 0.65);
    const barW = Math.max(6, (groupW - 4) / visibleBars);

    const selfBars = paymentChartState.showSelf ? chartRows.map((row) => {
        const shift = paymentChartState.showSpouse ? (-barW / 2 - 1) : 0;
        const h = Math.max(0, plotH - (yPos(row.self) - margin.top));
        return `<rect x="${xCenter(row.idx) + shift - barW / 2}" y="${yPos(row.self)}" width="${barW}" height="${h}" rx="3" fill="#2563EB" opacity="0.9" />`;
    }).join('') : '';

    const spouseBars = paymentChartState.showSpouse ? chartRows.map((row) => {
        const shift = paymentChartState.showSelf ? (barW / 2 + 1) : 0;
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
        ${selfBars}
        ${spouseBars}
        ${totalLine}
        ${benefitTopLine}
        ${xLabels}
        ${hitAreas}
    `;

    const selfTotal = chartRows.reduce((sum, row) => sum + row.self, 0);
    const spouseTotal = chartRows.reduce((sum, row) => sum + row.spouse, 0);
    const govBenefitTotal = chartRows.reduce((sum, row) => sum + row.benefit, 0);
    updateChartTotals(selfTotal, spouseTotal, govBenefitTotal, selfTotal + spouseTotal + govBenefitTotal);
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
            <div class="payment-chart-tooltip-row"><span>본인</span><span>${formatCurrency(row.self)}</span></div>
            <div class="payment-chart-tooltip-row"><span>배우자</span><span>${formatCurrency(row.spouse)}</span></div>
            <div class="payment-chart-tooltip-row"><span>합산</span><span>${formatCurrency(row.total)}</span></div>
            ${plannerState.includeGovBenefits ? `<div class="payment-chart-tooltip-row"><span>출산혜택</span><span>${formatCurrency(row.benefit)}</span></div>` : ''}
            ${plannerState.includeGovBenefits ? `<div class="payment-chart-tooltip-row"><span>누적합산</span><span>${formatCurrency(row.totalWithBenefit)}</span></div>` : ''}
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
        const days = normalizeMonthCount(calendarChildcareDaysInput?.value, { min: 1, max: CHILDCARE_MAX_DAYS, fallback: 30 });
        if (calendarChildcareDaysInput) calendarChildcareDaysInput.value = String(days);
        const end = suggestSegmentEndByDays(start, days, idx, actor);
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
        if (expandChildcareDays(cloned.filter((seg) => seg.start && seg.end)).length > CHILDCARE_MAX_DAYS) {
            calendarMessage.textContent = `총 육아휴직 사용일이 ${CHILDCARE_MAX_DAYS}일을 초과합니다.`;
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

function applyChildcareDaysToRows(rows, notesByMonth, monthlyUsage, actorState, counterpartUsage, counterpartLabel, manualSpouseMonths = 0) {
    const counterpartCumulativeByMonth = buildCumulativeUsageByMonth(counterpartUsage);
    const counterpartMonthUnlock = buildMonthIndexUnlockMonth(counterpartUsage);
    let cumulativeMonthRatio = 0;
    const paymentRecords = [];

    monthlyUsage.forEach((usage) => {
        const row = getOrInitRow(rows, usage.yearMonth);
        const monthIndex = Math.floor(cumulativeMonthRatio + 1e-9) + 1;
        const counterpartMonths = counterpartCumulativeByMonth.get(usage.yearMonth) || 0;
        const spouseMonths = counterpartMonths > 0 ? counterpartMonths : manualSpouseMonths;
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
        }
        paymentRecords.push({
            yearMonth: usage.yearMonth,
            monthIndex,
            ratio: usage.ratio,
            paidBase: monthlyBaseAmount
        });

        cumulativeMonthRatio += usage.ratio;
    });

    if (actorState.userType === 'SINGLE_PARENT') return;
    paymentRecords.forEach((record) => {
        if (record.monthIndex > 6) return;
        const unlockMonth = counterpartMonthUnlock.get(record.monthIndex);
        if (!unlockMonth) return;

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
