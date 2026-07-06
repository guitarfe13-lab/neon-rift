# AI 이미지 생성 프롬프트 (사람/몬스터 스프라이트)

미드저니/DALL·E/Stable Diffusion 등에 아래 프롬프트로 생성 → 배경 제거 → 리사이즈 → 정확한 파일명으로
`assets/sprites/`(캐릭터·몬스터·보스), `assets/bg/`(배경)에 저장하면 게임이 자동 사용합니다.

## 일관성 팁 (중요)
- **모든 스프라이트를 같은 모델·같은 스타일 문구로** 한 번에 생성해야 톤이 맞습니다.
- 아래 **공통 스타일**을 각 프롬프트 끝에 그대로 붙이세요.
- (미드저니 사용 시 `--ar 1:1`, 같은 `--style`/시드 유지 권장)

### 공통 스타일 (캐릭터·몬스터·보스 끝에 붙이기)
```
front-facing full-body game character, centered, plain flat background,
dark fantasy medieval style, clean cel-shaded, soft rim light, crisp edges,
high detail, consistent art style, no text, no border, no watermark
```
> AI는 완전 투명 배경을 잘 못 만듭니다 → **단색 배경(예: 흰색/마젠타)으로 생성 후 remove.bg 등으로 배경 제거**.

## 캐릭터 (assets/sprites/)
- **blade.png** — `armored knight holding a glowing steel sword, cyan-blue armor trim, heroic`
- **mage.png** — `hooded arcane mage holding a glowing orb staff, deep purple robes, mysterious`
- **ranger.png** — `agile hooded archer drawing a bow, teal leather armor, quiver`
- **elementalist.png** — `mystic elementalist with floating ice crystal shards, ice-blue robes, serene`

## 몬스터 (assets/sprites/)
- **grunt.png** — `small round red slime creature with two glowing eyes, cute-menacing`
- **runner.png** — `fast sleek orange insectoid dasher, pointed forward body, sharp legs`
- **tank.png** — `bulky armored purple golem, heavy stone plates, single glowing eye`
- **shooter.png** — `floating cyan eyeball turret with bony spikes, single big eye`
- **splitter.png** — `green gelatinous blob creature with a bright glowing nucleus`
- **splitling.png** — `tiny green slime blob, small version of the splitter`
- **charger.png** — `orange horned charging beast with two large forward horns, angry`

## 보스 (assets/sprites/, 512×512 권장)
- **warden.png** — `massive pink armored warden boss wearing a crown, multiple glowing eyes, imposing`
- **hydra.png** — `green multi-eyed hydra boss, ornate serpentine armor, menacing`
- **colossus.png** — `huge orange stone-and-ember colossus boss, molten glowing cracks, towering`
> 보스는 공통 스타일에 `large imposing boss, ornate, dramatic lighting` 추가.

## 배경 (assets/bg/, 512×512, 이음매 없는 타일)
- **neon_grid.png** — `seamless tileable top-down dark arena floor with faint cyan neon grid lines`
- **toxic_rift.png** — `seamless tileable top-down toxic swamp ground, sickly green glow, dark, wet`
- **ember_wastes.png** — `seamless tileable top-down cracked volcanic rock ground, glowing orange embers, dark`
> 배경 공통: `seamless tileable texture, no characters, no text, top-down view, dark fantasy`.

## 워크플로우 요약
1. 위 프롬프트로 생성(캐릭터/몬스터는 정면 전신, 단색 배경).
2. **remove.bg** 등으로 배경 제거 → 투명 PNG.
3. 리사이즈: 캐릭터·몬스터 **256×256**, 보스 **512×512**, 배경 **512×512**.
4. **정확한 파일명**으로 저장(위 목록). 폴더: 스프라이트=`assets/sprites/`, 배경=`assets/bg/`.
5. 넣은 뒤 알려주시면 커밋·푸시하겠습니다. (없는 파일은 자동으로 지금 네온으로 폴백)
