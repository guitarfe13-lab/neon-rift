# 게임플레이 스크린샷 넣는 법

상세 페이지(`neon-rift.html`)의 스크린샷 자리는 **파일이 있으면 실제 캡처로, 없으면 자리표시 텍스트**로 표시됩니다.
아래 파일명 그대로 이 폴더에 넣으면 즉시 반영됩니다(새로고침).

| 파일명 | 화면 |
|---|---|
| `neon-rift-battle.png` | 전투 화면(HUD 초상·HP/MP·몹 체력바) |
| `neon-rift-levelup.png` | 레벨업 3택 선택 |
| `neon-rift-evolve.png` | 스킬 진화 |
| `neon-rift-boss.png` | 보스전(하단 보스 초상·HP·스킬명) |
| `neon-rift-shop.png` | 메타 상점(소울·환전·해금) |

## 캡처 방법
1. 게임 실행: `node serve.mjs` → http://localhost:8080/play.html
2. 원하는 장면에서 캡처(Windows: `Win+Shift+S`).
3. **16:9 비율** 권장(예: 1280×720 또는 게임 캔버스 960×540). PNG로 저장.
4. 위 파일명으로 이 폴더에 저장.

> 새 게임을 추가하면 그 게임 상세 페이지의 `data-shot` 경로에 맞춰 여기에 캡처를 넣으면 됩니다.
