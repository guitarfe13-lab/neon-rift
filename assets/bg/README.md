# 배경 이미지 넣는 법

이 폴더에 **바이옴별 배경 PNG**를 넣으면 그 이미지를 배경으로 사용합니다(시차 타일링).
**없으면 지금의 네온 그라디언트+그리드로 폴백**됩니다.

## 파일명(정확히 이대로) — 6개
| 파일 | 바이옴 | 상태 |
|---|---|---|
| `neon_grid.png` | 네온 그리드 | 있음 |
| `toxic_rift.png` | 맹독 균열 | 있음 |
| `ember_wastes.png` | 잿불 황야 | 있음 |
| `frost_core.png` | 서리 코어(4스테이지) | **생성 필요 → `BG-PROMPTS.md`** |
| `violet_abyss.png` | 보랏빛 심연(5스테이지) | **생성 필요 → `BG-PROMPTS.md`** |
| `aurum_circuit.png` | 황금 회로(6스테이지) | **생성 필요 → `BG-PROMPTS.md`** |

> 신규 3종의 **복사용 생성 프롬프트**(상하·좌우 이음매 연결 규격 포함)는 [`BG-PROMPTS.md`](BG-PROMPTS.md) 참고.

## 이미지 규격
- **형식**: PNG(투명 불필요, 불투명 바닥/지형 텍스처).
- **타일 방식**: 게임이 이미지를 **반복(타일)** 하며 카메라 시차로 스크롤합니다.
  → **이음매 없는(seamless) 타일 텍스처**가 가장 자연스럽습니다. 크기 **512×512** 권장.
- 전체 장면 1장(비반복)을 원하면 요청 주세요 — cover 방식으로 바꿔드립니다.

## 어디서 만드나
- AI 이미지 생성: "seamless tileable dungeon floor texture", "top-down grass/lava ground, seamless" 등.
- 무료 CC0: OpenGameArt(CC0), Kenney(배경/타일셋), itch.io. 라이선스 확인.
