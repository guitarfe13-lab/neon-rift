# 스킬 아이콘(선택) 넣는 법

스킬 아이콘은 **코드로 자동 생성**(타입별 네온 글리프)되어 지금도 표시됩니다.
직접 만든 아이콘으로 바꾸려면 이 폴더에 **투명 배경 정사각 PNG**를 넣으세요(없으면 코드 글리프로 폴백).

## 파일명 = 스킬 id (정확히)
`assets/skills/<id>.png`. 예:
- 투사체: `blade_orbit.png` `twin_shot.png` `arcane_bolt.png` `spread_shot.png` `fireball.png` `ice_shard.png` `holy_lance.png`
- 빔: `laser.png` `rail.png`
- 궤도: `orbit_blade.png` `frost_ring.png`
- 오라: `frost_aura.png` `flame_aura.png` `holy_field.png` `venom_cloud.png` `quake.png`
- 연쇄: `chain_spark.png` `arc_whip.png`
- 소환: `turret.png` `spirit.png`
- 진화: `blade_storm.png` `arcane_storm.png` `prism_beam.png` `saw_storm.png` `blizzard.png` `tempest.png`

## 규격
- **정사각 투명 PNG**, 64×64 또는 128×128 권장.
- 아이콘은 카드/우측상단에 **테두리·글로우와 함께** 표시되므로, 아이콘 자체는 여백 약간 두고 중앙 배치.
- AI 생성 예: `game skill icon, <효과 설명>, glowing, transparent background, centered, flat`.
