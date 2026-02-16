// 데이터 구조 정의 및 데이터 내보내기

// 1. 정부 공통 혜택 (2026년 2월 기준 - 통합형)
export const governmentBenefits = [
    {
        title: "첫만남이용권",
        amount: {
            summary: "200 ~ 300만원",
            value: { 1: 2000000, 2: 3000000, 3: 3000000, 4: 3000000, 5: 3000000 }
        },
        target: "2024년 이후 출생아",
        method: "복지로 웹사이트 또는 주민센터 방문 신청",
        note: "국민행복카드 바우처 (첫째 200, 둘째 이상 300)"
    },
    {
        title: "부모급여",
        amount: {
            summary: "월 50 ~ 100만원",
            value: { 1: 1000000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 }
        },
        target: "만 0~1세 아동",
        method: "복지로, 정부24 온라인 신청",
        note: "만 0세: 월 100만원, 만 1세: 월 50만원 (현금)"
    },
    {
        title: "아동수당",
        amount: 100000,
        target: "만 8세 미만 아동",
        method: "복지로 또는 주민센터",
        note: "만 8세 미만까지 매월 10만원 지급"
    },
    {
        title: "임신·출산 진료비 지원",
        amount: {
            summary: "100 ~ 140만원",
            value: { 1: 1000000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 }
        },
        target: "건강보험 가입 임산부",
        method: "국민건강보험공단 또는 카드사 신청",
        note: "단태아 100만원, 다태아 140만원 (바우처)"
    }
];

// --- 광역 지자체별 공통 혜택 생성 함수들 ---

const getGangwonCommon = (contact) => [
    { title: "강원도 산후 건강관리 지원", amount: { summary: "15 ~ 30만원", value: { 1: 150000, 2: 200000, 3: 300000, 4: 300000, 5: 300000 } }, target: "도내 6개월 이상 거주 산모", method: "보건소", contact: contact },
    { title: "산모·신생아 건강관리 지원", amount: { summary: "최대 20만원", total: 200000 }, target: "도내 6개월 이상 거주자", method: "보건소", contact: contact }
];

const getGyeonggiCommon = (contact) => [
    { title: "경기도 산후조리비 지원", amount: 500000, target: "경기도 거주 출산가정 (소득 무관)", method: "행정복지센터 / 경기민원24", contact: contact, note: "지역화폐 지급 (산후조리원, 영양제 등 사용)" }
];

const getChungbukCommon = () => [
    { title: "충청북도 출산육아수당", amount: { summary: "1000만원", total: 10000000 }, target: "충북 거주", method: "행정복지센터", note: "1년마다 6회 분할 지급" }
];

const getChungnamCommon = () => [
    { title: "충남 행복키움수당", amount: { monthly: 100000, duration_months: 24, display: "월 10만원" }, target: "충남 거주 (12~35개월)", method: "행정복지센터", note: "소득 무관, 도비 전액 지원" }
];

const getJeonnamCommon = (contact) => [
    { title: "전남 공공산후조리원 감면", amount: { display: "서비스 지원 (70% 감면)" }, target: "전라남도 거주 (둘째아 이상 등)", method: "공공산후조리원", contact: contact, note: "2주 기준 약 107만원 상당 혜택" }
];

const getBusanCommon = () => [
    { title: "부산광역시 출산지원금", amount: { summary: "100만원 (둘째+)", value: { 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "부산광역시 거주 (둘째 이후)", method: "행정복지센터", note: "기초지자체와 중복 가능" }
];

const getSeoulCommon = (contact) => [
    { title: "서울형 산후조리경비 지원", amount: 1000000, target: "서울특별시 거주 산모", method: "서울맘케어", contact: contact, note: "바우처 지급" }
];

const getJejuCommon = (contact) => [
    {
        title: "제주 해피아이 정책 (육아지원금)",
        amount: {
            summary: "500 ~ 1000만원",
            value: { 1: 5000000, 2: 10000000, 3: 10000000, 4: 10000000, 5: 10000000 }
        },
        target: "제주특별자치도 거주 (6~12개월 이상)",
        method: "행정복지센터",
        contact: contact
    }
];

const getIncheonCommon = () => [
    {
        title: "천사(1004) 지원금",
        amount: { monthly: 100000, duration_months: 84, total: 8400000, display: "총 840만원 (연 120만원×7년)" },
        target: "인천광역시 거주 1세~7세 아동 (1년 이상 거주)",
        method: "인천e음 앱",
        note: "매년 생일 60일 이내 신청"
    },
    {
        title: "맘편한 산후조리비",
        amount: 1500000,
        target: "인천광역시 거주 취약계층 산모 (1년 이상 거주)",
        method: "보건소",
        note: "인천e음 포인트 지급"
    }
];

const getGwangjuCommon = () => [
    {
        title: "다태아 출산축하금",
        amount: { summary: "100만원 (다태아)", value: { 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } },
        target: "광주광역시 거주 다태아 출산 가정",
        method: "행정복지센터"
    }
];

// --- 지자체 특화 혜택 데이터 (전국 통합) ---

export const localBenefitsData = {
    "seoul": {
        name: "서울특별시",
        districts: {
            "gangnam": { name: "강남구", benefits: [...getSeoulCommon("02-3423-5855"), { title: "출산양육지원금", amount: { summary: "200 ~ 500만원", value: { 1: 2000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "강남구 1년 거주", contact: "02-3423-5855" }] },
            "gangdong": { name: "강동구", benefits: [...getSeoulCommon("02-3425-5876"), { title: "서비스/물품 지원 정보", amount: { display: "문의 필요" }, target: "강동구 거주", contact: "02-3425-5876" }] },
            "gangbuk": { name: "강북구", benefits: [...getSeoulCommon("02-901-6703")] },
            "gangseo": { name: "강서구", benefits: [...getSeoulCommon("02-2600-6757")] },
            "gwanak": { name: "관악구", benefits: [...getSeoulCommon("02-879-6133"), { title: "유축기 대여", amount: { display: "서비스 지원 (유축기)" }, target: "관악구 가정", contact: "02-879-6133", note: "40일간 대여" }] },
            "gwangjin": { name: "광진구", benefits: [...getSeoulCommon("02-450-7568"), { title: "첫돌(출산) 축하금", amount: 500000, target: "광진구 거주", contact: "02-450-7568" }] },
            "guro": { name: "구로구", benefits: [...getSeoulCommon("02-860-3013"), { title: "다자녀 축하금", amount: { summary: "60 ~ 200만원", value: { 3: 600000, 4: 2000000, 5: 2000000 } }, target: "구로구 6개월 거주", contact: "02-860-3013" }] },
            "geumcheon": { name: "금천구", benefits: [...getSeoulCommon("02-2627-1437"), { title: "출산축하금 (셋째+)", amount: { summary: "70 ~ 100만원", value: { 3: 700000, 4: 1000000, 5: 1000000 } }, target: "1년내 신청", contact: "02-2627-1437", note: "넷째 이상 100만원" }, { title: "출생축하용품 지원", amount: { display: "서비스 지원 (용품)" }, target: "금천구 거주", contact: "02-2627-1437", note: "5만원 상당 육아용품 세트" }] },
            "nowon": { name: "노원구", benefits: [...getSeoulCommon("02-2116-3722"), { title: "다자녀 출산축하용품", amount: { display: "서비스 지원 (용품)" }, target: "노원구 둘째+", contact: "02-2116-3722", note: "20만원 상당 용품 지원" }] },
            "dobong": { name: "도봉구", benefits: [...getSeoulCommon("02-2091-3145"), { title: "출생축하용품", amount: { display: "서비스 지원 (용품)" }, target: "도봉구 거주", contact: "02-2091-3145", note: "육아용품 세트 택배 배송" }] },
            "dongdaemun": { name: "동대문구", benefits: [...getSeoulCommon("02-2127-5082"), { title: "첫아이 출산축하용품", amount: { display: "서비스 지원 (포인트)" }, target: "동대문구 첫째", contact: "02-2127-5082", note: "20만 포인트 (전용몰 사용)" }] },
            "dongjak": { name: "동작구", benefits: [...getSeoulCommon("02-820-9234"), { title: "동작출산축하금", amount: { summary: "30 ~ 200만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 2000000, 5: 2000000 } }, target: "동작구 6개월 거주", contact: "02-820-9234" }, { title: "동작출산축하용품", amount: { display: "서비스 지원 (용품)" }, target: "동작구 거주", contact: "02-820-9234" }, { title: "신생아 상해·질병 보험", amount: { display: "서비스 지원 (보험)" }, target: "동작구 둘째+", contact: "02-820-9234", note: "5년간 보험료 전액 지원" }] },
            "mapo": { name: "마포구", benefits: [...getSeoulCommon("02-3153-9072")] },
            "seodaemun": { name: "서대문구", benefits: [...getSeoulCommon("02-330-1834"), { title: "임신축하금", amount: 300000, target: "서대문구 1년 거주", contact: "02-330-1834" }] },
            "seocho": { name: "서초구", benefits: [...getSeoulCommon("02-2155-6685")] },
            "seongdong": { name: "성동구", benefits: [...getSeoulCommon("02-2286-6878"), { title: "출생축하금 (셋째+)", amount: { summary: "300 ~ 1000만원", value: { 3: 3000000, 4: 5000000, 5: 10000000 } }, target: "성동구 1년 거주", contact: "02-2286-6878" }] },
            "seongbuk": { name: "성북구", benefits: [...getSeoulCommon("02-2241-2587"), { title: "출산 행복지원금", amount: { summary: "100 ~ 200만원", value: { 3: 1000000, 4: 1500000, 5: 2000000 } }, target: "성북구 6개월 거주", contact: "02-2241-2587" }] },
            "songpa": { name: "송파구", benefits: [...getSeoulCommon("02-2147-2791")] },
            "yangcheon": { name: "양천구", benefits: [...getSeoulCommon("02-2620-4835")] },
            "yeongdeungpo": { name: "영등포구", benefits: [...getSeoulCommon("02-2670-3351")] },
            "yongsan": { name: "용산구", benefits: [...getSeoulCommon("02-2199-7175"), { title: "출산지원금 (셋째+)", amount: { summary: "200 ~ 400만원", value: { 3: 2000000, 4: 4000000, 5: 4000000 } }, target: "용산구 거주", contact: "02-2199-7175" }] },
            "eunpyeong": { name: "은평구", benefits: [...getSeoulCommon("02-351-6223"), { title: "다자녀 용품 교환권", amount: { display: "서비스 지원 (상품권)" }, target: "은평구 둘째+", contact: "02-351-6223", note: "15만원 상당 이마트/롯데마트 상품권" }] },
            "jongno": { name: "종로구", benefits: [...getSeoulCommon("02-2148-5824"), { title: "건강보험료 지원", amount: { display: "서비스 지원 (보험)" }, target: "종로구 10개월 거주 셋째+", contact: "02-2148-5824" }] },
            "junggu": { name: "중구", benefits: [...getSeoulCommon("02-3396-5434"), { title: "출산양육지원금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 10000000 } }, target: "중구 12개월 거주", contact: "02-3396-5434" }] },
            "jungnang": { name: "중랑구", benefits: [...getSeoulCommon("02-2094-1792")] }
        }
    },
    "gangwon": {
        name: "강원특별자치도",
        districts: {
            "gangneung": { name: "강릉시", benefits: [...getGangwonCommon("033-640-5997"), { title: "출산지원금", amount: { summary: "30 ~ 100만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "강릉시 거주", contact: "033-640-5997" }] },
            "goseong": { name: "고성군", benefits: [...getGangwonCommon("033-680-3447"), { title: "출산장려금", amount: { summary: "140만원(첫째)", value: { 1: 1400000 } }, target: "고성군 3개월 거주", contact: "033-680-3447" }] },
            "donghae": { name: "동해시", benefits: [...getGangwonCommon("033-530-2176"), { title: "출산장려금", amount: { summary: "60 ~ 180만원", value: { 1: 600000, 2: 1200000, 3: 1800000, 4: 1800000, 5: 1800000 } }, target: "동해시 거주", contact: "033-530-2176" }, { title: "산후조리비 지원", amount: 500000, target: "6개월 이상 거주", method: "보건소", contact: "033-530-2176", note: "지역화폐 지급" }] },
            "samcheok": { name: "삼척시", benefits: [...getGangwonCommon("033-570-4631"), { title: "출산지원금", amount: { summary: "100 ~ 200만원", value: { 1: 1000000, 2: 1500000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "삼척시 거주", contact: "033-570-4631", note: "2년 거주 유지 시 100% 추가 지급" }, { title: "공공산후조리원 지원", amount: { display: "서비스 지원 (감면)" }, target: "1년 이상 거주자", contact: "033-570-4631", note: "최대 180만원 감면" }] },
            "sokcho": { name: "속초시", benefits: [...getGangwonCommon("033-639-2136"), { title: "출산장려금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 700000, 3: 1000000, 4: 2000000, 5: 2000000 } }, target: "속초시 6개월 거주", contact: "033-639-2136" }, { title: "속초둥이 탄생축하 메시지", amount: { display: "서비스 지원 (기념)" }, target: "속초시 가정", contact: "033-639-2136", note: "시정소식지 게재" }] },
            "yanggu": { name: "양구군", benefits: [...getGangwonCommon("033-480-2811"), { title: "출산장려금", amount: { summary: "100 ~ 300만원+", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 5000000 } }, target: "양구군 6개월 거주", contact: "033-480-2811" }, { title: "백자 태항아리 지원", amount: { display: "서비스 지원 (물품)" }, target: "장려금 대상자", contact: "033-480-2811", note: "양구 백자 제작 항아리" }, { title: "메아리 게재 및 케이크", amount: { display: "서비스 지원 (교환권)" }, target: "신청자 전원", contact: "033-480-2811", note: "사진 게재 및 3만원 케이크권" }] },
            "yangyang": { name: "양양군", benefits: [...getGangwonCommon("033-670-2559"), { title: "출산축하금", amount: 1000000, target: "양양군 1년 거주", contact: "033-670-2559" }, { title: "장려금(셋째+)", amount: { summary: "720~1800만원", value: { 3: 7200000, 4: 18000000, 5: 18000000 } }, target: "양양군 거주 셋째+", contact: "033-670-2559" }] },
            "yeongwol": { name: "영월군", benefits: [...getGangwonCommon("033-370-5451"), { title: "출산장려금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 3000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "영월군 6개월 거주", contact: "033-370-5451" }, { title: "출산축하꾸러미", amount: { display: "서비스 지원 (물품)" }, target: "출생아 가정", contact: "033-370-5451", note: "10만원 상당 (소고기, 미역 등)" }] },
            "wonju": { name: "원주시", benefits: [...getGangwonCommon("033-737-2583"), { title: "출생축하금", amount: { summary: "30 ~ 100만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "원주시 거주", contact: "033-737-2583" }, { title: "지역 농축산물 지급", amount: { display: "서비스 지원 (물품)" }, target: "원주시 출생신고 가정", contact: "033-737-2583", note: "토토미, 한우, 미역 등" }, { title: "원주아이 행복 청약통장", amount: { display: "서비스 지원 (현금)" }, target: "원주시 가정", contact: "033-737-2583", note: "청약 통장 개설 시 5만원 지원" }] },
            "inje": { name: "인제군", benefits: [...getGangwonCommon("033-460-2540"), { title: "출산장려금", amount: { summary: "200 ~ 700만원", value: { 1: 2000000, 2: 2000000, 3: 2000000, 4: 7000000, 5: 7000000 } }, target: "인제군 6개월 거주", contact: "033-460-2540" }, { title: "산후조리비 지원", amount: 500000, target: "6개월 이상 거주", method: "보건소", contact: "033-460-2540" }] },
            "jeongseon": { name: "정선군", benefits: [...getGangwonCommon("033-560-2973"), { title: "출생아 양육비", amount: { summary: "120 ~ 1440만원", value: { 1: 1200000, 2: 1200000, 3: 14400000, 4: 14400000, 5: 14400000 } }, target: "정선군 거주", contact: "033-560-2973" }, { title: "출산용품 지원", amount: { display: "서비스 지원 (물품)" }, target: "정선군 출생아", contact: "033-560-2973", note: "10~30만원 상당 차등 지원" }] },
            "cheorwon": { name: "철원군", benefits: [...getGangwonCommon("033-450-5764"), { title: "출산장려금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 1500000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "철원군 3개월 거주", contact: "033-450-5764" }, { title: "첫돌축하금", amount: { summary: "20 ~ 50만원", value: { 1: 200000, 2: 300000, 3: 500000, 4: 500000, 5: 500000 } }, target: "첫돌 맞이 아동", contact: "033-450-5764" }] },
            "chuncheon": { name: "춘천시", benefits: [...getGangwonCommon("033-250-4424"), { title: "출산장려금", amount: { summary: "50 ~ 100만원", value: { 1: 500000, 2: 700000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "춘천시 6개월 거주", contact: "033-250-4424" }] },
            "taebaek": { name: "태백시", benefits: [...getGangwonCommon("033-550-3033"), { title: "출산장려금", amount: { summary: "50 ~ 360만원", value: { 1: 500000, 2: 1000000, 3: 3600000, 4: 3600000, 5: 3600000 } }, target: "태백시 1년 거주", contact: "033-550-3033" }, { title: "산후 건강관리비", amount: 500000, target: "1년 이상 거주", method: "보건소", contact: "033-550-3033" }] },
            "pyeongchang": { name: "평창군", benefits: [...getGangwonCommon("033-330-4848"), { title: "출산축하금", amount: { summary: "100 ~ 200만원", value: { 1: 1000000, 2: 2000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "평창군 1년 거주", contact: "033-330-4848" }, { title: "출산건강관리비", amount: 500000, target: "1년 이상 거주", method: "보건소", contact: "033-330-4848" }, { title: "출생아 건강보험료", amount: { display: "서비스 지원 (보험)" }, target: "평창군 출생아", contact: "033-330-4848", note: "월 3만원 이내 (5년 납입)" }] },
            "hongcheon": { name: "홍천군", benefits: [...getGangwonCommon("033-430-2148"), { title: "출산장려금", amount: { summary: "200 ~ 600만원", value: { 1: 2000000, 2: 3000000, 3: 6000000, 4: 6000000, 5: 6000000 } }, target: "홍천군 1년 거주", contact: "033-430-2148" }, { title: "출산축하물품", amount: { display: "서비스 지원 (물품)" }, target: "홍천군 가정", contact: "033-430-2148", note: "아기띠, 체온계 등" }, { title: "산후 영양제 지원", amount: { display: "서비스 지원 (영양제)" }, target: "홍천군 산모", contact: "033-430-2148", note: "2개월분 지급" }] },
            "hwacheon": { name: "화천군", benefits: [...getGangwonCommon("033-440-2345"), { title: "출산지원 정보", amount: "문의 필요", target: "화천 거주", contact: "033-440-2345" }] },
            "hoengseong": { name: "횡성군", benefits: [...getGangwonCommon("033-340-5674"), { title: "출산지원금", amount: { summary: "20 ~ 1080만원", value: { 1: 200000, 2: 1000000, 3: 10800000, 4: 10800000, 5: 10800000 } }, target: "횡성군 1년 거주", contact: "033-340-5674" }, { title: "산후관리비", amount: 2000000, target: "1년 이상 거주", method: "보건소", contact: "033-340-5674" }] }
        }
    },
    "gyeonggi": {
        name: "경기도",
        districts: {
            "gapyeong": { name: "가평군", benefits: [...getGyeonggiCommon("031-580-2114"), { title: "출산축하금", amount: { summary: "100 ~ 2000만원", value: { 1: 1000000, 2: 4000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "가평군 6개월 거주", contact: "031-580-2114" }, { title: "축하목(나무) 지원", amount: { display: "서비스 지원 (현물)" }, target: "출산 가구", contact: "031-580-2114", note: "10만원 상당 묘목/화분" }] },
            "goyang": { name: "고양시", benefits: [...getGyeonggiCommon("031-8075-3327"), { title: "출산지원금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 10000000 } }, target: "고양시 1년 거주", contact: "031-8075-3327" }, { title: "탄생축하 쌀 케이크", amount: { display: "서비스 지원 (현물)" }, target: "출산가정", contact: "031-8075-3327" }, { title: "다복꾸러미", amount: { display: "서비스 지원 (용품)" }, target: "출산가정", contact: "031-8075-3327" }] },
            "gwacheon": { name: "과천시", benefits: [...getGyeonggiCommon("02-3677-2259"), { title: "출산·입양 장려금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 1500000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "과천시 거주", contact: "02-3677-2259" }, { title: "임신축하금", amount: 200000, target: "임신부", method: "보건소", contact: "02-3677-2259" }, { title: "출산축하용품", amount: { display: "서비스 지원 (용품)" }, target: "출생아", contact: "02-3677-2259", note: "20만원 상당 용품 4종 중 택1" }] },
            "gwangmyeong": { name: "광명시", benefits: [...getGyeonggiCommon("02-2680-5257"), { title: "출산축하금", amount: 700000, target: "광명시 거주", contact: "02-2680-5257" }, { title: "아이조아 붕붕카", amount: { display: "서비스 지원 (이용권)" }, target: "임산부/영유아", contact: "02-2680-5257", note: "전용 택시 연 15회" }, { title: "종량제봉투 지원", amount: { display: "서비스 지원 (물품)" }, target: "출산가정", contact: "02-2680-5257", note: "20L 100매" }] },
            "gwangju": { name: "광주시", benefits: [...getGyeonggiCommon("031-760-2848"), { title: "출산장려금", amount: 1000000, target: "광주시 180일 거주", contact: "031-760-2848" }] },
            "guri": { name: "구리시", benefits: [...getGyeonggiCommon("031-550-8668"), { title: "출산지원금", amount: { summary: "50 ~ 300만원", value: { 1: 500000, 2: 1000000, 3: 2000000, 4: 3000000, 5: 3000000 } }, target: "구리시 거주", contact: "031-550-8668" }] },
            "gunpo": { name: "군포시", benefits: [...getGyeonggiCommon("031-390-0807"), { title: "출산장려금", amount: { summary: "100 ~ 700만원", value: { 1: 1000000, 2: 3000000, 3: 5000000, 4: 7000000, 5: 7000000 } }, target: "군포시 6개월 거주", contact: "031-390-0807" }] },
            "gimpo": { name: "김포시", benefits: [...getGyeonggiCommon("031-5186-4155"), { title: "출산축하금", amount: { summary: "둘째 이상 100만원", value: { 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "김포시 180일 거주", contact: "031-5186-4155" }] },
            "namyangju": { name: "남양주시", benefits: [...getGyeonggiCommon("031-590-4476"), { title: "출산장려금", amount: 1000000, target: "남양주시 거주", contact: "031-590-4476" }, { title: "유축기 대여", amount: { display: "서비스 지원 (대여)" }, target: "출산가정", contact: "031-590-4476", note: "2개월 대여" }] },
            "dongducheon": { name: "동두천시", benefits: [...getGyeonggiCommon("031-860-2263"), { title: "출산장려금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 1500000, 3: 2500000, 4: 5000000, 5: 5000000 } }, target: "동두천시 1년 거주", contact: "031-860-2263" }, { title: "산후조리비(동두천)", amount: 1000000, target: "동두천시 1년 거주", contact: "031-860-2263" }, { title: "출산/돌 축하용품", amount: { display: "서비스 지원 (용품)" }, target: "출산가정", contact: "031-860-2263", note: "라라스베개, 식기세트 등" }] },
            "bucheon": { name: "부천시", benefits: [...getGyeonggiCommon("032-625-2933"), { title: "출산장려금 (넷째+)", amount: { summary: "800만원", value: { 4: 8000000, 5: 8000000 } }, target: "부천시 1년 거주", contact: "032-625-2933" }] },
            "seongnam": { name: "성남시", benefits: [...getGyeonggiCommon("031-729-2915"), { title: "출산장려금", amount: { summary: "30 ~ 300만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 2000000, 5: 3000000 } }, target: "성남시 180일 거주", contact: "031-729-2915" }, { title: "다자녀 안심보험", amount: { display: "서비스 지원 (보험)" }, target: "성남시 셋째+", contact: "031-729-2915" }] },
            "suwon": { name: "수원시", benefits: [...getGyeonggiCommon("031-228-3220"), { title: "출산지원금", amount: { summary: "둘째+ 50~1000만원", value: { 2: 500000, 3: 2000000, 4: 5000000, 5: 10000000 } }, target: "수원시 180일 거주", contact: "031-228-3220" }] },
            "siheung": { name: "시흥시", benefits: [...getGyeonggiCommon("031-310-5887"), { title: "출생축하금", amount: { summary: "둘째+ 50~800만원", value: { 2: 500000, 3: 1000000, 4: 8000000, 5: 8000000 } }, target: "시흥시 180일 거주", contact: "031-310-5887" }] },
            "ansan": { name: "안산시", benefits: [...getGyeonggiCommon("031-481-2604"), { title: "출생축하금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 3000000, 3: 5000000, 4: 5000000, 5: 5000000 } }, target: "안산시 12개월 거주", contact: "031-481-2604" }] },
            "anseong": { name: "안성시", benefits: [...getGyeonggiCommon("031-678-2234"), { title: "출산장려금", amount: { summary: "둘째+ 100만원", value: { 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "안성시 180일 거주", contact: "031-678-2234" }, { title: "출생축하선물", amount: { display: "서비스 지원 (용품)" }, target: "안성시 출생아", contact: "031-678-2234" }] },
            "anyang": { name: "안양시", benefits: [...getGyeonggiCommon("031-8045-4969"), { title: "출산지원금", amount: { summary: "200 ~ 1000만원", value: { 1: 2000000, 2: 4000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "안양시 12개월 거주", contact: "031-8045-4969" }, { title: "유축기 대여", amount: { display: "서비스 지원 (대여)" }, target: "안양시 가정", contact: "031-8045-4969", note: "2주간 대여" }] },
            "yangju": { name: "양주시", benefits: [...getGyeonggiCommon("031-8082-5831"), { title: "출산축하금 (넷째+)", amount: { summary: "넷째 200만, 다섯째 700만", value: { 4: 2000000, 5: 7000000 } }, target: "양주시 1년 거주", contact: "031-8082-5831" }, { title: "종량제 봉투 지원", amount: { display: "서비스 지원 (물품)" }, target: "양주시 가정", contact: "031-8082-5831", note: "1,000리터 지급" }, { title: "유축기 대여", amount: { display: "서비스 지원 (대여)" }, target: "양주시 가정", contact: "031-8082-5831", note: "2개월 대여" }] },
            "yangpyeong": { name: "양평군", benefits: [...getGyeonggiCommon("031-770-3538"), { title: "출산장려금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 5000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "양평군 6개월 거주", contact: "031-770-3538" }] },
            "yeoju": { name: "여주시", benefits: [...getGyeonggiCommon("031-887-3613"), { title: "출산장려금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 5000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "여주시 180일 거주", contact: "031-887-3613" }, { title: "여주 산후조리비", amount: 1000000, target: "6개월 거주", method: "보건소", contact: "031-887-3613" }] },
            "yeoncheon": { name: "연천군", benefits: [...getGyeonggiCommon("031-839-2265"), { title: "출산축하금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 3000000, 3: 5000000, 4: 10000000, 5: 10000000 } }, target: "연천군 180일 거주", contact: "031-839-2265" }, { title: "신생아 출산용품", amount: { display: "서비스 지원 (용품)" }, target: "연천군 출생아", contact: "031-839-2265" }] },
            "osan": { name: "오산시", benefits: [...getGyeonggiCommon("031-8036-7487"), { title: "출산장려금", amount: { summary: "20 ~ 600만원", value: { 1: 200000, 2: 500000, 3: 3000000, 4: 6000000, 5: 6000000 } }, target: "오산시 6개월 거주", contact: "031-8036-7487" }, { title: "출산축하용품비", amount: { display: "서비스 지원 (지역화폐)" }, target: "오산시 가정", contact: "031-8036-7487", note: "10만원 (오색전)" }] },
            "yongin": { name: "용인시", benefits: [...getGyeonggiCommon("031-324-2114"), { title: "출산지원금", amount: { summary: "30 ~ 300만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 2000000, 5: 3000000 } }, target: "용인시 180일 거주", contact: "031-324-2114" }, { title: "출산용품 지원", amount: { display: "서비스 지원 (포인트)" }, target: "용인시 1년내 신청", contact: "031-324-2114", note: "15만 포인트 (아이조아용)" }] },
            "uiwang": { name: "의왕시", benefits: [...getGyeonggiCommon("031-345-3592"), { title: "출산장려금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "의왕시 6개월 거주", contact: "031-345-3592" }, { title: "의왕 산후조리비", amount: 500000, target: "거주 산모", method: "보건소", contact: "031-345-3592" }] },
            "uijeongbu": { name: "의정부시", benefits: [...getGyeonggiCommon("031-828-4244"), { title: "출산장려금", amount: { summary: "30 ~ 100만원", value: { 1: 300000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "의정부 거주", contact: "031-828-4244" }] },
            "icheon": { name: "이천시", benefits: [...getGyeonggiCommon("031-645-3375"), { title: "출산축하금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "이천시 6개월 거주", contact: "031-645-3375" }] },
            "paju": { name: "파주시", benefits: [...getGyeonggiCommon("031-940-4422"), { title: "출생축하금", amount: { summary: "100 ~ 300만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 3000000, 5: 3000000 } }, target: "거주 출생아", contact: "031-940-4422" }] },
            "pyeongtaek": { name: "평택시", benefits: [...getGyeonggiCommon("031-8024-4357"), { title: "출산축하금", amount: { summary: "50 ~ 500만원", value: { 1: 500000, 2: 1200000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "평택시 1년 거주", contact: "031-8024-4357" }] },
            "pocheon": { name: "포천시", benefits: [...getGyeonggiCommon("031-538-3238"), { title: "출산축하금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 3000000, 3: 5000000, 4: 10000000, 5: 10000000 } }, target: "포천시 1년 거주", contact: "031-538-3238" }] },
            "hanam": { name: "하남시", benefits: [...getGyeonggiCommon("031-790-6552"), { title: "출산장려금", amount: { summary: "50 ~ 2000만원", value: { 1: 500000, 2: 1000000, 3: 2000000, 4: 10000000, 5: 20000000 } }, target: "하남시 6개월 거주", contact: "031-790-6552" }] },
            "hwaseong": { name: "화성시", benefits: [...getGyeonggiCommon("031-5189-1337"), { title: "출산지원금", amount: { summary: "100 ~ 300만원", value: { 1: 1000000, 2: 2000000, 3: 2000000, 4: 3000000, 5: 3000000 } }, target: "화성시 180일 거주", contact: "031-5189-1337" }] }
        }
    },
    "chungbuk": {
        name: "충청북도",
        districts: {
            "goesan": { name: "괴산군", benefits: [...getChungbukCommon(), { title: "출산장려금 (셋째+)", amount: { summary: "3,800만원", value: { 3: 38000000, 4: 38000000, 5: 38000000 } }, target: "괴산군 12개월 전 거주", contact: "043-830-2356" }] },
            "danyang": { name: "단양군", benefits: [...getChungbukCommon(), { title: "출산장려지원금", amount: { summary: "120 ~ 240만원", value: { 2: 1200000, 3: 2400000, 4: 2400000, 5: 2400000 } }, target: "단양군 관내 거주", contact: "043-420-3253" }] },
            "boeun": { name: "보은군", benefits: [...getChungbukCommon(), { title: "출산축하금", amount: 1000000, target: "보은군 6개월 전 거주", contact: "043-540-5615" }] },
            "yeongdong": { name: "영동군", benefits: [...getChungbukCommon(), { title: "출산장려금", amount: { summary: "350 ~ 1000만원", value: { 1: 3500000, 2: 6000000, 3: 7000000, 4: 10000000, 5: 10000000 } }, target: "영동군 3개월 전 거주", contact: "043-740-5933" }] },
            "okcheon": { name: "옥천군", benefits: [...getChungbukCommon(), { title: "출산용품 지원", amount: { display: "서비스 지원 (바우처)" }, target: "옥천군 출생아 가정", contact: "043-730-2152", note: "10만원 상당" }] },
            "eumseong": { name: "음성군", benefits: [...getChungbukCommon(), { title: "출산장려금 (셋째+)", amount: "차등 지급", target: "음성군 3개월 거주", contact: "043-871-2133" }] },
            "jecheon": { name: "제천시", benefits: [...getChungbukCommon(), { title: "제천시 산후조리비", amount: 500000, target: "제천시 관내 거주", contact: "043-646-2720" }] },
            "jincheon": { name: "진천군", benefits: [...getChungbukCommon(), { title: "출산장려금 (셋째+)", amount: { summary: "40 ~ 800만원", value: { 3: 400000, 4: 3000000, 5: 8000000 } }, target: "진천군 3개월 거주", contact: "043-539-7363" }] },
            "cheongju": { name: "청주시", benefits: [...getChungbukCommon()] },
            "chungju": { name: "충주시", benefits: [...getChungbukCommon(), { title: "다태아 장려금", amount: { summary: "200~300만", value: { 2: 2000000, 3: 3000000, 4: 3000000, 5: 3000000 } }, target: "충주시 12개월 거주", contact: "043-850-3548" }, { title: "유축기 대여", amount: { display: "서비스 지원 (대여)" }, target: "충주시 가정", contact: "043-850-3548", note: "4주간 대여" }, { title: "읍면별 자체 지원", amount: { display: "서비스 지원 (용품)" }, target: "해당 면 거주", contact: "해당 면사무소", note: "10~30만원 상당 용품" }] },
            "jeungpyeong": { name: "증평군", benefits: [...getChungbukCommon()] }
        }
    },
    "chungnam": {
        name: "충청남도",
        districts: {
            "gyeryong": { name: "계룡시", benefits: [...getChungnamCommon(), { title: "출산장려금", amount: { summary: "50 ~ 300만원", value: { 1: 500000, 2: 1000000, 3: 3000000, 4: 3000000, 5: 3000000 } }, target: "계룡시 1년 전 거주", contact: "042-840-3570" }] },
            "gongju": { name: "공주시", benefits: [...getChungnamCommon(), { title: "공주시 장려금", amount: "300 ~ 1000만원", target: "공주시 1년 이상 거주", contact: "041-840-2581" }, { title: "출산축하선물", amount: { display: "서비스 지원 (현물+상품권)" }, target: "출산가정", contact: "041-840-2581", note: "상품권 10만 + 용품 10만" }] },
            "geumsan": { name: "금산군", benefits: [...getChungnamCommon(), { title: "출산지원금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 7000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "금산군 1년 거주", contact: "041-750-4382" }] },
            "nonsan": { name: "논산시", benefits: [...getChungnamCommon(), { title: "출산지원금", amount: { summary: "100 ~ 700만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 7000000 } }, target: "논산시 3개월 전 거주", contact: "041-746-8063" }, { title: "축하용품비", amount: { display: "서비스 지원 (바우처)" }, target: "출산가정", contact: "041-746-8063", note: "20만원 바우처" }] },
            "dangjin": { name: "당진시", benefits: [...getChungnamCommon(), { title: "출산지원금", amount: { summary: "50 ~ 1000만원", value: { 1: 500000, 2: 1000000, 3: 5000000, 4: 10000000, 5: 10000000 } }, target: "당진시 거주 확인", contact: "041-350-3236" }] },
            "boryeong": { name: "보령시", benefits: [...getChungnamCommon(), { title: "보령시 지원금", amount: { summary: "100 ~ 3000만원", value: { 1: 1000000, 2: 3000000, 3: 5000000, 4: 15000000, 5: 30000000 } }, target: "보령시 관내 거주", contact: "041-930-6863" }] },
            "buyeo": { name: "부여군", benefits: [...getChungnamCommon(), { title: "출산장려금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 2000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "부여군 관내 거주", contact: "041-830-2483" }, { title: "출산 축하물품", amount: { display: "서비스 지원 (현물)" }, target: "부여군 6개월 거주", contact: "041-830-2483", note: "소고기, 미역, 아기내복 등" }] },
            "seosan": { name: "서산시", benefits: [...getChungnamCommon(), { title: "출산지원금", amount: { summary: "50 ~ 1000만원", value: { 1: 500000, 2: 1000000, 3: 5000000, 4: 10000000, 5: 10000000 } }, target: "서산시 관내 거주", contact: "041-660-2149" }, { title: "출산용품 지원", amount: { display: "서비스 지원 (상품권)" }, target: "서산시 가정", contact: "041-660-2149", note: "10만원 상당 모바일 상품권" }] },
            "seocheon": { name: "서천군", benefits: [...getChungnamCommon(), { title: "출생지원금", amount: { summary: "500 ~ 3000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 30000000 } }, target: "서천군 6개월 전 거주", contact: "041-950-4086" }] },
            "asan": { name: "아산시", benefits: [...getChungnamCommon(), { title: "아산시 출생축하금", amount: { summary: "50 ~ 100만원", value: { 1: 500000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "아산시 6개월 거주", contact: "041-540-2069" }, { title: "산후관리비", amount: 1000000, target: "산모", contact: "041-540-2069" }] },
            "yesan": { name: "예산군", benefits: [...getChungnamCommon(), { title: "예산군 지원금", amount: { summary: "500 ~ 3000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 30000000 } }, target: "예산군 6개월 전 거주", contact: "041-339-6041" }, { title: "출산축하바구니", amount: { display: "서비스 지원 (현물+상품권)" }, target: "예산군 가정", contact: "041-339-6041", note: "20만원 상당 용품+상품권" }, { title: "아기탄생 기념사진", amount: { display: "서비스 지원 (촬영권)" }, target: "예산군 가정", contact: "041-339-6041", note: "30만원 상당 촬영권" }, { title: "출산여성 운동비", amount: { display: "서비스 지원 (운동비)" }, target: "예산군 산모", contact: "041-339-6041", note: "3개월간 월 최대 10만원" }] },
            "cheonan": { name: "천안시", benefits: [...getChungnamCommon(), { title: "출생축하금", amount: { summary: "30 ~ 100만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "천안시 6개월 거주", contact: "041-521-5374" }, { title: "출생축하용품", amount: { display: "서비스 지원 (물품)" }, target: "천안시 가정", contact: "041-521-5374" }] },
            "cheongyang": { name: "청양군", benefits: [...getChungnamCommon(), { title: "출산장려금", amount: { summary: "500 ~ 3000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 30000000 } }, target: "청양군 1년 거주", contact: "041-940-4535" }, { title: "산후건강관리비", amount: 800000, target: "1년 거주", contact: "041-940-4535" }] },
            "taean": { name: "태안군", benefits: [...getChungnamCommon(), { title: "출산장려금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 1000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "태안군 6개월 거주", contact: "041-670-6115" }] },
            "hongseong": { name: "홍성군", benefits: [...getChungnamCommon(), { title: "홍성군 출산축하금", amount: { summary: "500 ~ 3000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 30000000 } }, target: "홍성군 관내 거주", contact: "041-630-9000" }] }
        }
    },
    "jeonbuk": {
        name: "전북특별자치도",
        districts: {
            "gochang": { name: "고창군", benefits: [{ title: "출산장려금", amount: { summary: "300 ~ 2000만원", value: { 1: 3000000, 2: 5000000, 3: 10000000, 4: 15000000, 5: 20000000 } }, target: "고창군 1년 거주", contact: "063-560-8573" }, { title: "산후조리비 지원", amount: 2000000, target: "1년 거주 산모", method: "보건소", contact: "063-560-8573" }] },
            "gunsan": { name: "군산시", benefits: [{ title: "군산시 출산지원금", amount: { summary: "100 ~ 1500만원", value: { 1: 1000000, 2: 2000000, 3: 4000000, 4: 6000000, 5: 15000000 } }, target: "군산시 1년 거주", contact: "063-454-3254" }, { title: "육아용품 구입비", amount: { display: "서비스 지원 (현금)" }, target: "군산시 셋째+", contact: "063-454-3254", note: "25만원 지원" }] },
            "gimje": { name: "김제시", benefits: [{ title: "장려금(첫만남포함)", amount: { summary: "1000 ~ 2100만원", value: { 1: 10000000, 2: 13000000, 3: 18000000, 4: 20000000, 5: 21000000 } }, target: "김제시 1년 전 거주", contact: "063-540-1321" }, { title: "출산축하용품(마더박스)", amount: { display: "서비스 지원 (물품+상품권)" }, target: "김제시 가정", contact: "063-540-1321", note: "마더박스, 상품권 25만, 도장" }] },
            "namwon": { name: "남원시", benefits: [{ title: "축하금", amount: { summary: "200 ~ 2000만원", value: { 1: 2000000, 2: 5000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "남원시 1년 거주", contact: "063-620-7782" }, { title: "출생축하용품/기념품", amount: { display: "서비스 지원 (물품/기념품)" }, target: "남원시 가정", contact: "063-620-7782", note: "10만원 상당 용품 + 도장 등" }, { title: "다자녀 육아용품", amount: { display: "서비스 지원 (현금)" }, target: "남원시 셋째+", contact: "063-620-7782", note: "25만원 지원" }] },
            "muju": { name: "무주군", benefits: [{ title: "장려금", amount: { summary: "400 ~ 1000만원", value: { 1: 4000000, 2: 6000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "무주군 1년 거주", contact: "063-320-8410" }] },
            "buan": { name: "부안군", benefits: [{ title: "축하금", amount: { summary: "300 ~ 1000만원", value: { 1: 3000000, 2: 5000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "부안군 관내 거주", contact: "063-580-3797" }, { title: "넷째 이상 출생용품비", amount: { display: "서비스 지원 (물품)" }, target: "부안군 넷째+", contact: "063-580-3797", note: "400만원 상당 (분할)" }] },
            "sunchang": { name: "순창군", benefits: [{ title: "장려금", amount: { summary: "300 ~ 1500만원", value: { 1: 3000000, 2: 4600000, 3: 10000000, 4: 15000000, 5: 15000000 } }, target: "순창군 관내 거주", contact: "063-650-5212" }] },
            "wanju": { name: "완주군", benefits: [{ title: "장려금", amount: { summary: "20 ~ 600만원", value: { 1: 2000000, 2: 3000000, 3: 6000000, 4: 6000000, 5: 6000000 } }, target: "완주군 1년 전 거주", contact: "063-290-3023" }, { title: "출산축하용품", amount: { display: "서비스 지원 (현물)" }, target: "완주군 가정", contact: "063-290-3023", note: "소고기, 산모미역 택배" }] },
            "iksan": { name: "익산시", benefits: [{ title: "장려금", amount: { summary: "100 ~ 500만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 5000000 } }, target: "익산시 1년 거주", contact: "063-859-5331" }] },
            "imsil": { name: "임실군", benefits: [{ title: "장려금", amount: { summary: "300 ~ 500만원", value: { 1: 3000000, 2: 5000000, 3: 5000000, 4: 5000000, 5: 5000000 } }, target: "임실군 1년 전 거주", contact: "063-640-4664" }, { title: "산후조리비 지원", amount: 500000, target: "관내 거주", contact: "063-640-4664" }] },
            "jangsu": { name: "장수군", benefits: [{ title: "장려금", amount: { summary: "500 ~ 1200만원", value: { 1: 5000000, 2: 7000000, 3: 10000000, 4: 12000000, 5: 12000000 } }, target: "장수군 1년 거주", contact: "063-350-2983" }] },
            "jeonju": { name: "전주시", benefits: [{ title: "축하금", amount: { summary: "30 ~ 100만원", value: { 1: 300000, 2: 500000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "전주시 거주", contact: "063-281-5039" }, { title: "종량제 봉투 지원", amount: { display: "서비스 지원 (물품)" }, target: "전주시 출생신고 가정", contact: "063-281-5039", note: "1인당 10L 100매" }, { title: "육아용품 구입비(셋째+)", amount: { display: "서비스 지원 (실비)" }, target: "전주시 셋째+", contact: "063-281-5039", note: "최대 25만원 실비" }] },
            "jeongeup": { name: "정읍시", benefits: [{ title: "축하금", amount: { summary: "200 ~ 1000만원", value: { 1: 2000000, 2: 3000000, 3: 5000000, 4: 10000000, 5: 10000000 } }, target: "정읍시 1년 전 거주", contact: "063-539-6113" }] },
            "jinan": { name: "진안군", benefits: [{ title: "장려금", amount: { summary: "300 ~ 1000만원", value: { 1: 3000000, 2: 5000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "진안군 1년 전 거주", contact: "063-430-8539" }, { title: "임신축하금", amount: 1000000, target: "임신 20주 이상", contact: "063-430-8539" }] }
        }
    },
    "jeonnam": {
        name: "전라남도",
        districts: {
            "gangjin": { name: "강진군", benefits: [...getJeonnamCommon("061-430-5216"), { title: "공공조리원 이용료 지원", amount: { display: "서비스 지원 (감면)" }, target: "강진군 거주자", contact: "061-430-5216", note: "2주 이용료 전액 감면 (최대 154만원)" }] },
            "goheung": { name: "고흥군", benefits: [...getJeonnamCommon("061-830-5664"), { title: "장려금", amount: { summary: "720 ~ 1440만원", value: { 1: 7200000, 2: 10800000, 3: 14400000, 4: 14400000, 5: 14400000 } }, target: "고흥군 거주", contact: "061-830-5664" }, { title: "축복꾸러미", amount: { display: "서비스 지원 (물품+상품권)" }, target: "고흥군 가정", contact: "061-830-5664", note: "미역, 소고기, 쌀 + 10만원권" }, { title: "백일사진 촬영비", amount: { display: "서비스 지원 (촬영권)" }, target: "고흥군 가정", contact: "061-830-5664", note: "20만원 상당" }] },
            "gokseong": { name: "곡성군", benefits: [...getJeonnamCommon("061-360-8952"), { title: "양육지원금", amount: { summary: "400 ~ 700만원", value: { 1: 4000000, 2: 4000000, 3: 5000000, 4: 7000000, 5: 7000000 } }, target: "곡성군 1년 거주", contact: "061-360-8952" }] },
            "gwangyang": { name: "광양시", benefits: [...getJeonnamCommon("061-797-4758"), { title: "축하금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 5000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "광양시 신고", contact: "061-797-4758" }, { title: "다둥이 육아용품비", amount: { display: "서비스 지원 (현금)" }, target: "광양시 셋째+", contact: "061-797-4758", note: "50만원 지원" }] },
            "gurye": { name: "구례군", benefits: [...getJeonnamCommon("061-780-2651"), { title: "양육비", amount: { summary: "300 ~ 750만원", value: { 1: 3000000, 2: 5000000, 3: 7500000, 4: 7500000, 5: 7500000 } }, target: "구례군 거주", contact: "061-780-2651" }] },
            "naju": { name: "나주시", benefits: [...getJeonnamCommon("061-339-2129"), { title: "장려금", amount: { summary: "100 ~ 300만원", value: { 1: 1000000, 2: 1000000, 3: 3000000, 4: 3000000, 5: 3000000 } }, target: "나주시 6개월 거주", contact: "061-339-2129" }, { title: "출산축하용품 꾸러미", amount: { display: "서비스 지원 (물품)" }, target: "나주시 출생아", contact: "061-339-2129", note: "10만원 상당 (체온계, 로션 등)" }] },
            "damyang": { name: "담양군", benefits: [...getJeonnamCommon("061-380-3976"), { title: "장려금", amount: { summary: "130 ~ 1500만원", value: { 1: 1300000, 2: 2200000, 3: 10000000, 4: 15000000, 5: 15000000 } }, target: "담양군 1년 거주", contact: "061-380-3976" }] },
            "mokpo": { name: "목포시", benefits: [...getJeonnamCommon("061-270-8132"), { title: "축하금", amount: { summary: "150 ~ 550만원", value: { 1: 1500000, 2: 2500000, 3: 3500000, 4: 4500000, 5: 5500000 } }, target: "목포 거주", contact: "061-270-8132" }] },
            "muan": { name: "무안군", benefits: [...getJeonnamCommon("061-450-5030"), { title: "양육지원금", amount: { summary: "150 ~ 2000만원", value: { 1: 1500000, 2: 2000000, 3: 10000000, 4: 20000000, 5: 20000000 } }, target: "무안군 관내 거주", contact: "061-450-5030" }, { title: "마더박스", amount: { display: "서비스 지원 (물품)" }, target: "무안군 가정", contact: "061-450-5030", note: "10만원 상당 육아용품" }] },
            "boseong": { name: "보성군", benefits: [...getJeonnamCommon("061-850-5672"), { title: "장려금", amount: { summary: "600 ~ 1080만원", value: { 1: 6000000, 2: 7200000, 3: 10800000, 4: 10800000, 5: 10800000 } }, target: "보성군 거주", contact: "061-850-5672" }, { title: "산후조리비용", amount: 800000, target: "보성군 거주", contact: "061-850-5672", note: "둘째 이상 100만원" }, { title: "아이사랑 마더박스", amount: { display: "서비스 지원 (물품)" }, target: "보성군 가정", contact: "061-850-5672", note: "내의, 목욕용품 등" }, { title: "발도장 액자 제작", amount: { display: "서비스 지원 (기념품)" }, target: "보성군 출생아", contact: "061-850-5672" }] },
            "suncheon": { name: "순천시", benefits: [...getJeonnamCommon("061-749-6898"), { title: "장려금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 20000000 } }, target: "순천시 6개월 거주", contact: "061-749-6898" }, { title: "산후조리비용", amount: 1000000, target: "6개월 거주", contact: "061-749-6898" }, { title: "출산모 비타민D", amount: { display: "서비스 지원 (영양제)" }, target: "관내 분만 산모", contact: "061-749-6898" }] },
            "sinan": { name: "신안군", benefits: [...getJeonnamCommon("061-240-3250"), { title: "장려금", amount: { summary: "240 ~ 970만원", value: { 1: 2400000, 2: 3200000, 3: 6000000, 4: 9700000, 5: 9700000 } }, target: "신안군 계속 거주", contact: "061-240-3250" }] },
            "yeosu": { name: "여수시", benefits: [...getJeonnamCommon("061-659-4262"), { title: "장려금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 10000000, 3: 15000000, 4: 20000000, 5: 20000000 } }, target: "여수시 1년 거주", contact: "061-659-4262" }] },
            "yeonggwang": { name: "영광군", benefits: [...getJeonnamCommon("061-350-4673"), { title: "장려금(최고)", amount: { summary: "500 ~ 3500만원", value: { 1: 5000000, 2: 12000000, 3: 30000000, 4: 30000000, 5: 30000000, 6: 35000000 } }, target: "영광군 거주", contact: "061-350-4673" }] },
            "yeongam": { name: "영암군", benefits: [...getJeonnamCommon("061-470-6538"), { title: "장려금", amount: { summary: "150 ~ 950만원", value: { 1: 1500000, 2: 3500000, 3: 3500000, 4: 3500000, 5: 9500000 } }, target: "영암군 관내 거주", contact: "061-470-6538" }] },
            "wando": { name: "완도군", benefits: [...getJeonnamCommon("061-550-6754"), { title: "장려금", amount: { summary: "100 ~ 2100만원", value: { 1: 1000000, 6: 21000000 } }, target: "완도군 1년 거주", contact: "061-550-6754" }, { title: "출산 전 준비금", amount: 200000, target: "6개월 거주 임산부", contact: "061-550-6754" }] },
            "jangseong": { name: "장성군", benefits: [...getJeonnamCommon("061-390-8387"), { title: "양육비", amount: { summary: "400 ~ 1000만원", value: { 1: 4000000, 2: 6000000, 3: 8000000, 4: 10000000, 5: 10000000 } }, target: "장성군 거주", contact: "061-390-8387" }] },
            "jangheung": { name: "장흥군", benefits: [...getJeonnamCommon("061-860-6241"), { title: "조리비", amount: "최대 100만", target: "장흥군 거주", contact: "061-860-6241" }, { title: "산후도우미 서비스", amount: { display: "서비스 지원 (전액)" }, target: "장흥군 거주", contact: "061-860-6241" }, { title: "탄생 축하용품", amount: { display: "서비스 지원 (물품)" }, target: "장흥군 가정", contact: "061-860-6241", note: "10만원 상당" }, { title: "출산·육아용품 대여", amount: { display: "서비스 지원 (대여)" }, target: "장흥군 가정", contact: "061-860-6241" }] },
            "jindo": { name: "진도군", benefits: [...getJeonnamCommon("061-540-6953"), { title: "장려금", amount: { summary: "1000 ~ 2000만원", value: { 1: 10000000, 2: 10000000, 3: 20000000, 4: 20000000, 5: 20000000 } }, target: "진도군 1년 전 거주", contact: "061-540-6953" }, { title: "출생아 건강보험", amount: { display: "서비스 지원 (보험)" }, target: "진도군 출생아", contact: "061-540-6953", note: "10년 보장 보험 가입" }] },
            "hampyeong": { name: "함평군", benefits: [...getJeonnamCommon("061-320-2438"), { title: "양육지원금", amount: { summary: "300 ~ 1000만원", value: { 1: 3000000, 2: 5000000, 3: 7000000, 4: 10000000, 5: 10000000 } }, target: "함평군 관내 거주", contact: "061-320-2438" }, { title: "출산축하선물", amount: { display: "서비스 지원 (현물)" }, target: "함평군 가정", contact: "061-320-2438", note: "공기청정기, 카시트 등 택1" }, { title: "차량구입비 지원", amount: { display: "서비스 지원 (현금)" }, target: "함평군 넷째+", contact: "061-320-2438", note: "승용차 구입 시 300만원" }, { title: "외식쿠폰/용품대여", amount: { display: "서비스 지원 (쿠폰/대여)" }, target: "함평군 가정", contact: "061-320-2438", note: "5만원 외식쿠폰 / 유모차 등" }] },
            "haenam": { name: "해남군", benefits: [...getJeonnamCommon("061-531-3719"), { title: "양육비", amount: { summary: "320 ~ 740만원", value: { 1: 3200000, 2: 3700000, 3: 6200000, 4: 7400000, 5: 7400000 } }, target: "해남군 관내 거주", contact: "061-531-3719" }, { title: "기저귀 구입비", amount: { monthly: 90000, duration_months: 24, display: "월 9만원 (24개월)" }, target: "해남군 거주", contact: "061-531-3719" }, { title: "신생아 작명 지원", amount: { display: "서비스 지원 (무료)" }, target: "희망자", contact: "061-531-3719" }, { title: "탄생 축하 신문 게재", amount: { display: "서비스 지원 (무료)" }, target: "희망자", contact: "061-531-3719" }] },
            "hwasun": { name: "화순군", benefits: [...getJeonnamCommon("061-379-5982"), { title: "지원금", amount: { summary: "230 ~ 1270만원", value: { 1: 2300000, 2: 3500000, 3: 8100000, 4: 12700000, 5: 12700000 } }, target: "화순군 관내 거주", contact: "061-379-5982" }] }
        }
    },
    "gyeongbuk": {
        name: "경상북도",
        districts: {
            "gyeongsan": { name: "경산시", benefits: [{ title: "출산장려금", amount: { summary: "360 ~ 1200만원", value: { 3: 3600000, 4: 12000000, 5: 12000000 } }, target: "경산시 거주", contact: "053-810-6911" }, { title: "출산축하금", amount: 500000, target: "경산시 전원", contact: "053-810-6911" }, { title: "건강보장보험료", amount: { display: "서비스 지원 (보험)" }, target: "경산시 둘째+", contact: "053-810-6911", note: "월 2만원대 36회 지원" }] },
            "sangju": { name: "상주시", benefits: [{ title: "출산축하 해피박스", amount: { display: "서비스 지원 (물품)" }, target: "상주시 가정", contact: "보건소", note: "특산품, 기저귀 등 세트" }, { title: "출생아 건강보험금", amount: { display: "서비스 지원 (보험)" }, target: "상주시 셋째+", contact: "보건소", note: "월 3만원 이하 5년 납입" }] },
            "andong": { name: "안동시", benefits: [{ title: "아기주민등록증 발급", amount: { display: "서비스 지원 (기념품)" }, target: "안동시 출생 6개월내", contact: "보건소" }] },
            "yeongdeok": { name: "영덕군", benefits: [{ title: "출산장려금", amount: { summary: "480 ~ 720만원", value: { 1: 4800000, 2: 7200000, 3: 7200000, 4: 7200000, 5: 7200000 } }, target: "영덕군 관내 거주", contact: "054-730-6829", note: "월 20만원 분할 지급" }, { title: "출산육아용품 대여", amount: { display: "서비스 지원 (대여)" }, target: "영덕군 가정", contact: "054-730-6829", note: "장난감, 도서, 유축기 무상" }] },
            "yeongyang": { name: "영양군", benefits: [{ title: "다자녀 의료비 지원", amount: { display: "서비스 지원 (실비)" }, target: "영양군 세자녀 이상", contact: "보건소", note: "연간 5만원 진료비 지원" }] },
            "yeongcheon": { name: "영천시", benefits: [{ title: "출산가정 축하용품", amount: { display: "서비스 지원 (물품)" }, target: "영천시 가정", contact: "보건소", note: "월 2회 거주지 배송" }, { title: "육아용품 무료대여", amount: { display: "서비스 지원 (대여)" }, target: "영천시 가정", contact: "보건소", note: "3개월간 대여" }] },
            "yecheon": { name: "예천군", benefits: [{ title: "산모·신생아 식품꾸러미", amount: { display: "서비스 지원 (현물)" }, target: "예천군 셋째+", contact: "보건소", note: "14만원 상당 쇠고기/미역" }, { title: "출생아 건강보험료", amount: { display: "서비스 지원 (보험)" }, target: "예천군 둘째+", contact: "보건소", note: "5년 납입 18세 보장" }] },
            "bonghwa": { name: "봉화군", benefits: [{ title: "세자녀 이상 진료비", amount: { display: "서비스 지원 (실비)" }, target: "봉화군 세자녀 이상", contact: "보건소", note: "연간 5만원 한도" }] },
            "goryeong": { name: "고령군", benefits: [{ title: "가족사진 촬영비", amount: { display: "서비스 지원 (촬영권)" }, target: "고령군 출산가정", contact: "보건소", note: "30만원 상당 액자 제작" }] },
            "uljin": { name: "울진군", benefits: [{ title: "출생축하 기념품", amount: { display: "서비스 지원 (가전)" }, target: "울진군 출생 가정", contact: "보건소", note: "젖병소독기 등 지원" }] },
            "chilgok": { name: "칠곡군", benefits: [{ title: "임신·출산 축하용품", amount: { display: "서비스 지원 (물품)" }, target: "칠곡군 가정", contact: "보건소" }, { title: "육아용품 무료 대여", amount: { display: "서비스 지원 (대여)" }, target: "칠곡군 가정", contact: "보건소", note: "유모차 등 3개월 대여" }] },
            "cheongdo": { name: "청도군", benefits: [{ title: "출산지원금", amount: { summary: "560 ~ 2140만원", value: { 1: 5600000, 2: 14800000, 3: 21400000, 4: 21400000, 5: 21400000 } }, target: "청도군 1년 전 거주", contact: "054-370-6482" }, { title: "출산축하용품", amount: { display: "서비스 지원 (물품)" }, target: "청도군 가정", contact: "054-370-6482", note: "내의, 욕조 등 10종" }, { title: "아가랑 첫만남 첫도장", amount: { display: "서비스 지원 (물품)" }, target: "청도군 출생아", contact: "054-370-6482", note: "기념우표 및 아기 도장" }] },
            "cheongsong": { name: "청송군", benefits: [{ title: "출산장려금", amount: { summary: "580 ~ 1600만원", value: { 1: 5800000, 2: 13000000, 3: 16000000, 4: 16000000, 5: 16000000 } }, target: "청송군 관내 거주", contact: "054-870-7281" }] },
            "pohang": { name: "포항시", benefits: [{ title: "출산장려금", amount: { summary: "100 ~ 1130만원", value: { 1: 1000000, 2: 2900000, 3: 4100000, 4: 11300000, 5: 11300000 } }, target: "포항시 관내 거주", contact: "054-270-4262" }] },
            "mungyeong": { name: "문경시", benefits: [{ title: "출산장려금", amount: { summary: "500만원 (전원)", total: 5000000 }, target: "문경시 거주", contact: "054-550-8185" }] },
            "ulleung": { name: "울릉군", benefits: [{ title: "출산장려금", amount: { summary: "680 ~ 1640만원", value: { 1: 6800000, 2: 11600000, 3: 16400000, 4: 16400000, 5: 16400000 } }, target: "울릉군 6개월 거주", contact: "054-790-6824" }] },
            "gyeongju": { name: "경주시", benefits: [{ title: "출산장려금", amount: { summary: "300 ~ 1800만원", value: { 1: 3000000, 2: 5000000, 3: 18000000, 4: 18000000, 5: 18000000 } }, target: "경주 거주", contact: "054-779-8627" }, { title: "출산축하금", amount: 200000, target: "경주 거주", contact: "054-779-8627" }] },
            "gumi": { name: "구미시", benefits: [{ title: "출산축하금", amount: { summary: "150 ~ 500만원", value: { 1: 1500000, 2: 2000000, 3: 3000000, 4: 4000000, 5: 5000000 } }, target: "구미시 거주", contact: "054-480-4160" }] },
            "gimcheon": { name: "김천시", benefits: [{ title: "출산장려금", amount: { summary: "300 ~ 1000만원", value: { 1: 3000000, 4: 10000000, 5: 10000000 } }, target: "김천시 거주", contact: "054-421-2738" }] },
            "yeongju": { name: "영주시", benefits: [{ title: "출산장려금", amount: { summary: "240 ~ 1800만원", value: { 1: 2400000, 2: 7200000, 3: 18000000, 4: 18000000, 5: 18000000 } }, target: "영주시 관내 거주", contact: "054-639-5742" }, { title: "산후조리비", amount: 1000000, target: "1년 거주", contact: "054-639-5742" }] }
        }
    },
    "gyeongnam": {
        name: "경상남도",
        districts: {
            "geoje": { name: "거제시", benefits: [{ title: "출산장려금", amount: { summary: "100 ~ 800만원", value: { 1: 1000000, 2: 3000000, 3: 8000000, 4: 8000000, 5: 8000000 } }, target: "거제시 3개월 거주", contact: "055-639-4934" }] },
            "geochang": { name: "거창군", benefits: [{ title: "출산축하금", amount: { summary: "500만원 (전원)", total: 5000000 }, target: "거창군 관내 거주", contact: "055-940-8885" }] },
            "goseong": { name: "고성군", benefits: [{ title: "출산장려금", amount: { summary: "100 ~ 200만원", value: { 1: 1000000, 2: 2000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "경상남도 고성군 6개월 거주", contact: "055-670-2702" }] },
            "gimhae": { name: "김해시", benefits: [{ title: "출산축하금", amount: { summary: "50 ~ 100만원", value: { 1: 500000, 2: 1000000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "김해시 90일 거주", contact: "055-330-2495" }] },
            "namhae": { name: "남해군", benefits: [{ title: "출산장려금", amount: { summary: "300 ~ 1000만원", value: { 1: 3000000, 2: 4000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "남해군 3개월 거주", contact: "055-860-3581" }] },
            "miryang": { name: "밀양시", benefits: [{ title: "출산장려금", amount: { summary: "100 ~ 200만원", value: { 1: 1000000, 2: 2000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "밀양시 6개월 전 거주", contact: "055-359-7050" }] },
            "sacheon": { name: "사천시", benefits: [{ title: "출산지원금", amount: { summary: "100 ~ 800만원", value: { 1: 1000000, 2: 2000000, 3: 8000000, 4: 8000000, 5: 8000000 } }, target: "사천시 관내 거주", contact: "055-831-3609" }, { title: "출산축하용품", amount: { display: "서비스 지원 (물품)" }, target: "사천시 가정", contact: "055-831-3609", note: "4만원 상당 세트" }] },
            "sancheong": { name: "산청군", benefits: [{ title: "출산장려금", amount: { summary: "290 ~ 1250만원", value: { 1: 2900000, 2: 4100000, 3: 12500000, 4: 12500000, 5: 12500000 } }, target: "산청군 6개월 거주", contact: "055-970-8973" }, { title: "건강보험료 지원", amount: { display: "서비스 지원 (보험)" }, target: "산청군 둘째+", contact: "055-970-8973", note: "월 3만원 이하 5년간" }] },
            "yangsan": { name: "양산시", benefits: [{ title: "출산장려금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 1000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "양산시 관내 거주", contact: "055-392-3622" }] },
            "uiryeong": { name: "의령군", benefits: [{ title: "출산장려금(순수군비)", amount: { summary: "200 ~ 1100만원", value: { 1: 2000000, 2: 4000000, 3: 11000000, 4: 11000000, 5: 11000000 } }, target: "의령군 6개월 거주", contact: "055-570-2924" }, { title: "출생아 건강보험", amount: { display: "서비스 지원 (보험)" }, target: "의령군 영유아", contact: "055-570-2924" }] },
            "jinju": { name: "진주시", benefits: [{ title: "출산축하금", amount: { summary: "100 ~ 600만원", value: { 1: 1000000, 2: 2000000, 3: 6000000, 4: 6000000, 5: 6000000 } }, target: "진주시 90일 전 거주", contact: "055-749-5114" }] },
            "changnyeong": { name: "창녕군", benefits: [{ title: "출산장려금", amount: { summary: "200 ~ 1000만원", value: { 1: 2000000, 2: 4000000, 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "창녕군 3개월 거주", contact: "055-530-1423" }, { title: "임신 축하물품", amount: { display: "서비스 지원 (물품)" }, target: "창녕군 임산부", contact: "055-530-1423", note: "5만원 상당 용품" }] },
            "changwon": { name: "창원시", benefits: [{ title: "출산축하금", amount: { summary: "50 ~ 200만원", value: { 1: 500000, 2: 2000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "창원시 3개월 전 거주", contact: "055-225-3981" }] },
            "tongyeong": { name: "통영시", benefits: [{ title: "출산지원금", amount: { summary: "100 ~ 300만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 3000000, 5: 3000000 } }, target: "통영시 6개월 전 거주", contact: "055-650-3114" }] },
            "hadong": { name: "하동군", benefits: [{ title: "출산장려금", amount: { summary: "440 ~ 1100만원", value: { 1: 4400000, 2: 11000000, 3: 11000000, 4: 11000000, 5: 11000000 } }, target: "하동군 3개월 거주", contact: "055-880-2844" }, { title: "출산용품 구입비", amount: { display: "서비스 지원 (현금)" }, target: "하동군 거주 가정", contact: "055-880-2844", note: "50만원 상당 용품 지원" }] },
            "haman": { name: "함안군", benefits: [{ title: "출산지원금 (셋째+)", amount: { summary: "1000만원", value: { 3: 10000000, 4: 10000000, 5: 10000000 } }, target: "함안군 6개월 전 거주", contact: "055-580-2543" }, { title: "출산축하 용품", amount: { display: "서비스 지원 (물품)" }, target: "함안군 가정", contact: "055-580-2543", note: "보습세트, 내의 등" }] },
            "hamyang": { name: "함양군", benefits: [{ title: "임신/출산 축하용품", amount: { display: "서비스 지원 (물품)" }, target: "함양군 산모", contact: "보건소", note: "속옷, 영양제, 내의세트 등" }, { title: "임신·출산 의료비 지원", amount: { display: "서비스 지원 (의료비)" }, target: "함양군 임신부", contact: "보건소", note: "최대 120만원 지원" }] },
            "hapcheon": { name: "합천군", benefits: [{ title: "다자녀 지원금", amount: { monthly: 150000, duration_months: 84, display: "월 15만원" }, target: "합천군 거주 둘째+ (만 7세 미만)", contact: "055-930-3587" }] }
        }
    },
    "incheon": {
        name: "인천광역시",
        districts: {
            "ganghwa": { name: "강화군", benefits: [...getIncheonCommon(), { title: "출산지원금", amount: { summary: "500 ~ 2000만원", value: { 1: 5000000, 2: 8000000, 3: 13000000, 4: 20000000, 5: 20000000 } }, target: "강화군 2년 이상 거주", contact: "032-930-4068" }, { title: "보건소 축하선물", amount: { display: "서비스 지원 (물품)" }, target: "강화군 가정", contact: "032-930-4068" }] },
            "ongjin": { name: "옹진군", benefits: [...getIncheonCommon(), { title: "출산장려금", amount: { summary: "100 ~ 1000만원", value: { 1: 1000000, 2: 2000000, 3: 3000000, 4: 5000000, 5: 10000000 } }, target: "옹진군 1년 이상 거주", contact: "032-899-2332" }] },
            "seo": { name: "서구", benefits: [...getIncheonCommon(), { title: "저소득층 축하용품비", amount: { display: "서비스 지원 (지역화폐)" }, target: "인천 서구 저소득층", contact: "032-560-3445", note: "30만원 지급" }] },
            "gyeyang": { name: "계양구", benefits: [...getIncheonCommon(), { title: "여성장애인 지원금", amount: 1200000, target: "인천 계양구 등록 여성장애인", contact: "032-450-5856" }] },
            "namdong": { name: "남동구", benefits: [...getIncheonCommon(), { title: "다자녀 지원금", amount: { summary: "100 ~ 800만원", value: { 3: 1000000, 4: 3000000, 5: 8000000 } }, target: "인천 남동구 거주", contact: "032-453-8363" }] },
            "dong": { name: "동구", benefits: [...getIncheonCommon()] },
            "michuhol": { name: "미추홀구", benefits: [...getIncheonCommon()] },
            "bupyeong": { name: "부평구", benefits: [...getIncheonCommon(), { title: "현물/서비스 정보", amount: { display: "문의 필요" }, target: "부평구 거주자", contact: "032-509-8250" }] },
            "yeonsu": { name: "연수구", benefits: [...getIncheonCommon()] },
            "junggu": { name: "중구", benefits: [...getIncheonCommon()] }
        }
    },
    "busan": {
        name: "부산광역시",
        districts: {
            "gijang": { name: "기장군", benefits: [...getBusanCommon(), { title: "출산지원금(군비)", amount: { summary: "50 ~ 360만원", value: { 1: 0, 2: 500000, 3: 3600000, 4: 3600000, 5: 3600000 } }, target: "부산 기장군 거주", contact: "051-709-4652" }] },
            "dongnae": { name: "동래구", benefits: [...getBusanCommon(), { title: "출산장려금", amount: 1000000, target: "부산 동래구 거주", contact: "051-550-4355" }] },
            "seo": { name: "서구", benefits: [...getBusanCommon(), { title: "출산지원금", amount: 1000000, target: "부산 서구 거주", contact: "051-240-4356" }, { title: "어린이 건강보장보험료", amount: { display: "서비스 지원 (보험)" }, target: "서구 셋째+", contact: "051-240-4356", note: "월 1.5만원 상당 지원" }] },
            "suyeong": { name: "수영구", benefits: [...getBusanCommon(), { title: "출산장려금", amount: { summary: "100 ~ 200만원", value: { 1: 0, 2: 1000000, 3: 2000000, 4: 2000000, 5: 2000000 } }, target: "부산 수영구 거주", contact: "051-610-4000" }] },
            "yeonje": { name: "연제구", benefits: [...getBusanCommon(), { title: "출산지원금", amount: { summary: "20 ~ 100만원", value: { 1: 200000, 2: 500000, 3: 1000000, 4: 1000000, 5: 1000000 } }, target: "부산 연제구 거주", contact: "051-665-4656" }, { title: "출생기념 태극기 지급", amount: { display: "서비스 지원 (물품)" }, target: "연제구 출생아", contact: "051-665-4656" }] },
            "haeundae": { name: "해운대구", benefits: [...getBusanCommon(), { title: "신혼부부 출산장려용품", amount: { display: "서비스 지원 (물품)" }, target: "해운대구 신혼부부", contact: "보건소", note: "태교서적, 보온병" }] },
            "yeongdo": { name: "영도구", benefits: [...getBusanCommon(), { title: "출산축하용품", amount: { display: "서비스 지원 (물품)" }, target: "영도구 가정", contact: "보건소", note: "15만원 상당 택배" }] },
            "namgu": { name: "남구", benefits: [...getBusanCommon(), { title: "종량제봉투 무상지급", amount: { display: "서비스 지원 (물품)" }, target: "남구 셋째+", contact: "구청", note: "20L 100매" }] },
            "sasang": { name: "사상구", benefits: [...getBusanCommon(), { title: "출산축하금", amount: { display: "문의 필요" }, target: "사상구 거주", contact: "보건소" }] }
        }
    },
    "ulsan": {
        name: "울산광역시",
        districts: {
            "nam": { name: "남구", benefits: [{ title: "출산장려금", amount: "60만~", target: "울산 남구 거주", contact: "보건소" }, { title: "출산축하선물", amount: { display: "서비스 지원 (현물)" }, target: "울산 남구 가정", contact: "보건소", note: "10만원 상당 한우+미역" }] },
            "dong": { name: "동구", benefits: [{ title: "출산축하선물", amount: { display: "서비스 지원 (물품)" }, target: "울산 동구 산모", contact: "보건소", note: "영양제, 체온계" }, { title: "첫돌 사진 촬영비", amount: { display: "서비스 지원 (실비)" }, target: "울산 동구 가정", contact: "보건소", note: "10만원 지원" }] },
            "buk": { name: "북구", benefits: [{ title: "장애인 출산지원금", amount: { summary: "70~100만원", value: { 1: 700000 } }, target: "등록 장애인", contact: "구청", note: "장애 정도에 따라 차등" }] },
            "ulju": { name: "울주군", benefits: [{ title: "출산축하용품 포인트", amount: { display: "서비스 지원 (포인트)" }, target: "울주군 가정", contact: "보건소", note: "10만원 상당" }] }
        }
    },
    "jeju": {
        name: "제주특별자치도",
        districts: {
            "jeju": { name: "제주시", benefits: [...getJejuCommon("064-710-2872"), { title: "자체 축하 선물", amount: { display: "서비스 지원 (현물)" }, target: "제주시 관내 거주", contact: "064-710-2872", note: "읍면동별 상이 (용품, 케이크 등)" }, { title: "여성농업인 도우미", amount: { display: "서비스 지원 (인력)" }, target: "여성농업인", contact: "064-710-2872", note: "이용료 80% 지원" }] },
            "seogwipo": { name: "서귀포시", benefits: [...getJejuCommon("064-710-2872"), { title: "육아용품 대여", amount: { display: "서비스 지원 (할인)" }, target: "서귀포시 관내 거주", contact: "064-710-2872", note: "회원 50% 할인" }] }
        }
    }
};
