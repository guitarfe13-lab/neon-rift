# 배경음(BGM) 넣는 법

이 게임은 **BGM 파일이 없어도** Web Audio 프로시저럴 칩튠 루프가 자동 재생됩니다.
더 좋은 음악을 원하면 아래 위치에 파일을 넣으세요:

```
webgame/assets/bgm/track1.mp3
```

파일이 있으면 자동으로 루프 재생되고, 없거나 로드 실패 시 프로시저럴 폴백으로 되돌아갑니다.
볼륨·음소거는 게임 내 **설정** 화면에서 조절됩니다.

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
