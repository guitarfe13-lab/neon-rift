# NEON RIFT — 통합 각성(Ascension) 시스템 설계

**작성일:** 2026-07-20
**대상:** webgame / NEON RIFT (바닐라 ES모듈·무빌드·Canvas 2D·데이터 주도)

## 목표(Goal)
후반(20레벨 전직 이후 ~ 35레벨 이후)의 "성장 체감 없음 / 무재미"를 해소한다.
전직을 **눈에 보이고 손맛이 바뀌는** 각성으로 만들고, 35레벨 이후 **무한 로그라이크
성장(각인)**을 붙여 매 판 다른 빌드가 나오게 한다.

## 문제(Problem) — 현행 진단
1. **전직 무체감:** 테크트리 노드가 거의 전부 `{stat,mult,value}`(숨은 %). 스킬의
   모양·거동이 안 바뀌어 배지 외엔 전직이 느껴지지 않음. (유일 예외: 광전사 `special.lifesteal`)
2. **35레벨 이후 공허:** 테크 분기는 20/25/30/35에서 끝. 스킬풀(직업당 7~8)도 그전에 소진.
   이후 레벨업은 만렙 스킬의 미미한 강화뿐 → 구조적 성장 0.

## 진행 타임라인(통합)
| 레벨 | 내용 | 상태 |
|---|---|---|
| 1–19 | 기존 3택1(스킬/패시브/진화) | 유지 |
| **20** | **전직 각성** — 3계열 1택. 진입 노드 = 기존 스탯 + **키스톤(시각+거동)** + 캐릭터 오라 | 신규 |
| 25/30/35 | 테크 분기 2택 | 유지(+일부에 소량 special 가미는 선택) |
| **40, 45, 50, …(+5, 무한)** | **각인(Sigil) 3택1** — 스택형 빌드 변형 | 신규 |

---

## Phase 1 — 전직 키스톤 각성

### 개념
20레벨 계열 선택 시, 진입 노드가 기존 스탯 보정에 더해 **키스톤(keystone)** 1개를 부여한다.
키스톤은 전투 거동을 바꾸는 `special`이며, 캐릭터에 **계열 색 오라/잔상**을 입혀 전직을 시각화한다.

### 키스톤 프리미티브(8종, 전투 훅)
| id | 이름 | 효과 |
|---|---|---|
| `siphon` | 흡성 | 가한 피해의 6% 회복(기존 lifesteal 재활용, 회복 플로터·붉은 오라로 시각화) |
| `guard` | 보호막 | 6초마다 다음 피격 1회 무효 + 몸 주위 배리어 링(시각) |
| `arcCrit` | 연격 | 크리 발생 시 인접 적에게 번개 아크(피해 60%) |
| `detonate` | 폭심 | 플레이어 투사체 명중 시 소형 폭발(주변 광역, 피해 일부) |
| `execute` | 처형 | HP 25% 이하 적에게 가하는 피해 +50% |
| `echo` | 반향 | 스킬 발사 시 25% 확률로 0.15초 뒤 1회 추가 시전 |
| `frostfield` | 서리장 | 5초마다 주변 감속 필드 방출 |
| `overcharge` | 과부하 | 8초마다 다음 스킬 ×2.5 + 큰 이펙트 |

### 계열 → 키스톤 매핑(12트리)
| 직업 | 트리 | 키스톤 | 오라색 |
|---|---|---|---|
| 검사 | 피의 광전사 | siphon | #ff5c6a |
| 검사 | 불괴의 수호자 | guard | #42a6ff |
| 검사 | 섬광의 검객 | arcCrit | #ffe14d |
| 마법사 | 대마도사 | detonate | #c98bff |
| 마법사 | 폭주 마도 | echo | #ff8ce0 |
| 마법사 | 비전 수호자 | guard | #8be0ff |
| 궁수 | 관통 저격수 | execute | #7cf9ff |
| 궁수 | 화살 폭풍 | detonate | #8effc7 |
| 궁수 | 그림자 사냥꾼 | arcCrit | #b28bff |
| 정령술사 | 동토의 군주 | frostfield | #8bd8ff |
| 정령술사 | 침식의 현자 | siphon | #9cff8b |
| 정령술사 | 폭풍 원소사 | overcharge | #ffd166 |

### 구현 지점
- `data/techTrees.js`: 각 트리 진입 노드에 `keystone:'<id>'` 필드 추가.
- `systems/techtree.js chooseTree`: 선택 시 `rs.keystone` + `rs.keystoneColor` 설정.
- `main.js`:
  - `damageEnemy`: siphon(있음)·execute(피해 배수)·arcCrit(크리 시 아크)·detonate(명중 폭발) 훅.
  - 투사체-적 충돌부: detonate.
  - `update`: guard 쿨 회복·발동, frostfield 주기 방출, overcharge 충전.
  - `hurtPlayer`: guard 발동 시 피격 무효.
  - `updateSkills onFire`/skills.js: echo 재시전, overcharge 배수.
  - 렌더: 플레이어에 keystone 오라(색 링/잔상) + guard 배리어 링.
- 전직 카드에 키스톤 설명 1줄 + 획득 플로터.

---

## Phase 2 — 각인(Sigil) 시스템

### 개념
마지막 테크 노드(35) 이후 **+5레벨마다(40,45,…) 각인 3택1**. 스택형(같은 각인 재획득 시 강화).
스탯형은 runMods로, 거동형은 `special`로 처리 → 기존 파이프라인 재사용.

### 각인 풀(초안 14종, 스택 스케일)
| id | 이름 | 효과(스택마다) |
|---|---|---|
| chain_bolt | 연쇄 낙뢰 | 처치 시 30%(+15%) 번개가 인접 적에 |
| splinter | 분열탄 | 투사체 처치 시 파편 2개(+1) |
| overload | 과부하 코어 | 6초(-1s)마다 다음 스킬 ×2.5 |
| siphon_core | 흡성 핵 | 처치 시 최대 HP 1.5%(+1%) 회복 |
| cursed | 저주받은 힘 | 주는 피해 +40%(+20%) / 받는 피해 +15% |
| frost_pulse | 서리 파동 | 5초마다 주변 감속 필드 |
| detonate_kill | 폭심 | 적 처치 시 소형 폭발(연쇄 사망) |
| time_rift | 시간 균열 | 12초마다 전역 슬로우 2초 |
| pierce_up | 관통 강화 | 모든 투사체 관통 +2 |
| radiance | 광휘 | 크리 확률 +8% / 크리 피해 +25% |
| regen_rune | 재생의 인 | HP·MP 재생 대폭 |
| multishot | 다중 사격 | 투사체 +1 |
| aegis | 반사 장막 | 받은 피해 25% 반사 |
| magnet | 자력장 | 획득 범위 +40% / 골드·XP +15% |

### 구현 지점
- `data/sigils.js`: SIGILS 테이블(`{id,name,desc, mods?, special?, stackScale?}`).
- `systems/ascension.js`(순수): 각인 롤(미보유/스택 가중), 보유 각인 → runMods 합성(`sigilMods(rs)`).
- `levelup.js allRunMods`: sigilMods 포함.
- `main.js`: overlay type `'sigil'`, 40/45/…에서 오픈(레벨업 정산 흐름에 훅). 거동형 special 훅.
- UI: 3택1 카드 재사용 + 보라/골드 "⚡ 각인 각성" 타이틀.
- `rs.sigils = {}`(id→스택), `rs.keystone`, `rs.keystoneColor`.

---

## Phase 3 — 심연 위협 (구현 완료)
35레벨 이후 스폰 몹에 위협 티어 비례 확률로 위험 변이 부여 + 처치 보상↑ + 티어 상승 경고.
- **위협 티어**: `abyssTier(level)` = 35에서 1, 이후 +5마다 +1. 변이 확률 `min(0.5, 0.12 + tier*0.06)`.
- **변이 4종**(`data/mutations.js`): 수호(barrier, 보호막이 HP보다 먼저 소모) · 폭심(volatile, 사망 시 폭발 탄막)
  · 점멸(blink, 주기적 순간이동) · 격노(frenzy, 빠르고 강하나 약간 무름). 처치 시 xp·gold ×1.5~1.7.
- **훅**: spawner(스탯·확률), enemyAI(blink 텔레포트·volatile 폭발), main(barrier 흡수·변이 링/심볼 렌더·티어 뱃지·상승 연출).
- **테스트**: abyssTier·applyMutation·spawner 변이 등장·volatile/blink 회귀.

---

## 데이터/상태 요약
- `rs.keystone`(string), `rs.keystoneColor`, 키스톤별 타이머(`rs._guardCd` 등).
- `rs.sigils`(id→count).
- 신규 파일: `data/sigils.js`, `systems/ascension.js`.
- 순수 로직(ascension 롤·mods 합성)은 DOM 비의존 → `node --test`.

## 테스트 방침
- 순수: keystone 매핑 존재성, sigilMods 합성/스택, 각인 롤 미중복·스택 규칙.
- 통합(가능 범위): execute 배수, detonate 폭발 스폰, guard 무효, echo 재시전.
- 기존 회귀 유지(현재 82/82).

## 원칙 준수
무빌드·의존성0·데이터 주도·주석 한국어. 순수 로직 모듈은 DOM/Canvas import 금지.
각 Phase 체크포인트마다 커밋·푸시(main).
