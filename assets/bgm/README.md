# 배경음(BGM) 넣는 법

## 상태별 BGM 매핑 (파일명 고정)

게임 상태에 따라 아래 파일을 **루프 재생**합니다. 없는 파일은 **프로시저럴 칩튠 폴백**.

| 상태 | 파일 |
|---|---|
| 메뉴(타이틀·로드아웃·상점·설정) | `track4.mp3` |
| 필드1 네온 그리드 | `track1.mp3` |
| 필드2 맹독 균열 | `track2.mp3` |
| 필드3 잿불 황야 | `track3.mp3` |
| **보스 등장** | **`boss.mp3`** |

```
webgame/assets/bgm/track1.mp3
webgame/assets/bgm/track2.mp3
webgame/assets/bgm/track3.mp3
webgame/assets/bgm/track4.mp3
webgame/assets/bgm/boss.mp3     ← 보스 전용 (신규)
```

- 형식은 **mp3** 권장. 파일명은 정확히 위와 같이(`boss.mp3` 등).
- 매핑을 바꾸려면 `js/main.js`의 `updateBgm()`만 수정.
- 볼륨·음소거는 게임 내 **설정** 화면에서 조절됩니다.
- 참고: `tools/make-bgm.mjs`는 파일이 없을 때 쓰는 프로시저럴 폴백 생성 스크립트입니다.

## 추천 무료(CC0/무료) 음원 출처

- **Pixabay Music** — https://pixabay.com/music/ (로열티 프리, 상당수 CC0에 준함)
- **OpenGameArt (CC0)** — https://opengameart.org/ (License 필터에서 CC0 선택)
- **Kenney Music** — https://kenney.nl/assets?q=audio (CC0)
- **incompetech (Kevin MacLeod)** — https://incompetech.com/ (CC-BY, **출처 표기 필요**)

> 로그라이크/방치형에는 **차분하게 반복되는 신스웨이브·칩튠 루프**가 잘 어울립니다.
> `synthwave`, `chiptune`, `retro loop`, `driving electronic` 등으로 검색하세요.

## 라이선스 주의
- **CC0**: 표기 없이 자유 사용.
- **CC-BY**: 크레딧(제작자·곡명·출처 링크) 표기 필요 → 배포 시 `about`/크레딧에 명시.
- 상업/광고 게재를 고려한다면 각 음원의 라이선스 조항을 반드시 확인하세요.

## 여러 트랙(선택)
현재는 `track1.mp3` 하나만 로드합니다. 바이옴별 음악 등 확장은 `js/core/audio.js`의
`playBgm()`에서 트랙 목록을 순환하도록 수정하면 됩니다.
