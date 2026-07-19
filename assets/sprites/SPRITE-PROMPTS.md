# 캐릭터 스프라이트시트 AI 생성 프롬프트

`assets/sprites/<id>_sheet.png` 를 만들기 위한 AI 이미지 생성 프롬프트 모음.
규격은 `README.md`(스프라이트시트 섹션) 기준: **균일 격자 · 정사각 칸 · 투명 배경 · 발이 아래 · 1방향(좌우 반전 자동)**.

> ⚠️ **가장 어려운 건 "같은 캐릭터로 여러 포즈"입니다.** AI는 매번 조금씩 다른 캐릭터를 그리므로,
> 반드시 **캐릭터 일관성 장치**를 쓰세요:
> - **미드저니**: 첫 프레임 생성 → 그 URL을 `--cref <url> --cw 100` 로 나머지 포즈에 참조
> - **Stable Diffusion**: 동일 seed 고정 + **ControlNet(OpenPose)** 로 포즈만 제어(가장 정확)
> - **DALL·E/GPT 이미지**: 첫 이미지를 첨부하고 "same character, change only the pose" 로 이어서 생성
> - **통짜 시트 프롬프트는 격자 정렬·크기가 잘 안 맞습니다** → 포즈를 한 장씩 생성 후 격자로 합치는 방식을 권장.

---

## 🗡️ 검사 (blade) — `blade_sheet.png`

**컨셉**: 청록 네온(#42e6ff)으로 빛나는 **파란 판금 갑옷 기사**, 발광하는 롱소드. 근접 물리·높은 체력의 정통 전사.
**격자**: **3열 × 2행 = 6칸**, 각 칸 **256×256** → 전체 **768×512**.

### 공통 프리픽스(모든 포즈 앞에 붙이기 — 영어가 잘 먹습니다)
```
2D game character sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a blue plate-armored knight with cyan neon energy trim (#42e6ff), holding a glowing cyan longsword,
heroic hero proportions, character centered in frame, feet touching the bottom edge,
flat even lighting, transparent background, no ground, no cast shadow, no glow bloom,
the exact same character in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트 (프리픽스 + 아래 한 줄)
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | idle A | `, idle standing at ease, longsword tip resting on the ground beside the right foot, calm` |
| **1** | idle B | `, idle ready breathing pose, sword held loosely across the body, weight slightly shifted` |
| **2** | attack 준비 | `, attack wind-up, longsword raised high above the head with both hands, coiled to strike` |
| **3** | attack 베기 | `, attack mid-swing, longsword slashing down diagonally, motion blur streak on the blade` |
| **4** | attack 찌르기 | `, attack lunge, thrusting the longsword straight forward, front knee bent, body extended` |
| **5** | 마무리 | `, recovery pose, pulling the sword back to a guard stance across the body` |

- 미드저니 접미사 예: `--ar 1:1 --style raw --cref <프레임0 URL> --cw 100`
- 각 칸을 256×256로 잘라 3×2 격자로 배치(왼→오, 위→아래) → `blade_sheet.png` 저장.

### 완성 후 게임 설정 (`js/data/characters.js`의 blade)
```js
sheet: { cols:3, rows:2, fps:8, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```
- 파일을 `assets/sprites/blade_sheet.png` 로 넣고 새로고침하면 자동 적용됩니다.
- 포즈가 배열과 어긋나면 `idle`/`attack` 숫자만 바꾸면 됩니다(예: 공격을 `[2,3,4]`로 짧게).

### (대안) 통짜 시트 한 번에 — 후보정 필요
```
sprite sheet on a 3 columns by 2 rows uniform grid, the SAME blue neon-armored knight character in 6 poses:
(1) idle standing, (2) idle ready, (3) sword raised overhead, (4) sword slashing down, (5) forward thrust lunge, (6) return to guard.
each cell 256x256, character centered and same size in every cell, transparent background, cel-shaded, identical character design across all cells
```
> 통짜는 칸마다 크기·위치가 흐트러지기 쉬우니, 포토샵/김프에서 **각 칸을 256 격자에 맞춰 재정렬**하세요.

---

## 🔮 마법사 (mage) — `mage_sheet.png`

**컨셉**: 마젠타 네온(#c98bff)의 **짙은 보라 로브 마법사**, 결정 박힌 지팡이 + 부유하는 비전 오브. 유리 대포(낮은 체력·강한 마법).
**격자**: **3열 × 2행 = 6칸**, 각 칸 **256×256** → 전체 **768×512**.

### 공통 프리픽스
```
2D game character sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a slender mage in flowing dark-purple robes with magenta neon energy trim (#c98bff),
holding a glowing crystal-tipped staff, a floating arcane orb nearby, glass-cannon spellcaster,
character centered in frame, feet touching the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same character in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트 (프리픽스 + 아래 한 줄)
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | idle A | `, idle standing calmly, staff planted on the ground beside the body, robe softly settled` |
| **1** | idle B | `, idle floating pose, faint magic sparks swirling around the free hand, robe billowing` |
| **2** | attack 준비 | `, casting wind-up, raising the staff high, a glowing arcane circle forming above` |
| **3** | attack 시전 | `, casting, thrusting the free hand forward releasing a magic bolt, staff channeling energy` |
| **4** | attack 방출 | `, spell burst, body leaning back from the recoil, magic energy exploding from the hand` |
| **5** | 마무리 | `, recovery pose, drawing the staff back, residual magic fading around the fingertips` |

### 완성 후 게임 설정 (`js/data/characters.js`의 mage)
```js
sheet: { cols:3, rows:2, fps:8, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

## 🏹 궁수 (ranger) — `ranger_sheet.png`

**컨셉**: 청록 네온(#7cf9ff)의 **경장 가죽 갑옷 궁수**, 발광 에너지 활 + 등에 화살통. 빠른 공속·관통, 민첩.
**격자**: **3열 × 2행 = 6칸**, 각 칸 **256×256** → 전체 **768×512**.

### 공통 프리픽스
```
2D game character sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a lightweight agile archer in teal-cyan leather armor with cyan neon trim (#7cf9ff),
holding a glowing energy longbow, a quiver of arrows on the back, nimble and fast,
character centered in frame, feet touching the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same character in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트 (프리픽스 + 아래 한 줄)
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | idle A | `, idle standing at ease, bow lowered and held at the side, relaxed watchful stance` |
| **1** | idle B | `, idle alert pose, fingertips touching an arrow at the quiver, scanning ahead` |
| **2** | attack 준비 | `, nocking an arrow onto the bowstring, beginning to raise the bow` |
| **3** | attack 조준 | `, aiming, bowstring fully drawn back to the cheek, glowing arrow ready` |
| **4** | attack 발사 | `, loosing the arrow, bowstring snapping forward, arrow streaking away` |
| **5** | 마무리 | `, recovery pose, lowering the bow while reaching back for the next arrow` |

### 완성 후 게임 설정 (`js/data/characters.js`의 ranger)
```js
sheet: { cols:3, rows:2, fps:8, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

## 💠 정령술사 (elementalist) — `elementalist_sheet.png`

**컨셉**: 하늘색 네온(#5cd0ff)의 **밝은 청색 로브 정령술사**, 손 주위를 도는 얼음·에너지 결정과 오라. 광역 오라·지속·높은 MP.
**격자**: **3열 × 2행 = 6칸**, 각 칸 **256×256** → 전체 **768×512**.

### 공통 프리픽스
```
2D game character sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
an elementalist in flowing light-blue robes with sky-blue neon trim (#5cd0ff),
conjuring floating ice-and-energy crystals with a swirling aura around both hands, area caster,
character centered in frame, feet touching the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same character in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트 (프리픽스 + 아래 한 줄)
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | idle A | `, idle serene pose, a small crystal hovering above the open palm, aura gently pulsing` |
| **1** | idle B | `, idle floating pose, ripples of aura spreading around, robe drifting upward` |
| **2** | attack 준비 | `, gathering power, both hands cupped together condensing a bright ice crystal` |
| **3** | attack 방출 | `, releasing, hands spread wide unleashing a burst of ice shards and aura forward` |
| **4** | attack 확산 | `, area blast, a wide ring of frost energy expanding outward around the body` |
| **5** | 마무리 | `, recovery pose, drawing the hands back as residual frost aura settles` |

### 완성 후 게임 설정 (`js/data/characters.js`의 elementalist)
```js
sheet: { cols:3, rows:2, fps:8, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

> 네 캐릭터 모두 **동일 격자(3×2·256px 칸)·동일 설정 형식**입니다. 색·무기·복장만 프리픽스에서 다릅니다.
> 시트를 `assets/sprites/<id>_sheet.png` 로 넣으면 위 `sheet` 설정을 `characters.js`에 붙여 바로 움직이게 할 수 있습니다.

---

# 보스 스프라이트시트 (3종)

보스는 캐릭터와 **동일한 3열×2행 격자**이되, 거대·위협적이라 **칸당 512×512**(전체 **1536×1024**) 권장.
포즈: `0 대기A · 1 대기B · 2 준비 / 3 공격 · 4 공격절정 · 5 마무리`. 정면·전신(공중형은 부유), 아래가 바닥/발.

> ⚠️ 보스는 지금 단일 이미지(`warden.png` 등)나 코드 스프라이트로 폴백됩니다. `<id>_sheet.png` 를 넣으면
> `bosses.js`에 `sheet` 설정을 붙여 애니를 켤 수 있습니다(공격 애니 재생 트리거는 넣을 때 코드로 함께 연결).

---

## 👁️ 감시자 (warden) — `warden_sheet.png`

**컨셉**: 핑크 네온(#ff5cc8)의 **떠 있는 기계 감시자(센티넬)**, 중앙의 거대한 외눈 + 주위를 도는 방사형 룬 링. 방사 탄막을 뿌린다.
**격자**: 3열×2행=6칸, 각 칸 512×512 → 전체 1536×1024.

### 공통 프리픽스
```
2D game boss sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a massive floating mechanical sentinel with one giant glowing central eye and rotating rune rings around it,
hot-pink magenta neon energy (#ff5cc8), menacing and powerful, ornate armored plating,
boss centered in frame, hovering with the base near the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same boss in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트 (프리픽스 + 아래 한 줄)
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | 대기 A | `, idle hovering, central eye half-closed, rune rings still` |
| **1** | 대기 B | `, idle awakened, eye open and glowing, rune rings slowly rotating` |
| **2** | 준비 | `, charging, rune rings expanding outward, eye brightening intensely` |
| **3** | 공격 | `, firing a radial barrage, energy bolts bursting outward in all directions` |
| **4** | 공격 절정 | `, peak blast, blinding eye flare, maximum omni-directional energy discharge` |
| **5** | 마무리 | `, recovery, rune rings contracting back, eye dimming` |

### 완성 후 (`js/data/bosses.js`의 warden)
```js
sheet:{ cols:3, rows:2, fps:6, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

## 🐍 히드라 (hydra) — `hydra_sheet.png`

**컨셉**: 초록 네온(#5cff9e)의 **다두 독룡**, 여러 개의 뱀 머리와 스멀거리는 맹독 안개. 나선형 독 탄막을 뿜는다.
**격자**: 3열×2행=6칸, 각 칸 512×512 → 전체 1536×1024.

### 공통 프리픽스
```
2D game boss sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a massive multi-headed hydra serpent with several snake heads and drifting toxic mist,
venomous green neon energy (#5cff9e), scaled hide, menacing and powerful,
boss centered in frame, base coiled at the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same boss in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | 대기 A | `, idle, heads lowered and coiled, calm` |
| **1** | 대기 B | `, idle, heads swaying, faint poison mist rising` |
| **2** | 준비 | `, winding up, heads reared back, venom condensing in the mouths` |
| **3** | 공격 | `, spewing venom, heads spitting spiraling toxic projectiles` |
| **4** | 공격 절정 | `, peak spray, explosive spiral of poison from all heads` |
| **5** | 마무리 | `, recovery, heads drawing back, lingering mist` |

### 완성 후 (`js/data/bosses.js`의 hydra)
```js
sheet:{ cols:3, rows:2, fps:6, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

## 🗿 콜로서스 (colossus) — `colossus_sheet.png`

**컨셉**: 주황 네온(#ffb03d)의 **거대한 암석·용암 골렘**, 몸 곳곳에 발광하는 주황 균열. 집중 강타로 짓누른다.
**격자**: 3열×2행=6칸, 각 칸 512×512 → 전체 1536×1024.

### 공통 프리픽스
```
2D game boss sprite, front-facing full-body, clean cel-shaded style with crisp lineart,
a colossal rock-and-lava golem with glowing orange molten cracks across its stone body,
amber-orange neon energy (#ffb03d), hulking and heavy, menacing and powerful,
boss centered in frame, feet planted at the bottom edge, flat even lighting,
transparent background, no ground, no cast shadow, no glow bloom,
the exact same boss in every image, 1:1 square, high detail
```

### 칸별 포즈 프롬프트
| 칸 | 용도 | 포즈 프롬프트(뒤에 이어붙임) |
|---|---|---|
| **0** | 대기 A | `, idle standing tall, arms hanging, cracks dim` |
| **1** | 대기 B | `, idle, molten cracks pulsing like breathing` |
| **2** | 준비 | `, raising a massive fist overhead, cracks glowing bright` |
| **3** | 공격 | `, slamming the fist down, focused ground-pound strike` |
| **4** | 공격 절정 | `, impact shockwave, cracks bursting with lava, debris flying` |
| **5** | 마무리 | `, recovery, straightening back up, cracks cooling` |

### 완성 후 (`js/data/bosses.js`의 colossus)
```js
sheet:{ cols:3, rows:2, fps:6, anims:{ idle:[0,1], attack:[2,3,4,5] } }
```

---

> 보스 3종 모두 **동일 격자(3×2)·512px 칸·동일 설정**입니다. 캐릭터보다 큰 칸(512)만 다릅니다.
> `<id>_sheet.png` 를 넣고 알려주시면 `bosses.js`에 `sheet` 설정 + **보스 공격 시 attack 애니 재생** 코드를 함께 연결하겠습니다.
