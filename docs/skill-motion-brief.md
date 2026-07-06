# 스킬 모션/이펙트 구현 브리프 (Claude Code 전달용)

> 이 문서를 Claude Code 세션에 그대로 주면 됩니다. 프로젝트: `d:\node\webservice\webgame`
> (바닐라 ES모듈 · 빌드 없음 · Canvas 2D · 주석 한국어). 실행: `node serve.mjs`(8080), 테스트: `node --test`.

## 목표
스킬이 발동/이동/명중할 때의 **모션과 이펙트**를 타입·원소별로 살려 타격감을 강화한다.
지금은 투사체=단색 원, 빔=선, 오라=확장 링 정도로 밋밋하다. 아래를 추가한다.

## 코드 지형(현황 · 반드시 읽고 시작)
- `js/engine/entities.js` — `createWorld()`의 풀: `particles`, `floaters` 등. `world.spawnParticle({...})`로 파티클 생성, `world.despawnDead()`가 `alive:false` 정리.
- `js/systems/skills.js` — `RUNTIME.projectile/beam/orbital/aura/chain/summon`(발사 로직). 투사체는 `world.spawnProjectile(...)`, 오라/연쇄는 `world.spawnParticle({ring/bolt/shock})` 사용. `updateProjectiles(world)`가 투사체 이동.
- `js/main.js` — 업데이트 루프의 **파티클 업데이트**(`spark`=이동, `shock`=반경확장), **투사체-적 충돌**(`damageEnemy` → 처치 시 스파크 버스트), **렌더**의 파티클 분기(`spark`/`shock`/`ring`/`bolt`)와 투사체 렌더(`beam`=선, 그 외 원).
- `js/ui/render.js` — 드로잉 헬퍼: `neonCircle`, `neonLine`, `gem`, `coin`, `heart`, `grid`.
- 현재 파티클 필드 예: `{x,y,vx,vy,life,max,color,spark|shock|ring|bolt, r,rMax, x1,y1,x2,y2}`.

## 설계 원칙
- **데이터 경량**: 원소는 `skill.tags[0]`에서 파생. `js/ui/fx.js`(신규)에 `FX_ELEMENT` 맵(원소→색/파티클 스타일)과 스폰 헬퍼를 모아 렌더/생성 로직을 한 곳에.
- **풀 재사용**: 기존 `world.particles` 배열 + `spawnParticle` + `despawnDead` 그대로 사용. 새 파티클 타입은 필드 플래그로 구분(예: `kind:'trail'`). 프레임당 상한(파티클 총 ~600 넘으면 스폰 스킵).
- **렌더 분리**: 파티클 렌더 분기가 길어지므로 `js/ui/fx.js`에 `drawParticle(ctx, pt, camX, camY)` 만들어 main 렌더에서 호출. 업데이트도 `stepParticle(pt)`로 이관 가능(순수—테스트 가능하면 좋음).

## 원소 팔레트(FX_ELEMENT)
| 원소 | 주색 | 명중 이펙트 |
|---|---|---|
| physical | #cfe3ff | 흰 슬래시 스파크 |
| arcane | #c98bff | 보라 룬 파편 |
| fire | #ff6a3d | 상승하는 잔불(ember) |
| ice | #8bd8ff | 얼음 파편(shard) 흩뿌림 |
| lightning | #b28bff | 짧은 스파크 크래클 |
| holy | #ffe58a | 방사형 광휘 플래시 |
| poison | #9cff8b | 초록 방울 splatter |

## 타입별 모션 스펙
1. **projectile** — 매 프레임 **트레일**(작은 반투명 파티클을 진행 반대쪽에 스폰, life~10, 원소색) + 살짝 회전/맥동. **명중 시** 원소별 impact 버스트(6~10개).
2. **beam** — 발사 순간 총구 **차지 플래시**(짧은 확장 링) + 빔 본체를 코어(밝음)+글로우(굵고 반투명) 2겹 선으로, 끝에 스파크. 짧은 페이드.
3. **orbital** — 회전 궤도체에 **모션 아크 트레일**(직전 위치 잔상 2~3개) + 접촉 시 작은 스파크.
4. **aura** — 발동마다 **확장 펄스 링**(이미 shock 사용) + 유지 동안 은은한 **원소 필드**(fire=잔불 상승, ice=반짝이는 눈가루, poison=올라오는 방울)를 플레이어 주변에 저빈도 스폰.
5. **chain** — hop 구간마다 **여러 꺾인 세그먼트**의 번개 아크(직선 1개 대신 3~4개 지그재그) + 명중점 짧은 크래클 + 잔광.
6. **summon** — 드론 **idle 바운스** + 발사 시 **총구 플래시**(작은 링/스파크).

## 공통 이펙트 강화
- **명중(impact)**: `damageEnemy`에서 현재 생성하는 스파크를 **원소별 스타일**로 교체(색·모양·상승/흩뿌림 등). 크리는 더 크고 밝게 + 살짝 화이트 플래시.
- **캐스트 텔레그래프(선택)**: 발동 시 플레이어 발밑에 얇은 원소색 링 1회(과하지 않게).

## 구현 순서(권장)
1. `js/ui/fx.js` 신규: `FX_ELEMENT`, `elementOf(skill)`, 스폰 헬퍼(`spawnTrail`, `spawnImpact(world,x,y,element,crit)`, `spawnMuzzle`, `spawnAuraField`), `stepParticle(pt)`, `drawParticle(ctx,pt,camX,camY)`. 기존 spark/shock/ring/bolt도 여기로 흡수.
2. `main.js`: 파티클 업데이트/렌더를 `fx.stepParticle`/`fx.drawParticle`로 교체(동작 동일 유지 후 확장). 투사체 트레일 스폰(이동 루프에서 저빈도), `damageEnemy` 임팩트를 `fx.spawnImpact`로.
3. `systems/skills.js`: 각 RUNTIME 발사 지점에 muzzle/telegraph, beam 2겹, chain 다세그먼트, aura 필드 스폰 훅 추가(원소는 `skill.tags[0]`).
4. 성능: 파티클 총량 상한·수명 축소로 60fps 유지.

## 제약 · 수용 기준
- 바닐라 ES모듈 · 외부 라이브러리 0 · 주석 한국어.
- **`node --test` 계속 통과**(FX는 렌더/생성이라 기존 로직 테스트 불변). 순수화 가능한 `stepParticle`/`elementOf`는 테스트 1~2개 추가 권장.
- 브라우저 `http://localhost:8080`에서 각 스킬 발동 시 모션이 보이고 프레임 드랍 없음(파티클 상한 동작).
- 이미지 파이프라인(assets/skills SVG)과 무관—코드 파티클만. (이미지 이펙트는 별도 fx 스프라이트 연동 논의)

## 참고(현재 값)
- 오라는 이미 "쿨타임마다 펄스" 모델(`shock` 파티클). 트레일/필드만 얹으면 됨.
- 크리 판정·데미지는 `main.js damageEnemy`에 있음(여기서 impact 호출).
- 투사체 색은 `p.color`, 빔은 `p.beam`+`p.len`, 궤도는 `p.orbit`.
