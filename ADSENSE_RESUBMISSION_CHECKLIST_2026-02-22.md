# AdSense 재심사 체크리스트 (2026-02-22)

## 1. 사이트 품질 신호
- [x] 원본 도구형 콘텐츠(혜택조회/계산기/달력/이름연구소) 제공
- [x] 운영자 정보 및 문의 채널 공개
- [x] 약관/개인정보처리방침/문의 페이지 연결
- [x] 정책 근거 링크 및 검수 기준 노출

## 2. 색인/크롤링 신호
- [x] `robots.txt` 공개
- [x] `sitemap.xml` 공개 + `lastmod` 반영
- [x] `ads.txt` 공개
- [x] 공개 페이지 `meta robots=index,follow` 적용 (`admin`만 `noindex`)
- [x] `canonical` 적용

## 3. 구조화 데이터
- [x] 홈: `WebSite`, `Organization` JSON-LD
- [x] FAQ: `FAQPage` JSON-LD

## 4. 광고 UX
- [x] 하단 중심 광고 배치로 본문/결과 UI 가림 최소화
- [x] 모바일 가독성 방해 요소 점검

## 5. 재심사 제출 전 최종 점검
- [ ] 배포 후 실서버에서 `https://chulsan-danawa.com/robots.txt` 확인
- [ ] 배포 후 실서버에서 `https://chulsan-danawa.com/sitemap.xml` 확인
- [ ] 배포 후 실서버에서 `https://chulsan-danawa.com/ads.txt` 확인
- [ ] Search Console에서 `sitemap.xml` 재제출
- [ ] AdSense에서 사이트 재검토 요청

## 6. 제출 후 운영 원칙
- [ ] 7~14일간 페이지 구조/정책 페이지 URL 변경 금지
- [ ] 신규 콘텐츠는 출처/검수일 포함해 업데이트
- [ ] 과도한 광고 추가 금지
