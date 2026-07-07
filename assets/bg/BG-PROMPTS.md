# 스테이지 배경 생성 스크립트

## 🔁 재생성: `toxic_rift.png` — 맹독 균열 (스테이지 2)

> 기존 이미지는 **위↔아래 반복 시 그래픽이 겹치는 이음매 오류**가 있어 재생성합니다.
> 이번엔 특히 **세로(상하) 이음매**가 완벽해야 합니다 — 아래 프롬프트에 그 요구를 강하게 넣었습니다.

**컨셉(한국어):** 독에 침식된 균열 지대의 바닥. 아주 어두운 녹색·검정 부식토 위로
**독성 초록 균열(맥)** 이 은은하게 발광하며 전면에 고르게 퍼져 있다. 작은 산성 웅덩이와
포자 얼룩이 드문드문. 큰 오브젝트·중앙 문양 없음. 포인트 색 `#78ff8c`, 바탕 `#0c1a10` 부근.

**프롬프트(복사용):**
```
seamless tileable texture, PERFECT vertical tiling: the TOP edge must continue exactly into the BOTTOM edge with no visible seam or overlapping shapes, also tiles left-to-right, top-down orthographic game ground texture, dark muted low-contrast background, uniform flat lighting, no vignette, no focal point, evenly distributed pattern, no large objects crossing the edges, no text --
toxic rift floor: very dark green-black corroded ground (#0c1a10), thin glowing toxic green cracks and veins (#78ff8c) spreading evenly across the whole tile, a few small acid puddles and faint spore stains, subtle rocky grain, poisonous sci-fi mood, neon roguelike game background, 1024x1024
```

**네거티브 프롬프트:**
```
visible seam, misaligned edges, duplicated overlapping shapes at borders, horizon, sky, walls, perspective, 3d depth, vignette, strong highlights, centered emblem, single large object, borders, frame, text, watermark
```

**생성 후 검증(필수):** 포토샵/김프 **Offset 필터로 Y를 +512(이미지 절반)** 밀어보세요.
가로 방향 가운데에 띠(이음매)가 보이면 실패 → 도장 툴로 메꾸거나 재생성.
Stable Diffusion이라면 **tiling 옵션을 켜는 것**이 가장 확실합니다.
완성본을 `assets/bg/toxic_rift.png`로 덮어쓰면 즉시 적용(새로고침).

---

# 신규 3종 (스테이지 4~6)

AI 이미지 생성기(미드저니/DALL·E/Stable Diffusion 등)에 붙여넣을 프롬프트입니다.
생성 후 아래 파일명 그대로 `assets/bg/`에 넣으면 즉시 적용됩니다(새로고침).

| 파일명 | 스테이지(4~6) | 분위기 |
|---|---|---|
| `frost_core.png` | 서리 코어 | 얼어붙은 데이터 코어, 남색+얼음빛 |
| `violet_abyss.png` | 보랏빛 심연 | 공허의 흑요석 바닥, 보라 룬 |
| `aurum_circuit.png` | 황금 회로 | 검은 기판 위 금색 회로 |

---

## ⚠️ 공통 규격 — 반드시 지킬 것

게임은 이 이미지를 **가로·세로 양방향으로 무한 반복(타일)** 하며 스크롤합니다.
따라서 **네 변이 모두 이어져야** 합니다: **위 가장자리 ↔ 아래 가장자리**, **왼쪽 ↔ 오른쪽**이
맞닿았을 때 선·무늬·밝기가 끊기지 않아야 합니다.

- **크기**: 정사각 **1024×1024**(권장) 또는 512×512. PNG, 불투명.
- **시점**: 완전한 **탑다운(수직 부감) 바닥 텍스처**. 벽·지평선·하늘 금지.
- **밝기·대비**: 어둡고(저명도) **저대비**. 캐릭터·몬스터·아이템이 위에 올라가므로
  배경이 튀면 안 됩니다. 밝은 포인트는 은은한 발광 정도만.
- **균일 조명**: 한쪽에서 비추는 광원·그림자 방향·비네트(가장자리 어두워짐) 금지
  → 타일 반복 시 격자 티가 납니다.
- **포컬 금지**: 중앙에 큰 문양·눈에 띄는 단일 오브젝트 금지(반복되면 도배 티).
  무늬는 전면에 고르게 분산.
- **가장자리 주의**: 큰 오브젝트가 이미지 가장자리에 걸치면 이음매가 티 남
  → 가장자리는 잔무늬만.
- 텍스트·서명·워터마크 금지.

**공통 영어 키워드(모든 프롬프트 앞에 사용):**
```
seamless tileable texture, tiles perfectly in all directions (top edge connects to bottom edge, left edge connects to right edge), top-down orthographic game ground texture, dark muted low-contrast background for a neon action game, uniform flat lighting, no vignette, no shadows from a single light source, no focal point, evenly distributed pattern, no text, no watermark
```

**공통 네거티브 프롬프트:**
```
horizon, sky, walls, perspective, 3d depth, vignette, strong highlights, centered emblem, single large object, borders, frame, text, watermark, signature, people, creatures
```

### 이음매(Seamless) 검증법
포토샵/김프에서 **Offset(오프셋) 필터로 X·Y를 각각 이미지의 절반만큼 밀어보세요**
(1024px이면 +512, +512). 이미지 중앙에 십자(十) 모양 이음매가 보이면 실패 →
그 부분을 도장 툴로 메꾸거나, "seamless" 강도를 높여 재생성하세요.
Stable Diffusion은 **tiling 옵션을 켜면** 자동으로 네 변이 연결됩니다(가장 확실).

---

## 1) `frost_core.png` — 서리 코어 (스테이지 4)

**컨셉(한국어):** 얼어붙은 거대 서버 코어의 바닥. 짙은 남색 얼음판 아래로 청록 회로의
맥이 희미하게 비치고, 표면엔 가는 성에·머리카락 같은 균열이 고르게 퍼져 있다.
차갑고 고요한 느낌. 포인트 색 `#8bd8ff`, 바탕 `#0d1a2c` 부근.

**프롬프트(복사용):**
```
seamless tileable texture, tiles perfectly in all directions (top edge connects to bottom edge, left edge connects to right edge), top-down orthographic game ground texture, dark muted low-contrast background, uniform flat lighting, no vignette, no focal point, evenly distributed pattern, no text --
frozen data-core floor: deep navy blue ice sheet (#0d1a2c), faint cyan circuit veins (#8bd8ff) glowing dimly beneath translucent ice, thin frost patterns and hairline cracks spread evenly, subtle hexagonal panel seams, cold sci-fi atmosphere, neon roguelike game background, 1024x1024
```

---

## 2) `violet_abyss.png` — 보랏빛 심연 (스테이지 5)

**컨셉(한국어):** 공허에 떠 있는 흑요석(검보라 유리질) 바닥. 표면에 마모된 마법 룬·
글리프가 은은한 마젠타 빛으로 드문드문 새겨져 있고, 아주 옅은 성운 빛이 감돈다.
신비하고 불길한 느낌. 포인트 색 `#c98bff`, 바탕 `#150c24` 부근.

**프롬프트(복사용):**
```
seamless tileable texture, tiles perfectly in all directions (top edge connects to bottom edge, left edge connects to right edge), top-down orthographic game ground texture, dark muted low-contrast background, uniform flat lighting, no vignette, no focal point, evenly distributed pattern, no text --
void abyss floor: dark violet obsidian glassy stone (#150c24), scattered small worn arcane glyphs and rune fragments etched into the surface glowing faint magenta (#c98bff), very subtle nebula sheen, thin cracks, mysterious occult sci-fi mood, neon roguelike game background, 1024x1024
```

---

## 3) `aurum_circuit.png` — 황금 회로 (스테이지 6)

**컨셉(한국어):** 검은 기판(PCB) 위에 금색 회로 배선이 얇게 뻗어 있는 바닥.
육각 패널 이음새와 작은 앰버색 발광 점이 고르게 흩어져 있다. 값비싸고 위험한
최종 구역 느낌. 포인트 색 `#ffd166`, 바탕 `#191307` 부근.

**프롬프트(복사용):**
```
seamless tileable texture, tiles perfectly in all directions (top edge connects to bottom edge, left edge connects to right edge), top-down orthographic game ground texture, dark muted low-contrast background, uniform flat lighting, no vignette, no focal point, evenly distributed pattern, no text --
golden circuit board floor: near-black dark bronze PCB surface (#191307), thin gold circuit traces (#ffd166) branching evenly across the whole tile, subtle hexagonal armor plate seams, tiny warm amber glow dots as micro LEDs, luxurious dangerous final-zone mood, neon roguelike game background, 1024x1024
```

---

## 넣은 뒤 확인
1. 파일 3개를 `assets/bg/`에 저장 → 게임 새로고침.
2. 4스테이지(서리 코어)부터 순서대로 배경이 바뀌는지 확인
   (스테이지 순서: 네온 그리드 → 맹독 균열 → 잿불 황야 → **서리 코어 → 보랏빛 심연 → 황금 회로** → 반복).
3. 걸어다니며 **격자 이음매가 보이면** 위 "이음매 검증법"으로 수정.
4. 이미지가 없어도 각 스테이지의 전용 그라디언트+그리드 색으로 폴백되니 게임은 깨지지 않습니다.
