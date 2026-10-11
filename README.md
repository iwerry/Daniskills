<div align="center">

# 🎬 Daniskills 3.3 — Cinematic Intelligence Architecture

### Turn simple prompts into cinematic productions — and keep, audit, edit and improve the whole film.
### One engine-agnostic system: story → cinema → AI generation → continuity → QA → edit → post → distribution → learning

**An AI audiovisual production engine that replaces empty adjectives with real optical and color parameters** — FOV in degrees, Kelvin, 180° shutter, T-stop, saturation 0–100, HEX tints — instead of `ultra real, 8k, masterpiece`.

`62 skills` · `69 Visual DNA styles (each with Color Grading DNA)` · `25 pipelines` · `22 profiles` · `31 engines + 20 adapters` · `35 task routes` · `13 quality gates` · `16 style blends` · `21 LUT presets`

*Credits: **Daniel Rodrigues** · Daniel Rodrigues*

*Runs on Claude, ChatGPT, Gemini, DeepSeek, Qwen, Kimi and any capable LLM — see `UNIVERSAL_PROMPT.md`.*

</div>

## 🧠 Multimodal Quality System

Daniskills 3.3 now applies **Hardness + Anti-Slop + Smart Sharpening** to image, audio, video, scripts and text.

`INTENT → HARDNESS → ANTI-SLOP → SMART SHARPEN → GENERATE → QA → POST SHARPEN → FINAL QA`

### Quality functions

```ts
import { hardness, smartSharpen, antiSlop, antiSlopScore, humanizeText, postSharpenPlan, qualityLoop } from './skillsData';

const spec = smartSharpen({ modality: 'video', intent: '...', destination: 'social' });
const audit = antiSlop(prompt, 'video');
const final = qualityLoop({ modality: 'video', intent: '...', destination: 'social' }, prompt);
```

The system resolves technical decisions instead of adding empty adjectives. `compilePrompt()` and `compileShot()` automatically run the Quality Loop and attach Anti-Slop scores, findings and fixes; a `REGENERATE` result calls for localized revision. `compilePromptForDelivery()` and `compileShotForDelivery()` enforce the delivery gate: `PASS` is allowed, `POLISH` requires explicit policy acceptance, and `REGENERATE`/`UNASSESSED` are blocked by default. `qualityDeliveryGate()` supports explicit overrides; `assertDeliverable()` throws when delivery is blocked. `compilePrompt()` remains available for drafting and diagnostics. Video keeps FOV in degrees, Kelvin and 180° shutter by default. Real brands remain behind G9; faces and voices require consent. Post-production sharpening is planned by destination and modality.

### Automated checks

The repository includes a TypeScript/Vitest test suite and a Python contract validator. Run locally with Node.js 22+ and Python 3.12+:

```bash
npm install
npm test
npm run typecheck
```

`npm test` runs the Quality Gate unit/integration tests and `scripts/validate_contract.py`. GitHub Actions repeats these checks on pushes to `main` and pull requests targeting `main`. The integration tests cover blocked shot delivery, explicit overrides, prompt delivery decisions, and Quality Loop behavior with Brand Mode G9 active or inactive.

See `DANISKILLS_QUALITY_SYSTEM_v3.3.md` for the complete procedure.

---

## 🧭 What is this

Daniskills is a *skill* that turns ordinary requests ("make a Reel about my coffee shop") into **structured professional production**: script, storyboard, shot list, per-engine generation prompts, synced audio, film-emulation post, editorial calendar and performance analysis.

> **A prompt is not guesswork. It is cinematography, written down.**

The engine never describes a scene with pretty adjectives. It resolves the shot into **geometry, physics and color science**: field of view in degrees, motivated camera movement, one dominant light source, Kelvin temperature, contrast ratio, HEX palette, numeric saturation and tint, and diegetic audio with timestamps.

Visual identity is **locked before generation** (Style Bible) and composition is **locked in a still before animation** (Hero Frame First). That is what separates an AI-looking clip from a clip with a director's intent.

---

## 🚀 What's new in Daniskills 3.3 — Cinematic Intelligence Architecture

> **Not a bigger skill. A smarter cinematic system.** See `ARCHITECTURE.md`.

| Layer | What 3.3 adds |
|---|---|
| **Cinematic Memory** | Skill 65 Project Bible (`PROJECT.md` = truth vs `STYLE_BIBLE.md` = language, 16 templates in `PROJECT_BIBLE_TEMPLATE/`) · Skill 70 Continuity Graph + `AssetGraph` ("if Helena's hair changes, which shots regenerate?") · Skill 74 Learning Loop |
| **Intent ≠ syntax** | Skill 66 Shot DNA + Prompt Compiler: one `ShotSpec` → `compileShot()` → Veo / Kling / Seedance / Hailuo / Wan / Hunyuan / Higgsfield / Flux / Midjourney / ComfyUI dialects through 20 `engine_adapters` |
| **Model Intelligence** | Skill 67: best model for *this shot, now, with these assets and budget* + a 10-test benchmark suite (T001–T010, results empty until you measure) |
| **Direction** | 59 Cinematic Grammar · 60 Cinematography Director ("why this lens?") · 61 Acting Director 2.0 (beats, subtext) · 62 Sound Cinema Engine (silence as an event) · 69 Edit Engine |
| **Audit → Critique → Polish** | 63 AI Artifact Detector · 64 Cinema Audit (12 weighted dimensions) + Cinema Slop Detector (15 rules) · gates G10–G13 · `/cinema:polish` regenerates only failing shots |
| **Professional pipeline** | 71 Software Workflow Bridge (Premiere, After Effects, Photoshop, Illustrator, DaVinci Resolve, CapCut, Blender, Higgsfield, Magnific, Topaz — `TOOLKIT_2026.md`) · 72 Deliverables Studio (screenplay, treatment, pitch deck, storyboard PDF) · 73 Code-Driven Animation · 75 Micro-Drama Showrunner |
| **Look development** | 10 new Visual DNAs (`CINEMANOVO`, `SERTAOBLEACH`, `TROPICALNOIR`, `PRECISIONTHRILLER`, `SLOWCINEMA`, `WUXIAINK`, `DONGHUA3D`, `SOLARPUNK`, `BRUTALISTSCIFI`, `VERTICALDRAMA`) · 4 blend recipes · 9 LUT presets · Director Profiles · Cinematic Design System (tokens) · Skill 68 Reference Intelligence |
| **Engines** | +8 (Magnific, Topaz Video AI, FLUX Kontext, Qwen-Image, HunyuanVideo, Ideogram, Recraft, Adobe Firefly) — **confidence low, re-verify** |
| **People** | Profiles 19 DoP · 20 Editors/Colorists/VFX · 21 AI Producers & Micro-Drama · 22 Screenwriters & Pitch |

New commands: `/project:init` `/project:audit` `/story:develop` `/story:analyze` `/shot:create` `/shot:audit` `/scene:direct` `/camera:design` `/acting:direct` `/reference:analyze` `/continuity:audit` `/model:benchmark` `/model:recommend` `/prompt:compile` `/cinema:audit` `/cinema:critique` `/cinema:polish` `/cinema:finish` `/edit:cut` `/artifact:check` `/code:animate` `/deliver:screenplay`.

```ts
import { compileShot, compileShotForAll, modelIntelligence, cinemaAudit, polishPlan, cinemaSlop, AssetGraph, sequenceContinuity } from './skillsData';
compileShot(shot, 'veo_3_1');                 // intent → adapter → prompt + warnings
modelIntelligence('S12', { kind: 'video', dialogue: true, durationS: 8, budget: 'medium' });
cinemaAudit({ story: 91, continuity: 71, /* … */ }, findings);   // score + CRITICAL/WARNING + polish list
new AssetGraph().add(...shots).impactOf('Helena');
```

**Honest status.** Benchmark results and the learning loop are *schemas* until you feed them real data. Engines added in 3.3 are from training knowledge (verified 2026-06-30, confidence low). Some v3.1 strings in the JSON and the v3.1 catalog tables remain in Portuguese. Run `python scripts/validate_contract.py` and `tsc --strict` after edits. Audit of the base: `DANI_SKILLS_AUDIT_v3.1.md`.

---

## 🆕 What was new in v3.3 (internal, earlier — now part of this release)

| Upgrade | What it gives you |
|---|---|
| **🎨 Color Grading DNA** | Every one of the 59 styles now carries `color_grading`: `saturation` (0–100), `contrast` curve, `shadow_tint` and `highlight_tint` (HEX), `grain` structure, `dynamic_range` and the closest `lut_match`. Plus a `tables.color_science` reference (saturation scale, contrast vocabulary, grain glossary, tint rules). |
| **➕ 12 new Visual DNAs** | UFOTABLE, MAPPA, WEBTOON, ISEKAI, GHIBLIPUNK, GLASSNOIR, CLAYMORPHISM, LIQUIDMETAL, GLITCHCORE, DREAMCORE, ANALOGDREAM, BIOLUMINESCENT — modern anime compositing, kinetic sakuga, vertical webtoon, isekai key-visual, and the 2025–26 AI-native looks (Flux-era analog, liquid metal, glitchcore, dreamcore, bioluminescent, claymorphism). |
| **🧪 Skill 57 — DNA Blending Lab** | Blend exactly **1 base (60–70%) + 1 accent (30–40%)**, with the accent **isolated on a single element**. Optics inherited from the base, palette and grade interpolated, negative locks merged, conflicts flagged. `blendStyles()` in TypeScript. |
| **🎚️ Skill 58 — Color Grading DNA Engine** | Turns a style into a numeric grading card wired into the Darkroom chain (Skill 25). `gradeCard('UFOTABLE')` returns `color_grading_card.json` matched to a LUT preset. |
| **👥 2 new profiles** | `perfil_17` Independent Animation, Anime & Webtoon · `perfil_18` Art Direction & Signature Look. Existing profiles gained the new styles and skills where they fit. |
| **🔀 New pipeline & route** | `p_signature_style` and `blend_style` — build a reusable, ownable look for a client or channel. |
| **✅ Smarter lint & veto** | New `GRADE_VAGUE` (grade without numbers) and `BLEND_OVERLOAD` (3+ styles) checks; image analysis now returns `color_grading_estimate`; gate G1 now requires the grading card. |
| **🎞️ 2 new LUT presets** | *Portra 400 −0.5EV Analog Dream* and *Anime Compositing Neutral+FX*. |

---

## ⚡ Quick start

```bash
# Generic route — the engine routes by itself
/route "I want a 9:16 Reel of my coffee that never gets cold, 80s style"

# Explicit pipeline
/pipeline:p_social_reel --style SYNTHWAVE --ratio 9:16 --prompt "the coffee that never gets cold"

# NEW: blend two Visual DNAs into a signature look
/blend:NOIR+LIQUIDGLASS --weights 70/30

# NEW: get the numeric grading card for a style
/grade:UFOTABLE

# Reverse-engineer an image and get a recreate-prompt per engine
/route "analyze this image and give me the recreate prompt for Veo"

# Real brand or product in the scene? Brand Mode (opt-in)
/brand:on --marca "X" --produto "Y" --vinculo afiliado
```

**Smart autoload:** Skill 15 (foundation) always · 16 for ComfyUI · 25 when post is requested · 53 on every video · **58 when color/saturation/shadows/grade is mentioned** · **57 when two styles appear** · 55/56 before delivery · **G9** whenever a real brand or product is cited.

---

## 🗂️ The files and how they talk

Core five below; v3.3 adds `ARCHITECTURE.md`, `DANI_SKILLS_AUDIT_v3.1.md`, `TOOLKIT_2026.md`, `UNIVERSAL_PROMPT.md`, `PROJECT_BIBLE_TEMPLATE/`, `scripts/validate_contract.py`, `CHANGELOG.md`.


| File | Role |
|---|---|
| **`BaseSkill.md`** | 🏛️ The constitution: execution protocol, 16 universal laws, optical + color vocabulary, engine knowledge, task modes, quality gates |
| **`daniskills_config.json`** | 💾 Single source of data: models, profiles, skills, styles, pipelines, routes, resolved tables, templates, characters, clients |
| **`skillsData.ts`** | ⚙️ Types + typed loader + resolution engine: `resolveStyle`, `routeTask`, `recommendEngines`, `compilePrompt`, `lintPrompt`, `profileKit`, **`blendStyles`**, **`gradeCard`**, helpers |
| **`skills_cinema_pipeline.md`** | 📚 Catalog: 45 skills + 59 styles + Color Grading table + 18 pipelines + methodology |
| **`profiles_guide.md`** | 👥 18 profiles with pains, technical DNA, skills, styles, engines, pipeline and KPIs pre-resolved |

**ID contract (never break it):** `skill_NN` (01–58; 32–44 = legacy styles), `dna_<alias>` + upper-case `ALIAS`, `perfil_NN`, `p_<pipeline>`, `<engine>` (e.g. `seedance_2_5`), gates `G1–G9`, routes by `id`. Every `.md` cites only IDs that exist in the JSON, and the TS reads the same JSON — the docs never lie about the data.

### Skill vs. Knowledge vs. Visual DNA

| Layer | What it is | Lives in |
|---|---|---|
| **Skill** | an executable ability (script, route an engine, grade, blend) | `skills[]` |
| **Knowledge** | lookup tables: optics, light, camera, engines, markets, color science | `tables{}`, `models[]` |
| **Visual DNA** | a reusable look kit: optics + palette + texture + light + motion + **color grading** | `styles[]` |
| **Blend recipe** | a 70/30 hybrid of two DNAs | `tables.ai_style_mixes` |
| **Profile** | who is asking + the default kit | `profiles[]` |

Rule of thumb: new *look* → style · new *capability* → skill · new *problem owner* → profile · new *reference data* → table.

---

## 🎥 The 5-phase production cycle

```
1 PRE-PRODUCTION  47 Story → 21 Script → 52 Bible → 22/23 Character → 45 Reference analysis → 57 DNA blend → 48 Storyboard
2 PRODUCTION      46 Hero Frame → 53 Engine per shot → 19/20 Direction & camera → Visual DNA → 58 Grade → 24 Acting → 26/49 Audio
3 POST            54 V2V (ordinary video → cinema) → 25 Darkroom/LUT → 26 Mix → 55 QA
4 DISTRIBUTION    17 Hook → 18 Thumb → 29 Calendar (3 hashtags) → 31 Localization → 56 Compliance
5 ANALYTICS       30 Retention & CTR → back to 17/18/21/28
```

### Execution protocol (10 steps, every time)

1. **Route** the request → `routeTask()`
2. **Profile** → `perfil_01–18` inherits styles, engines and pipeline
3. **Style** → `resolveStyle()` — max **1 base + 1 accent** (blend via Skill 57)
4. **Skill chain** → `expandSkillChain()` with dependencies
5. **Style Bible (G1)** → alias + HEX palette + optics + **grading card** locked
6. **Hero Frame First (G2)** → approved still before animating
7. **Feasibility Veto (G3)** → does the plan break physics? Rewrite the plan, not the prompt
8. **Engine per shot** → `recommendEngines()` with `verified_on` + `status`
9. **Compile + Lint (G4)** → `compilePrompt()` → `lintPrompt()`
10. **Deliver** the artifact + one line of assumptions + next steps

---

## 🎨 Visual DNA — 59 styles with resolved optics *and* color science

Each style is a **technical kit**, not a pretty reference: FOV°, camera, lens, aperture, shutter, WB, fps, HEX palette, textures, motion language, light, `prompt_core`, **`color_grading`** and engine affinity per family.

| Family | Aliases |
|---|---|
| Comics | `MIGNOLA` · `SINCITY` · `MOEBIUS` · `WEBTOON` ⭐ |
| Anime | `AKIRA` · `GHIBLI` · `SHINKAI` · `TRIGGER` · `LOFI` · `UFOTABLE` ⭐ · `MAPPA` ⭐ · `ISEKAI` ⭐ · `GHIBLIPUNK` ⭐ |
| 3D animation | `PIXAR` · `SPIDERVERSE` · `ARCANE` |
| Classic / craft | `XEROX` · `UKIYOE` · `PIXELART` · `LAIKA` · `CLAYMATION` · `PAPERCUT` |
| Auteur cinema | `KUBRICK` · `FINCHER` · `VILLENEUVE` · `WONGKARWAI` · `WES` · `NOIR` · `LEONE` · `BURTON` · `NEWHOLLYWOOD70S` · `GLASSNOIR` ⭐ |
| Pop & retro | `KPOP` · `SYNTHWAVE` · `Y2K` · `VAPORWAVE` · `SUPER8` · `GLITCHCORE` ⭐ |
| Documentary | `DOCREAL` · `PLANETEARTH` · `TRUECRIME` · `ANALOGDREAM` ⭐ · `BIOLUMINESCENT` ⭐ |
| Commercial | `KEYNOTE` · `CHEFSTABLE` · `EDITORIAL` · `SPORTS` · `LIQUIDMETAL` ⭐ |
| Design / UI / Edu | `SWISS` · `ARTDECO` · `BLUEPRINT` · `NEUBRUTALIST` · `LIQUIDGLASS` · `CLAYMORPHISM` ⭐ · `KURZGESAGT` · `WHITEBOARD` · `STORYBOOK` |
| Horror | `FOUNDFOOTAGE` · `DREAMCORE` ⭐ |

⭐ = new in v3.3

```bash
/style:MIGNOLA            # by alias
styleAlias: 'SINCITY'     # in TypeScript
/style:dna_wes            # by id
```

### Color Grading DNA — an example

```json
"color_grading": {
  "saturation": 80,
  "contrast": "very high, CG-light overlay punches through crushed cel shadow",
  "shadow_tint": "#0b0b14",
  "highlight_tint": "#ffd23f",
  "grain": "clean digital cel + soft particle-glow bloom, no photographic grain",
  "dynamic_range": "high, HDR compositing range on the light-FX layer",
  "lut_match": "modern anime compositing grade: neutral cel base + saturated elemental light overlay"
}
```

In a prompt this becomes: `Color grade: saturation ~80/100, very high contrast…, shadow tint #0b0b14, highlight tint #ffd23f, grain: …` — never "cinematic color grade".

### Blends that work (Skill 57)

Rule: **1 base (60–70%) + 1 accent (30–40%), the accent isolated on ONE element or surface.** The base owns optics, WB and fps; the accent lends light or texture.

| Recipe | Base | Accent | Weights | Why it works |
|---|---|---|---|---|
| **GHIBLIPUNK** | GHIBLI | AKIRA | 70/30 | natureza gouache + um elemento neon isolado |
| **GLASSNOIR** | NOIR | LIQUIDGLASS | 70/30 | mono clássico + uma superfície de vidro refrativo |
| **NEONOIR** | NOIR | WONGKARWAI | 70/30 | P&B com neon saturado só nas fontes de luz |
| **INKVERSE** | SPIDERVERSE | MIGNOLA | 65/35 | 3D hachurado + blocos de preto sólido |
| **SATURDAYCEL** | XEROX | SYNTHWAVE | 70/30 | linha xerox trêmula + grid/chrome retrô |
| **WESNOIR** | WES | NOIR | 70/30 | simetria planimétrica com luz de slats |
| **ANALOGPIXEL** | ANALOGDREAM | PIXELART | 75/25 | foto quente com HUD/sprites pixelados isolados |
| **CELVERSE** | UFOTABLE | SPIDERVERSE | 70/30 | cel moderno + halftone/misregistration nos impactos |
| **CHROMEKEYNOTE** | KEYNOTE | LIQUIDMETAL | 70/30 | produto minimalista com uma morfose de metal líquido |
| **VHSDREAM** | DREAMCORE | FOUNDFOOTAGE | 70/30 | espaço liminar com ruído de fita e timecode |
| **BIOGHIBLI** | GHIBLI | BIOLUMINESCENT | 70/30 | floresta pintada que brilha à noite |
| **WEBTOONCLAY** | WEBTOON | CLAYMORPHISM | 70/30 | painel vertical com objetos puffy tácteis |

Known conflicts: LAIKA+PIXAR (matéria vs. render); XEROX+KEYNOTE (linha trêmula vs. precisão); PIXELART+PLANETEARTH (grade vs. teleobjetiva); Qualquer mistura de 3+ estilos.

> **🧾 IP:** artist and studio names are **cultural anchors for visual DNA** (technical traits) — not a license to reproduce characters, logos, scenes or trade dress. For commercial use, rely on the `dna_tags` / `prompt_core` fields and keep the IP LOCK.

---

## 🛠️ Supported engines (23 · specs verified 2026-09-20)

| Type | Engines |
|---|---|
| **Video** | `seedance_2_5` (up to 30s, ~50 refs) · `seedance_2_0` · `veo_3_1` (native audio) · `kling_3_0` (multishot/4K) · `grok_imagine_video` · `sora_2` ⚠️ *sunsetting* · `runway_gen_4_5` · `luma_ray3` · `minimax_hailuo` · `wan_2_x` · `ltx_2_x` |
| **Image** | `flux_2` (brand HEX) · `gpt_image_2` (text/UI) · `nano_banana` (4K, ~14 refs) · `seedream_5` · `midjourney` · `grok_imagine_image` |
| **Audio** | `elevenlabs` (VO/SFX/dub) · `suno` (score) · native SCELA audio |
| **Platform / pipeline / LLM** | `higgsfield` (Cinema Studio + Soul ID) · `comfyui` (node DAG, PuLID/IP-Adapter) · `claude` |

**One-line decision rule:** dialogue and rich foley → Veo · cheap multishot/4K → Kling · long clip with many refs → Seedance 2.5 · fast social with sound → Grok · full local control → ComfyUI + LTX/Wan · recurring identity → Soul ID or PuLID (never text description alone) · anime/2D → still in the style first, then i2v, never ask for "3D".

⚠️ *`confidence: low` = specs not verified here; confirm on the platform. Sora 2 is sunsetting — do not start new pipelines on it.*

---

## 👥 18 profiles

Social creators · Motion designers & editors · Agencies · Brand owners & e-commerce · Growth marketers · Advanced AI-creative geeks · EdTech · Food · Fashion & beauty · UX/UI · Real estate · Filmmakers · Music · Games/anime/comics · Documentary & faceless · Cultural institutions · **Independent animation, anime & webtoon (new)** · **Art direction & signature look (new)**.

See `profiles_guide.md` for pains, KPIs, default styles and quick-start commands.

---

## 🧾 Non-IP by default · Brand Mode (G9) by opt-in

The studio is **Non-IP by default** (Law 11, Skill 56, G8): no real brands, trade dress, recognizable voices or scores.

When a request cites a real brand or product, the engine **neither refuses nor ignores it** — it triggers **G9 — Brand Mode**, a consent gate with 5 questions:

1. Which exact brand and product?
2. Relationship: affiliate · sponsored · gifted · no relationship?
3. Do you have the link (if affiliate) and accept labeling it in the description?
4. Does the scene context fit the brand?
5. Organic or paid ad (paid = written authorization)?

**Only with all 5 answers does the mode turn on.** Otherwise it continues Non-IP with a generic substitute (e.g. *"classic black-and-white canvas sneakers, worn rubber sole"*). Even with G9 on, these stay out: real people's face/voice without consent, recognizable score, third-party characters. Disclose whenever there is commission, gifted product or sponsorship. The disclosure label (`#publi`, `#afiliado`) **does not count** among the 3 hashtags. Not legal advice — rules vary by country and platform (FTC, CONAR, EU).

---

## ✅ Quality — gates G1–G9 and the Feasibility Veto

| Gate | What it locks |
|---|---|
| **G1** | Style Bible: alias + HEX palette + optics **+ grading card** before generating |
| **G2** | Hero Frame approved in a still before animating |
| **G3** | Feasibility Veto: no shot violates the engine's physics |
| **G4** | Clean lint: no empty terms, unjustified mm, flat negatives, copy outside the copy list |
| **G5** | Acting audit with <2 symptoms (15 AI symptoms: *frozen blink*, *rubbery limbs*, *drifting eyelines*…) |
| **G6** | Audio/lip-sync: 1 line at a time, ≤25 words/10s, no loops |
| **G7** | Darkroom: stochastic grain on every upscale, halation, tested LUT |
| **G8** | Compliance: Non-IP, consent, synthetic labeling, 3 hashtags, 12%/15% safe zones |
| **G9** | Brand Mode (opt-in, off by default) |

**Feasibility Veto (examples):** chaotic action + `no blur` · micro-acting at FOV ≥94° · 2+ dominant camera devices · on-screen text >6 words in a video engine · crowd with >5 individually acting faces · impossible single-take transformation (except declared LIQUIDMETAL) · **3+ styles in one generation**.

**Lint:** errors `NO_BLUR` · `DURATION` · `SPEECH_LEN` · `ENGINE_SUNSET` · `BRAND_UNGATED` · `BLEND_OVERLOAD` — warnings `EMPTY_TERM` · `MM_NOTATION` · `NEGATIVE_PHRASING` · `FOV_UNIT` · `GRADE_VAGUE` · `HASHTAGS` · `RATIO` · `BRAND_UNLISTED` · `BRAND_NO_DISCLOSURE`.

---

## ⌨️ TypeScript API

```ts
import { resolveStyle, routeTask, recommendEngines, compilePrompt, lintPrompt, profileKit, blendStyles, gradeCard } from './skillsData';

resolveStyle('WES')               // → VisualStyle with optics, HEX, prompt_core and color_grading resolved
routeTask('I want to animate this')  // → route + skills + template + gate
recommendEngines({ kind: 'video', styleAlias: 'KUBRICK', durationS: 12 })  // → engines with verified_on and confidence
profileKit('perfil_18')           // → skills (with deps), styles, engines and pipeline of the profile
blendStyles('GHIBLI', 'AKIRA', 0.7)  // → merged optics/palette/prompt_core/color_grading + conflict flags
gradeCard('UFOTABLE')             // → color_grading_card.json matched to a LUT preset
compilePrompt({ engineId: 'seedance_2_5', blend: { base: 'NOIR', accent: 'LIQUIDGLASS' }, subject, setting, action, camera })
lintPrompt(prompt)                // → errors and warnings before you generate
```

Requirement: `tsconfig` with `"resolveJsonModule": true` (Vite/Next already ship it). Verified with `tsc --strict`.

---

## 🔧 Maintenance

- **New style:** entry in `styles[]` with a unique alias, an existing `family`, `optics.fov_degrees`, HEX, `prompt_core` and a **complete `color_grading`** — the `.md` files and the TS update themselves
- **New blend recipe:** row in `tables.ai_style_mixes.recipes`
- **New engine:** in `models[]` with `verified_on`, `confidence`, `grammar` + `family_routing`
- **Brand watchlist:** `tables.brand_mode.watchlist` (lint trigger)
- **Stale specs:** `staleEngines()` lists what needs re-verification (90-day cycle)

---

## 📈 Distribution & analytics (summary)

- **3 hashtags** per post (brand + niche + format) — the disclosure label is separate
- **Packages:** Essential (3/wk) · Performance (4–5/wk, A/B tests) · Premium (custom)
- **CTR × Retention matrix:** Winner → replicate the mechanic · Oversold by the cover → rewrite the body · Undervalued → new cover/title · Double failure → archive the mechanic
- **Iteration hierarchy:** thumbnail → title → hook (0–10s) → first open loop → body → closer

---

## 👤 Author

**Daniel Rodrigues** · Daniel Rodrigues
*Daniskills 3.3.0 · Cinematic Intelligence Architecture · Color Grading DNA · Style Blending · G9 Brand Mode*

Idea, architecture and creative content: all rights reserved to the author. Contributions and bug reports are welcome via *Issues*.

---

<div align="center">

**From premise to post — with FOV in degrees and numbers in the grade, not empty adjectives.** 🎬

*— Daniel Rodrigues*

</div>


## 🎞️ Sequence continuity QA

`continuityCheck(a, b)` and `sequenceContinuity(shots)` compare adjacent shots using structured facts: camera axis, screen direction, wardrobe, lighting, time, weather, prop state and focal relationship. Findings are deterministic warnings, not semantic interpretation of the edit.

Declare `ShotNode.editorialIntent` when a discontinuity is deliberate:
- `continuity` (default): run all applicable continuity checks.
- `cross_cut`: skip axis and screen-direction checks across the cut.
- `time_jump`: allow wardrobe, lighting, time, weather and prop-state changes.
- `montage`: suppress those continuity warnings for an intentionally discontinuous montage.
- `match_cut`: do not flag a repeated focal relationship as a jump-cut risk.
- `axis_break`: allow a deliberate axis/screen-direction crossing.

The Feasibility Veto remains active regardless of editorial intent.

### Causal state transitions for props

When a prop's structured state changes between adjacent shots, QA checks whether the incoming shot provides a matching `propTransitions` record with the same prop, previous state, next state and a non-empty cause. A matching cause without a linked acting beat receives a traceability warning; a matching cause plus beat is accepted. Without a matching cause, QA emits an `unexplained state transition` warning.

```ts
{
  id: 'B',
  characters: ['Mara'],
  location: 'warehouse',
  props: ['case'],
  prop_state: { case: 'open' },
  propTransitions: [{
    prop: 'case',
    from: 'closed',
    to: 'open',
    cause: 'Mara opens the latch',
    beat: '00:02 Mara lifts the lid'
  }]
}
```

This is structured validation, not automatic narrative understanding. Add transition evidence to the shot where the change becomes true. The checker does not infer custody transfers or unseen actions from prose.

 Use explicit intent only when the cut is designed that way; the tool cannot infer editorial meaning from shot descriptions.

```ts
const issues = sequenceContinuity([
  { id: 'A', characters: ['Mara'], location: 'warehouse', axis: 'north', screen_direction: 'left' },
  { id: 'B', characters: ['Mara'], location: 'warehouse', axis: 'south', screen_direction: 'right',
    editorialIntent: 'axis_break' }
]);
```

---
 
## 🔭 Optical Intelligence (new in 3.3)

Daniskills now includes a structured lens-family catalog and a deterministic optical resolver in `opticsCatalog.ts`. Resolve shot intent, focal length, sensor format, lens family, aperture notation, depth of field and movement into prompt-ready optical language:

```ts
import { resolveOptics } from './opticsCatalog';

const optics = resolveOptics({
  intent: 'portrait',
  focalLengthMm: 85,
  sensorFormat: 'full-frame',
  aperture: 'T2.0',
  depthOfField: 'shallow',
  engine: 'video',
});
```

Catalog families include Cooke S8/i, ARRI Signature Prime, ZEISS Supreme Prime, Leitz SUMMILUX-C, ARRI Master Anamorphic, Atlas Orion, Panavision C-Series, Sony G Master, Sigma Art, Canon RF L, Nikon Z S, vintage character optics, macro/probe, cine zoom and tilt-shift references. Camera-format references cover ARRI, Sony, RED and Canon cinema bodies.

The resolver deliberately distinguishes *format-plausible* from verified mount/image-circle compatibility. Lens families are reference-level data; verify exact SKU, mount, T-stop, minimum focus, breathing, distortion and anamorphic squeeze ratio before using a real camera package. AI model equipment names are semantic cues, not guarantees of physically faithful optics.

See [OPTICAL_INTELLIGENCE.md](./OPTICAL_INTELLIGENCE.md) for the schema, decision rules and tests.


## 🎞️ State Ledger per sequence

`buildStateLedger(shots)` returns ordered per-shot prop snapshots and deterministic findings for unexplained state deltas, mismatched transition origins/destinations, undeclared props, missing causes and missing acting-beat links. `AssetGraph.stateLedger()` exposes the same ledger from the graph's insertion-ordered shots. The ledger reads only structured `props`, `prop_state` and `propTransitions`; it does not infer unseen actions. Declared `time_jump` and `montage` cuts do not require adjacent prop-state continuity, while malformed explicit transition records remain reportable.

```ts
import { AssetGraph, buildStateLedger } from './skillsData';
const ledger = buildStateLedger(sequenceShots);
const graphLedger = new AssetGraph().add(...sequenceShots).stateLedger();
// ledger.snapshots: [{ shotId, props }]
// ledger.findings: stable codes + shot/prop IDs + expected/actual state
```


## 🎯 Targeted regeneration plans

`AssetGraph.regenerationPlanForFinding(finding)` converts a State Ledger finding into a deterministic, targeted regeneration plan. It starts at the previous shot when available and includes subsequent shots that explicitly reference the affected prop through `props`, `prop_state` or `propTransitions`, preserving sequence order and excluding unrelated shots. `impactOf(asset)` also recognizes state-only and transition-only references. This is a dependency shortlist, not an automatic render command: production systems can review the returned shot IDs before regenerating.
