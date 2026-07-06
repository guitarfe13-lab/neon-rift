# NEON ARCADE 배포 · 수익화 가이드

**멀티게임 포털**입니다. 각 게임은 무빌드·의존성0 정적 클라이언트이고, 홈은 `js/data/games.js` 데이터로 게임 목록을 렌더합니다. 런타임에 Node가 필수는 아니지만, "웹서비스 운영 + 광고"를 위해 콘텐츠 페이지와 Node 프로덕션 서버를 갖췄습니다.

## 사이트 구성

| 경로 | 역할 |
|---|---|
| `index.html` | **포털 홈**(게임 카드 그리드 + 소개 + 광고). 그리드는 `js/site.js`가 `games.js`로 렌더 |
| `neon-rift.html` | NEON RIFT **상세**(히어로 + 유튜브 임베드 + 스크린샷 상세설명 + 광고) — SEO/AdSense 콘텐츠 |
| `play.html` | NEON RIFT 실행 화면(광고 없음, 오조작 방지) |
| `guide.html` | NEON RIFT 공략(콘텐츠 분량 → AdSense 승인에 유리) |
| `privacy.html` | 개인정보 처리방침(포털 공통, AdSense 필수) |
| `404.html` | 없는 페이지 |
| `js/data/games.js` | **게임 목록·포털 이름 데이터**(SITE, GAMES) |
| `js/site.js` | 홈 그리드 렌더 + 유튜브 lite 임베드 + 스크린샷 자리표시 + 브랜드 주입 |
| `js/ads.js` | AdSense 로더 + 동의 배너(설정 전엔 미리보기 박스) |
| `assets/thumbs/` · `assets/screens/` | 카드 썸네일 · 게임플레이 스크린샷(넣는 법은 각 README) |
| `ads.txt` / `robots.txt` / `sitemap.xml` | 광고 인증 / 크롤링 / 색인 |
| `server.mjs` · `serve.mjs` | 프로덕션(의존성0) · 개발(8080) 서버 |

## 새 게임 추가하기
1. 게임 파일(정적)을 추가하고 실행 페이지를 만든다(예: `game2/` 폴더 + `game2-play.html`).
2. **상세 페이지**: `neon-rift.html`을 복사해 히어로·유튜브(`data-yt`)·스크린샷(`data-shot`)·설명을 교체.
3. **홈 노출**: `js/data/games.js`의 `GAMES`에 항목 한 줄 추가(`status:'live'`, `detail`/`play` 경로, `youtube`, `thumb`, `tags`).
4. `assets/thumbs/`에 카드 썸네일, `assets/screens/`에 스크린샷을 넣는다. `sitemap.xml`에 URL 등록.

## 게임플레이 영상 · 스크린샷
- **유튜브**: 상세 페이지 `<div class="yt-embed" data-yt="영상ID">`에 ID를 넣으면 클릭 시 재생(no-cookie, lite). 비우면 "준비 중" 표시.
- **스크린샷**: `assets/screens/README.md` 참고. 파일을 넣으면 자리표시가 실제 캡처로 바뀜.

## 배포 방법

### A. 정적 호스팅(가장 저렴·빠름) — 권장 기본값
Cloudflare Pages / Netlify / GitHub Pages 등에 이 폴더를 그대로 올리면 됩니다. 빌드 명령 없음, 출력 디렉터리 = 루트.
> 클린 URL(`/guide`)은 정적 호스팅에선 동작하지 않을 수 있으니 링크는 `.html`까지 씁니다(현재 그렇게 되어 있음).

### B. Node 웹서비스(CloudType / Render / Railway)
```
npm start        # = node server.mjs  (PORT 환경변수 자동 사용, 0.0.0.0 바인딩)
```
- 빌드 명령: 없음
- 시작 명령: `node server.mjs`
- 헬스체크: `/healthz` → `ok`
- 정적 자산 장기 캐시 + HTML no-cache + 보안 헤더 + 클린 URL 처리 포함.

### C. itch.io (도달용, ⚠️ 본인 AdSense 불가)
1. 전체 폴더를 zip으로 압축(루트에 `index.html` 포함). 단, itch용은 `index.html`을 게임으로 두는 편이 자연스러우니
   itch 업로드본은 `play.html` 내용을 `index.html`로 바꿔 넣거나, itch "This file will be played in the browser"로 `play.html` 지정.
2. itch.io → Upload → HTML, "Kind of project: HTML" 지정, 뷰포트 960×540(또는 Fullscreen).
3. **itch 임베드 게임에는 외부 광고 스크립트(AdSense)를 넣을 수 없습니다.** 광고 매출은 아래 "내 사이트"에서만 발생합니다.

## AdSense 활성화 체크리스트

승인 전엔 광고 자리에 "광고 영역" 미리보기 박스가 보입니다. 승인 후:

1. **도메인 준비**: 본인 도메인 연결(AdSense는 신뢰 도메인을 선호). 아래 파일의 `neon-rift.example.com`을 실제 도메인으로 교체
   - `sitemap.xml`, `robots.txt`, 각 HTML의 `canonical`/`og:url`
2. **AdSense 신청 → 승인**: 콘텐츠가 충분해야 통과(그래서 랜딩·공략·개인정보를 갖춤).
3. **게시자 ID 입력(한 곳)**: `js/ads.js`의 `ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'` → 실제 값으로 교체.
4. **ads.txt**: `ads.txt`의 `pub-XXXXXXXXXXXXXXXX`를 실제 게시자 번호로 교체.
5. **광고 슬롯 ID**: 각 HTML `<div class="ad-slot" data-ad-slot="...">`의 번호를 AdSense에서 만든 광고 단위 ID로 교체.
6. **개인정보 문의 이메일**: `privacy.html`의 `[운영자 이메일 입력]` 교체.
7. **EU 동의(CMP)**: 유럽 트래픽이 있다면 AdSense 콘솔에서 Google 동의 관리(CMP)를 활성화(GDPR).

> 팁: AdSense는 "게임만 있는 저콘텐츠" 사이트를 자주 반려합니다. 공략 글을 더 늘리거나(무기/보스별 상세 등) 업데이트 노트를
> 추가하면 승인·수익 모두에 유리합니다.
