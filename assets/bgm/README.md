# 배경음(BGM) 넣는 법

## 플레이리스트 (track1~5)

게임은 `track1.mp3 → track2.mp3 → … → track5.mp3`를 **순서대로 재생하고, 끝나면 다음 곡**으로 넘어갑니다.
없는 트랙은 자동으로 건너뛰고, **하나도 없으면 프로시저럴 칩튠 폴백**이 재생됩니다.
→ **곡을 늘리려면 파일만 추가**하면 됩니다(코드 수정 불필요):

```
webgame/assets/bgm/track1.mp3   ← 현재: Suno 중세풍
webgame/assets/bgm/track2.mp3   ← 추가 예정
webgame/assets/bgm/track3.mp3
webgame/assets/bgm/track4.mp3
webgame/assets/bgm/track5.mp3
```

- 형식은 **mp3** 권장(브라우저 호환·용량). 파일명은 정확히 `track2.mp3`처럼.
- 볼륨·음소거는 게임 내 **설정** 화면에서 조절됩니다.
- 참고: `tools/make-bgm.mjs`는 파일이 하나도 없을 때 쓰는 프로시저럴 폴백을 만드는 스크립트입니다.

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
