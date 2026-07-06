# Claude Design 에셋 생성 프롬프트 (스킬 아이콘·이펙트·스프라이트)

생성 AI = **Claude**. Claude는 **SVG(벡터)** 를 매우 잘 만들며, 투명 배경·글로우·일관 지오메트리에 강합니다.
따라서 **아이콘·이펙트는 SVG로**, 사진풍 캐릭터는 raster AI 병행을 권장합니다.
게임 로더는 **`.svg` 우선, 없으면 `.png`** 를 자동 사용하므로 Claude가 준 SVG를 그대로 저장하면 됩니다.

## 사용법
1. 아래 **공통 지시(디자인 시스템)** 를 프롬프트 맨 앞에 붙입니다.
2. 각 항목의 `subject`를 이어 붙여 Claude에게 요청 → **SVG 코드**를 받습니다.
3. 받은 코드를 **`<파일명>.svg`** 로 저장해 해당 폴더에 넣습니다.
4. **일관성**: 한 세션에서 같은 지시로 한 번에 여러 개를 요청하면 톤이 맞습니다.

---

## 공통 지시 (프롬프트 앞에 붙이기)

```
You are a game UI icon designer. Output ONLY a single self-contained SVG (no markdown fence, no text).
- viewBox="0 0 64 64", transparent background, centered composition with ~6px padding.
- Style: dark-fantasy NEON flat-vector. Crisp silhouette, 1 clear focal glyph.
- Add a soft outer glow using <filter><feGaussianBlur stdDeviation="1.5"/></filter> on the main shape.
- Use the given accent color for the glyph + a subtle darker inner fill. No text, no border, no watermark.
- Keep it readable at 32px. Consistent line weight across the set.
Subject:
```

### 원소별 강조색 (accent)
| 원소 | 색 |
|---|---|
| 물리(physical) | `#cfe3ff` 은백 |
| 비전(arcane) | `#c98bff` 보라 |
| 화염(fire) | `#ff6a3d` 주황 |
| 냉기(ice) | `#8bd8ff` 하늘 |
| 번개(lightning) | `#b28bff` 전기보라 |
| 신성(holy) | `#ffe58a` 금 |
| 독(poison) | `#9cff8b` 연두 |

---

## 1) 스킬 아이콘 → `assets/skills/<id>.svg`

`<id>.svg`로 저장. 아래 `accent` 색 + `subject`를 공통 지시 뒤에 붙이세요.

### 투사체
- **strike** (기본 타격, 물리 `#cfe3ff`) — `a single sharp diagonal sword slash / blade cut with motion streak`
- **blade_orbit** (검기 투사, 물리 `#cfe3ff`) — `a crescent sword-energy wave projectile`
- **twin_shot** (쌍발 사격, 물리 `#8ff0ff`) — `two parallel arrow bolts flying right`
- **arcane_bolt** (비전 화살, 비전 `#c98bff`) — `a glowing arcane dart with small orbiting runes`
- **spread_shot** (산탄, 물리 `#ffd166`) — `three diverging arrowheads in a fan`
- **fireball** (화염구, 화염 `#ff6a3d`) — `a burning sphere with trailing flames`
- **ice_shard** (얼음 파편, 냉기 `#9fe8ff`) — `a jagged sharp ice crystal shard`
- **holy_lance** (신성 창, 신성 `#ffe58a`) — `a radiant golden spear with light rays`
- **ice_lance** (얼음창, 냉기 `#a9e8ff`) — `a long sharp icicle spear`

### 빔
- **laser** (레이저, 비전 `#7cf9ff`) — `a horizontal energy beam line with a bright core and lens flare`
- **rail** (레일건, 물리 `#a0f0ff`) — `a heavy piercing rail beam bolt`

### 궤도
- **orbit_blade** (회전 검, 물리 `#ff8be0`) — `two swords orbiting around a central dot, circular motion arcs`
- **frost_ring** (서리 고리, 냉기 `#8bd8ff`) — `a ring of small ice crystals orbiting a center`

### 오라
- **frost_aura** (서리 오라, 냉기 `#5cd0ff`) — `concentric frost rings with a snowflake center`
- **flame_aura** (화염 오라, 화염 `#ff7a3d`) — `concentric fire rings radiating outward`
- **holy_field** (신성 장판, 신성 `#ffe58a`) — `radiant concentric holy rings, sun-like`
- **venom_cloud** (맹독 구름, 독 `#9cff8b`) — `a toxic gas cloud with rising bubbles`
- **quake** (대지 진동, 물리 `#d9b38c`) — `cracked ground with expanding shockwave rings`

### 연쇄
- **chain_spark** (연쇄 번개, 번개 `#b28bff`) — `a forked lightning bolt jumping between two nodes`
- **arc_whip** (전격 채찍, 번개 `#8bb8ff`) — `an electric whip lash arcing`

### 소환
- **turret** (포탑 드론, 물리 `#8effc7`) — `a small hovering mechanical turret drone with a barrel`
- **spirit** (정령 드론, 비전 `#8be0ff`) — `a floating spirit wisp orb with a small tail`

### 진화(강화판) — 화려하게: 공통 지시에 `epic evolved, more particles, brighter glow` 추가
- **blade_storm** (폭풍검, 물리 `#8ffcff`) — `many crescent sword waves in a storm`
- **arcane_storm** (비전 폭풍, 비전 `#e0a0ff`) — `a swirling arcane vortex of bolts`
- **prism_beam** (프리즘 빔, 비전 `#bff8ff`) — `a prism splitting into multiple bright beams`
- **saw_storm** (톱날 폭풍, 물리 `#ffb0ee`) — `multiple spinning sawblades`
- **blizzard** (눈보라, 냉기 `#bfefff`) — `a swirling snowstorm burst`
- **tempest** (폭풍우, 번개 `#d0b8ff`) — `a lightning storm with many forks`

---

## 2) 스킬 이펙트 스프라이트 → `assets/fx/<name>.svg` *(선택 · 연동 필요)*

현재 게임은 이펙트(투사체/빔/오라 펄스/연쇄/폭발/처치 파티클)를 **코드로** 그립니다.
이미지 이펙트로 교체하려면 별도 연동이 필요합니다(원하면 `fx` 레이어를 추가해 드립니다). 미리 만들 프롬프트:

공통: 위 지시에서 viewBox를 `0 0 128 128`로, `subject`만 교체.
- **fx_hit** — `a small radial spark burst, white-yellow, transparent`
- **fx_explosion** — `a bright expanding explosion ring with sparks`
- **fx_aura_pulse** — `an expanding translucent shockwave ring`
- **fx_beam** — `a long horizontal energy beam with glowing core`
- **fx_chain** — `a jagged lightning arc between two points`
- **fx_levelup** — `an upward golden burst with sparkles`

> 연동을 원하면: "fx 이미지 시스템 추가해줘" 라고 하시면 스킬/이벤트별로 이 스프라이트를 띄우도록 구현합니다.

---

## 3) 스프라이트 → `assets/sprites/<id>.svg` , 배경 → `assets/bg/<id>.svg`

- **캐릭터/몬스터**: 이미 raster PNG가 있습니다. 벡터 톤으로 통일하려면 Claude로 SVG 생성도 가능:
  공통 지시에서 viewBox `0 0 128 128`, `front-facing full-body, flat-vector, dark fantasy` + 아래 subject(기존 [AI-PROMPTS.md](sprites/AI-PROMPTS.md)의 설명 재사용).
  - 예) `blade` — `armored knight holding a glowing steel sword, cyan-blue`
  - 파일명은 스프라이트 id와 동일(`blade`, `mage`, `grunt`, `warden` …). SVG면 `.svg`, raster면 `.png`.
- **배경**: `seamless tileable top-down texture`. Claude SVG로 타일 패턴 생성 가능(viewBox `0 0 256 256`, `<pattern>` 사용 권장). 파일명 `neon_grid` / `toxic_rift` / `ember_wastes`.

> 참고: 디테일한 회화풍 캐릭터는 raster AI(미드저니/SD)가 유리하고, **아이콘·이펙트·타일·플랫 캐릭터는 Claude SVG가 유리**합니다. 로더가 `.svg`→`.png` 순으로 읽으니 섞어 써도 됩니다.

---

## 저장 위치 요약
| 종류 | 폴더 | 파일명 |
|---|---|---|
| 스킬 아이콘 | `assets/skills/` | `<스킬id>.svg` |
| 스킬 이펙트(선택) | `assets/fx/` | `fx_<name>.svg` |
| 캐릭터/몬스터/보스 | `assets/sprites/` | `<id>.svg` 또는 `.png` |
| 배경 | `assets/bg/` | `<바이옴id>.svg` 또는 `.png` |
