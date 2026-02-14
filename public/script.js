import { governmentBenefits, localBenefitsData } from './data.js?v=2';

// DOM 요소
const citySelect = document.getElementById('citySelect');
const districtSelect = document.getElementById('districtSelect');
const benefitForm = document.getElementById('benefitForm');
const dueDateInput = document.getElementById('dueDate');
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

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCityDropdown();

    // 이벤트 리스너
    citySelect.addEventListener('change', handleCityChange);
    benefitForm.addEventListener('submit', handleFormSubmit);
    tabBtns.forEach(btn => btn.addEventListener('click', handleTabClick));
});

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

// 1. 시/도 드롭다운 초기화
function initCityDropdown() {
    // 기본 옵션 외에 데이터 기반 옵션 추가
    for (const key in localBenefitsData) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = localBenefitsData[key].name;
        citySelect.appendChild(option);
    }
}

// 2. 시/도 변경 핸들러 (종속 드롭다운)
function handleCityChange(e) {
    const selectedCity = e.target.value;

    // 시/군/구 리셋
    districtSelect.innerHTML = '<option value="">시/군/구 선택</option>';
    districtSelect.disabled = true;

    if (selectedCity && localBenefitsData[selectedCity]) {
        const districts = localBenefitsData[selectedCity].districts;
        for (const key in districts) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = districts[key].name;
            districtSelect.appendChild(option);
        }
        districtSelect.disabled = false;
    }
}

// 3. 폼 제출 핸들러
function handleFormSubmit(e) {
    e.preventDefault();

    const city = citySelect.value;
    const district = districtSelect.value;
    const dueDate = dueDateInput.value;
    const childOrder = parseInt(document.getElementById('childOrder').value); // 자녀 순서 (1, 2, 3)

    if (!city || !district || !dueDate) {
        alert("모든 항목을 올바르게 선택해주세요.");
        return;
    }

    // 로딩 UI 표시
    resultSection.classList.add('hidden');
    checklistSection.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    // 데이터 처리 시뮬레이션 (0.5초)
    setTimeout(() => {
        // 1. 전국 비교 분석 (신규)
        const comparison = findMaxMinRegions(childOrder);
        renderComparisonSummary(comparison);

        // 2. 선택 지역 혜택 렌더링
        renderBenefits(city, district, childOrder);
        renderChecklist(dueDate);
        renderTotalSummary(city, district, childOrder); // 총액 계산 함수 호출
        
        loadingSpinner.classList.add('hidden');
        resultSection.classList.remove('hidden');
        document.getElementById('comparisonSection').classList.remove('hidden'); // 비교 섹션 표시
        checklistSection.classList.remove('hidden');
        document.getElementById('totalSummarySection').classList.remove('hidden');
        
        // 기본으로 '전체 혜택' 탭 활성화
        handleTabClick({ target: document.querySelector('.tab-btn[data-tab="all"]') });

        // 스크롤 이동 (비교 섹션으로)
        document.getElementById('comparisonSection').scrollIntoView({ behavior: 'smooth' });
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

    card.innerHTML = `
        <h3 class="benefit-title">${benefit.title} ${badgeText}</h3>
        <div class="benefit-amount">${displayAmount}</div>
        <div class="benefit-detail"><strong>대상</strong> <span>${benefit.target}</span></div>
        <div class="benefit-detail"><strong>신청</strong> <span>${benefit.method}</span></div>
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
    const targetId = e.target.dataset.tab;

    // 버튼 활성화 상태 변경
    tabBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // 콘텐츠 표시 상태 변경
    if (targetId === 'all') {
        governmentTabContent.classList.add('active');
        localTabContent.classList.add('active');
    } else {
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetId) {
                content.classList.add('active');
            }
        });
    }
}