# AI API 호출 설정 (사진관 운영값)

현재 프로젝트 기준 설정 예시 문서입니다. 실제 키는 절대 Git에 저장하지 마세요.

## 1) Frontend 연결값

`public/index.html`:

```html
<script>
  window.AI_API_BASE = "https://chulsan-danawa-ai.jhun8802.workers.dev";
</script>
```

## 2) Cloudflare Worker 필수 설정

### 2-1. Secret (반드시 secret으로)

```bash
cd cloudflare-worker
wrangler secret put OPENAI_API_KEY
wrangler secret put POLAR_WEBHOOK_SECRET
```

### 2-2. Vars (wrangler.toml 또는 wrangler secret/vars로 관리)

필수:

```toml
[vars]
ALLOWED_ORIGINS = "https://chulsan-danawa.com,https://www.chulsan-danawa.com,https://chulsan-danawa.web.app,https://test-17133889-10c0f.web.app,https://chulsan-danawa--preview-hpoei7gh.web.app,http://localhost:5000,http://127.0.0.1:5000"
FIREBASE_PROJECT_ID = "test-17133889-10c0f"
FIREBASE_WEB_API_KEY = "REPLACE_WITH_NEW_RESTRICTED_KEY"
```

권장:

```toml
[vars]
POLAR_CHECKOUT_BASE_URL = "https://buy.polar.sh/polar_cl_i4Dlq7yDXyDmilA9GoCKCcWwHYYJFFp69CrOO0GauKr"
COUPON_UNIT_CREDITS = "250"
COUPON_CAMPAIGN_MONTH = "2026-02"
COUPON_CAMPAIGN_MAX_COUPONS = "50"
COUPON_RESERVATION_TTL_MINUTES = "30"
WELCOME_COUPON_MAX_COUPONS = "30"
```

운영 안전장치(선택):

```toml
[vars]
CREDIT_GRANT_MAX_PER_TXN = "20000"
CREDIT_GRANT_DAILY_CAP_PER_USER = "20000"
CREDIT_GRANT_MONTHLY_CAP_PER_USER = "100000"
CREDIT_WALLET_MAX_BALANCE = "200000"
```

## 3) 바인딩 템플릿 (D1/R2)

`cloudflare-worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "chulsan-danawa-credits"
database_id = "878b4e11-6b0b-4b61-b811-b17103dc2a9e"

[[r2_buckets]]
binding = "AI_PHOTO_BUCKET"
bucket_name = "chulsan-danawa-ai-photos"
```

## 4) Firebase 클라이언트 설정 일치 확인

`public/index.html` 또는 `public/script.js`의 Firebase 설정값과 Worker vars가 반드시 일치해야 합니다.

- `FIREBASE_PROJECT_ID` == Firebase `projectId`
- `FIREBASE_WEB_API_KEY` == Firebase `apiKey`

## 5) API 호출 규격 요약

`POST /api/baby-photo` 필수:

```json
{
  "gestational_weeks": 28,
  "gender": "female",
  "mother_image_data_url": "data:image/jpeg;base64,...",
  "father_image_data_url": "data:image/jpeg;base64,...",
  "ultrasound_image_data_urls": [
    "data:image/jpeg;base64,..."
  ]
}
```

헤더:

```http
Content-Type: application/json
Authorization: Bearer <firebase-id-token>
```

## 6) 배포 전 최종 점검표

- `OPENAI_API_KEY` secret 등록 완료
- `POLAR_WEBHOOK_SECRET` secret 등록 완료 (결제 webhook 사용 시)
- `ALLOWED_ORIGINS`에 운영/프리뷰/로컬 도메인 포함
- D1 `DB` 바인딩 정상
- R2 `AI_PHOTO_BUCKET` 바인딩 정상
- 프론트 `window.AI_API_BASE`가 `https://chulsan-danawa-ai.jhun8802.workers.dev`로 설정됨
- Firebase `projectId/apiKey`와 Worker vars 값이 동일

## 7) 빠른 점검 명령

```bash
cd cloudflare-worker
wrangler whoami
wrangler secret list
wrangler d1 list
wrangler deploy
```

배포 후 브라우저 네트워크 탭에서 확인:

- `/api/baby-photo` 응답 코드
- `401`이면 Firebase 토큰/프로젝트 설정 불일치 가능성
- `500`이면 Worker secret/binding 누락 가능성
