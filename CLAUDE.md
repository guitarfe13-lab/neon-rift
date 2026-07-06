# webgame (NEON RIFT) — 작업 지침

이 폴더(webgame) 작업에만 적용. gbi-node·lotto-ai와 **완전 별개**(무관) → 각각 `../gbi-node/CLAUDE.md`, `../lotto-ai/CLAUDE.md`.

**정체성:** 브라우저에서 설치 없이 도는 **정적 클라이언트 게임** — 액션 로그라이크 방치형 RPG(NEON RIFT). 지오메트릭 네온 비주얼.

## 배포 · git
- **git 저장소**: `github.com/guitarfe13-lab/neon-rift`, `main`에 푸시. 윈도우 SSL은 `git config http.sslBackend schannel`로 해결됨(리포에 설정 고정).
- **자동푸시 훅 없음**(lotto-ai 전용). 각 Phase 체크포인트마다 수동 커밋·푸시.
- 배포는 **정적 호스팅**(가장 저렴) 또는 **Node 프로덕션 서버 `node server.mjs`**(의존성0, CloudType/Render, `npm start`). 빌드 산출물 없음.
- **사이트 구조**: `index.html`=랜딩(콘텐츠·광고), `play.html`=게임, `guide.html`=공략, `privacy.html`=개인정보. 게임 자체는 `play.html`.
- **수익화(AdSense)**: `js/ads.js`의 `ADSENSE_CLIENT` 한 곳만 교체하면 활성화(승인 전엔 미리보기 박스). `ads.txt`·도메인 placeholder(`neon-rift.example.com`) 교체 필요. **itch.io엔 본인 AdSense 불가**. 상세: `docs/DEPLOY.md`.

## 실행 · 테스트
- **개발 서버**: `node serve.mjs` → http://localhost:8080 (의존성 0. `file://`은 ES모듈 CORS로 막히므로 반드시 http로).
- **테스트**: `node --test` (순수 로직만. Node 내장 러너, 무빌드).
- 정적 자산(js/css/html)은 **브라우저 새로고침**으로 반영(서버 재시작 불필요).

## 기술 · 규칙
- **바닐라 ES모듈 · 빌드 없음 · 의존성 0.** `<script type="module">` + import만. 프레임워크/번들러 금지.
- **주석 한국어.**
- **아트는 지오메트릭 네온**(Canvas 2D, 외부 이미지 0개). **사운드는 프로시저럴 Web Audio**(+ 선택적 CC0 BGM 파일 `assets/bgm/track1.mp3`).
- **저장은 localStorage**(익명, 서버/계정 없음).

## 데이터 주도(핵심)
- 콘텐츠(캐릭터·스킬·적·보스·바이옴·메타)는 전부 `js/data/*.js` 데이터 테이블. 런타임은 이를 **해석**만 함 → 콘텐츠 추가 = 데이터 한 줄.
- **순수 로직 모듈은 DOM/Canvas/WebAudio import 금지**(테스트 격리): `core/rng`·`core/storage`·`engine/stats`·`systems/skillScaling`·`systems/meta`·`engine/spawner`·`engine/enemyAI`.

## 구조
- `js/core`(loop·rng·storage·audio·input) · `js/engine`(entities·spawner·combat·stats·enemyAI) · `js/systems`(skills·skillScaling·levelup·meta) · `js/data`(characters·skills·enemies·bosses·biomes·metaUpgrades) · `js/ui`(render·hud·screens) · `js/main.js`.
- 게임 흐름: 타이틀 → 로드아웃(캐릭터 선택) → 런(자동전투·레벨업 3택1·진화) → 게임오버(소울 정산) → 메타 상점/설정.
- 카메라는 플레이어 중앙 고정(월드 상대 렌더). 보스전은 원형 아레나로 플레이어를 가둠.

## 문서
- 설계: `docs/superpowers/specs/2026-07-06-neon-rift-idle-roguelike-design.md`
- 계획: `docs/superpowers/plans/2026-07-06-neon-rift.md` (Phase 0~7)
