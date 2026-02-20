# Security Predeploy Checklist

Date baseline: 2026-02-20

1. Google Cloud Console에서 유출된 Firebase Web API Key를 폐기(rotate)했다.
2. 신규 Firebase Web API Key에 API 제한을 설정했다.
3. 신규 Firebase Web API Key에 HTTP referrer 제한을 설정했다.
4. `public/runtime-config.js`에 신규 키를 반영했다.
5. `public/runtime-config.js`의 `firebaseEnabled`를 `true`로 설정했다.
6. `cloudflare-worker/wrangler.toml`에는 실키 대신 placeholder만 남아있다.
7. `scripts/security-check.sh` 실행 결과가 PASS다.
8. 관리자 로그인(`/admin`)과 일반 로그인 기능을 수동 테스트했다.
9. 배포 후 Cloud Logging에서 이상 사용량/403/401 급증 여부를 확인했다.
