/**
 * # Daniskills 3.3 — Cinematic Intelligence Architecture
 * Credits: Daniel Rodrigues · Daniel Rodrigues · skillsData.ts v3.3.0-cia
 *
 * ROLE OF THIS FILE in the set:
 *   dani_skills_config.json  → DATA (single source: models, adapters, profiles, skills, styles, pipelines, routes, tables, templates)
 *   skillsData.ts (this)      → TYPES + LOADER + ENGINE (resolve style, route task, pick engine, compile + lint, blend, grade card,
 *                               compileShot, modelIntelligence, cinemaAudit, cinemaSlop, continuity + asset graph)
 *   BaseSkill.md              → CONSTITUTION (protocol, laws, engine knowledge)
 *   ARCHITECTURE.md           → the 3.3 architecture (engines + memory + commands)
 *
 * Requires: tsconfig with "resolveJsonModule": true. SKILLS_V26 keeps the legacy format (skills 32-44).
 * New in 3.3: ShotSpec, compileShot(), compileShotForAll(), modelIntelligence(), cinemaAudit(), polishPlan(), cinemaSlop(), lintCinema(),
 *             artifactVerdict(), continuityCheck(), sequenceContinuity(), AssetGraph, directorProfile(), designToken(), gateG10().
 * Legacy comments below remain in Portuguese from v3.1 and are being translated progressively.
 */
import rawConfig from './dani_skills_config.json';
import { resolveOptics, type OpticalRequest } from './opticsCatalog';

/* ───────────────────────── TIPOS ───────────────────────── */
export type ModelKind = 'video' | 'image' | 'audio' | 'platform' | 'pipeline' | 'llm';
export type Confidence = 'high' | 'medium' | 'low';
export type Stage = 'foundation' | 'pre' | 'prod' | 'audio' | 'post' | 'dist' | 'analytics' | 'qa' | 'edit' | 'memory';

export interface Optics {
  fov_degrees: number; camera: string; lens: string; aperture: string | null;
  shutter: string; white_balance: string; fps: number; mm_equiv: number;
}
/** v3.3 — Color Grading DNA: color science numérica por estilo (Skill 58). */
export interface ColorGrading {
  saturation: number;          // 0–100 (ver tables.color_science.saturation_scale)
  contrast: string;            // descritor de curva
  shadow_tint: string;         // HEX
  highlight_tint: string;      // HEX
  grain: string;               // estrutura de grão/textura
  dynamic_range: string;
  lut_match: string;           // família de LUT/película mais próxima (lut_presets)
}
export interface BlendRecipe { base_style: string; base_weight: number; accent_style: string; accent_weight: number; engine_skill: string; note?: string }
export interface VisualStyle {
  id: string; alias: string; aliases: string[]; full_name: string;
  legacy_skill_id: string | null; legacy_code?: string; family: string; summary: string;
  dna_tags: string[]; negative_locks: string; optics: Optics; palette_hex: string[];
  textures: string; motion_language: string; lighting: string; cultural_refs: string[];
  best_for: string[]; aspect_ratios: string[]; prompt_core: string; sample_prompt?: string;
  color_grading: ColorGrading; blend_recipe?: BlendRecipe;
  engines: { image: string[]; video: string[]; note: string };
}
export interface Skill {
  id: string; code: string; name: string; creator: string; summary: string; category: string;
  aspect_ratios: string[]; default_tags: string[]; negative_locks: string;
  stage: Stage; modes: string[]; requires: string[]; feeds: string[]; since: string; outputs?: string[];
}
export interface ModelSpec {
  id: string; name: string; vendor: string; kind: ModelKind; status: string; released: string;
  verified_on: string; confidence: Confidence; modes?: string[]; duration_s?: [number, number];
  resolutions?: string[]; fps?: number; aspect_ratios?: string[]; native_audio?: boolean; lipsync?: boolean;
  refs?: Record<string, unknown>; multishot?: { max_cuts: number; max_total_s: number };
  speech?: { delimiter: string; max_words_per_10s: number; anti_repeat_clause?: boolean; note?: string };
  grammar: { structure: string[]; rules: string[] };
  strengths?: string[]; weaknesses?: string[]; best_for?: string[]; access?: string[];
  notes?: string; roster?: string[]; features?: string[]; external_skill?: string;
}
export interface Profile {
  id: string; number: string; title: string; target: string; specs: string; pains: string; dna: string;
  recommended_skills: string[]; default_styles: string[]; preferred_models: string[]; default_pipeline: string;
  deliverables: string[]; kpis: string[]; quickstart: { command: string; example: string };
}
export interface PipelineStep { n: number; skill: string; role: string; out: string }
export interface Pipeline { id: string; name: string; default_ratio: string; default_duration_s: number; gates: string[]; note: string; steps: PipelineStep[] }
export interface Route {
  id: string; label: string; triggers_pt: string[]; triggers_en: string[]; primary_skills: string[]; support_skills: string[];
  default_pipeline: string | null; output_kind: string; required_inputs: string[]; template: string; gate: string;
}
export interface Gate { id: string; name: string; rule: string }
export interface MarketRow { id: string; good: string[]; risk: string[]; dir: 'LTR' | 'RTL'; wpm10: [number, number]; note: string }
export interface StudioConfig {
  project: string; studio: string; author: string; version: string; schema_version: string; updated: string;
  defaults: { language: string; ratio: string; fps: number; shutter: string; script_wpm: number; hashtags: number };
  engine_lifecycle: { stale_after_days: number };
  models: ModelSpec[]; profiles: Profile[]; skills: Skill[]; styles: VisualStyle[]; pipelines: Pipeline[]; routes: Route[]; gates: Gate[];
  tables: {
    markets: MarketRow[]; banned_terms: string[]; symptoms_15: string[]; feasibility_veto: string[];
    retention_diagnosis: { drop: string; cause: string; action: string; skills: number[] }[];
    ctr_retention_matrix: Record<string, string>;
    speech_budget: { native_gen_cap_words: number; script_wpm_default: number };
    [k: string]: unknown;
  };
  templates: Record<string, unknown>;
  [k: string]: unknown;
}

/** Formato antigo (skills 32–44) — compatibilidade com código existente. */
export interface LegacySkill {
  id: string; code: string; name: string; creator: string; summary: string; category: string;
  aspect_ratios: string[]; default_tags: string[]; negative_locks: string;
  optical_specs: { fov_degrees: number; camera: string; lens: string; shutter: string; white_balance: string };
  palette_hex: string[]; textures: string; cultural_refs: string[]; fps?: number; sample_prompt: string;
}

/* ───────────────────────── DADOS ───────────────────────── */
export const CONFIG = rawConfig as unknown as StudioConfig;
export const { models: MODELS, profiles: PROFILES, skills: SKILLS, styles: STYLES, pipelines: PIPELINES, routes: ROUTES, gates: GATES, tables: TABLES, templates: TEMPLATES } = CONFIG;

const FAMILY_LABEL: Record<string, string> = {
  comics: 'Quadrinhos & Pop', anime: 'Estilo Visual', animation_3d: 'CGI & 3D', animation_2d: 'Animação', stop_motion: 'Animação',
  cinema_auteur: 'Cinema', documentary: 'Cinema', commercial: 'Comercial', music_pop: 'Música & Arte', retro: 'Quadrinhos & Pop',
  graphic_design: 'Design', ui_motion: 'Tech & Motion', edu: 'Educação', horror: 'Cinema',
};
export const SKILLS_V26: LegacySkill[] = STYLES.filter(s => s.legacy_skill_id).map(s => ({
  id: s.legacy_skill_id as string, code: s.legacy_code ?? '', name: s.full_name, creator: 'Daniel Rodrigues', summary: s.summary,
  category: FAMILY_LABEL[s.family] ?? s.family, aspect_ratios: s.aspect_ratios, default_tags: s.dna_tags, negative_locks: s.negative_locks,
  optical_specs: { fov_degrees: s.optics.fov_degrees, camera: s.optics.camera, lens: s.optics.lens, shutter: s.optics.shutter, white_balance: s.optics.white_balance },
  palette_hex: s.palette_hex, textures: s.textures, cultural_refs: s.cultural_refs, fps: s.optics.fps, sample_prompt: s.sample_prompt ?? s.prompt_core,
}));

/* ───────────────────────── UTILIDADES ───────────────────────── */
const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const key = (s: string) => fold(s).replace(/[^a-z0-9]/g, '').toUpperCase();

/** FOV horizontal (graus) ⇄ distância focal equivalente full-frame (sensor 36 mm). Use mm só para referência humana. */
export const fovToMm = (fov: number) => Math.round(18 / Math.tan((fov * Math.PI) / 360));
export const mmToFov = (mm: number) => Math.round((2 * Math.atan(18 / mm) * 180) / Math.PI);

export const getModel = (id: string) => MODELS.find(m => m.id === id);
export const getSkill = (idOrNum: string | number) => { const id = typeof idOrNum === 'number' ? `skill_${String(idOrNum).padStart(2, '0')}` : idOrNum; return SKILLS.find(s => s.id === id); };
export const getProfile = (q: string | number) => { const k = typeof q === 'number' ? `perfil_${String(q).padStart(2, '0')}` : q; return PROFILES.find(p => p.id === k || p.number === k); };
export const getPipeline = (id: string) => PIPELINES.find(p => p.id === id);

/** Resolve MIGNOLA / "sin city" / dna_wes / skill_32 / nome completo → estilo. */
export function resolveStyle(query: string): VisualStyle | undefined {
  const q = key(query);
  if (!q) return undefined;
  return STYLES.find(s => key(s.alias) === q || s.aliases.some(a => key(a) === q) || key(s.id) === q || (s.legacy_skill_id && key(s.legacy_skill_id) === q) || (s.legacy_code && key(s.legacy_code) === q))
    ?? STYLES.find(s => key(s.full_name).includes(q) && q.length >= 4);
}
export const stylesByFamily = (family: string) => STYLES.filter(s => s.family === family);

/** Expande dependências (requires) em ordem topológica; skill_15 é sempre a base. */
export function expandSkillChain(ids: string[], alwaysInclude: string[] = ['skill_15']): string[] {
  const out: string[] = []; const seen = new Set<string>();
  const visit = (id: string) => { if (seen.has(id)) return; seen.add(id); const s = getSkill(id); if (!s) return; s.requires.forEach(visit); out.push(id); };
  [...alwaysInclude, ...ids].forEach(visit);
  return out;
}

/** Pacote completo de um perfil: skills expandidas, estilos, motores e pipeline. */
export function profileKit(q: string | number) {
  const profile = getProfile(q); if (!profile) return undefined;
  return {
    profile, skills: expandSkillChain(profile.recommended_skills).map(getSkill).filter((s): s is Skill => !!s),
    styles: profile.default_styles.map(resolveStyle).filter((s): s is VisualStyle => !!s),
    engines: profile.preferred_models.map(getModel).filter((m): m is ModelSpec => !!m), pipeline: getPipeline(profile.default_pipeline),
  };
}

/** Classifica um pedido livre (PT/EN) em rotas de tarefa, da mais provável à menos. */
export function routeTask(text: string): { route: Route; score: number }[] {
  const t = fold(text);
  return ROUTES.map(route => {
    const score = [...route.triggers_pt, ...route.triggers_en].reduce((a, tr) => (t.includes(fold(tr)) ? a + fold(tr).split(' ').length + 1 : a), 0);
    return { route, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
}

/* ───────────────────────── COLOR GRADING DNA (v3.3 · Skill 58) ───────────────────────── */
/** Linha de grade em parâmetros (nunca 'cinematic color grade'). Entra no bloco STYLE de todo prompt. */
export function styleGradeLine(style?: VisualStyle): string {
  const g = style?.color_grading; if (!g) return '';
  return `Color grade: saturation ~${g.saturation}/100, ${g.contrast}, shadow tint ${g.shadow_tint}, highlight tint ${g.highlight_tint}, grain: ${g.grain}`;
}
/** Cartão de grade (color_grading_card.json) pronto para o Darkroom (Skill 25). */
export function gradeCard(alias: string) {
  const style = resolveStyle(alias); if (!style) return undefined;
  const lut = (CONFIG as unknown as { lut_presets: { name: string; halation_intensity: string; grain_monte_carlo: string }[] }).lut_presets;
  const f = fold(style.color_grading.lut_match);
  const match = lut.find(l => f.includes(fold(l.name))) ?? lut.find(l => f.includes(fold(l.name).split(' ')[0]) && f.includes(fold(l.name).split(' ')[1] ?? ''));
  return { style_id: style.id, ...style.color_grading, darkroom_chain_overrides: match ? { lut_preset: match.name, halation_intensity: match.halation_intensity, grain_monte_carlo: match.grain_monte_carlo } : { lut_preset: null } };
}
export const saturationLabel = (n: number) =>
  (TABLES as unknown as { color_science: { saturation_scale: { range: [number, number]; label: string }[] } }).color_science.saturation_scale.find(r => n >= r.range[0] && n <= r.range[1])?.label;

/* ───────────────────────── MISTURA DE ESTILOS (v3.3 · Skill 57) ───────────────────────── */
export interface BlendResult { base: VisualStyle; accent: VisualStyle; weights: [number, number]; optics: Optics; palette_hex: string[]; prompt_core: string; negative_locks: string; color_grading: ColorGrading; conflicts: string[] }
const CONFLICTS = [['LAIKA', 'PIXAR'], ['XEROX', 'KEYNOTE'], ['PIXELART', 'PLANETEARTH']];
const hexMix = (a: string, b: string, wb: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v * wb + B[i] * (1 - wb)).toString(16).padStart(2, '0')).join('').toUpperCase();
};
/** 1 base (60–70%) + 1 acento (30–40%) ISOLADO num elemento. Herda óptica da base; interpola paleta e grade. */
export function blendStyles(baseAlias: string, accentAlias: string, baseWeight = 0.7): BlendResult | undefined {
  const base = resolveStyle(baseAlias), accent = resolveStyle(accentAlias); if (!base || !accent) return undefined;
  const conflicts: string[] = [];
  if (CONFLICTS.some(([x, y]) => (base.alias === x && accent.alias === y) || (base.alias === y && accent.alias === x))) conflicts.push(`${base.alias}+${accent.alias}: conflito de família conhecido — escolha um`);
  if (base.family === accent.family) conflicts.push('mesma família: aceitável se o acento ficar isolado num único elemento; senão o híbrido tende a parecer o estilo-base puro');
  const wb = Math.min(0.8, Math.max(0.6, baseWeight)), wa = +(1 - wb).toFixed(2);
  const palette = [...base.palette_hex.slice(0, 4), ...accent.palette_hex.slice(0, 2)].slice(0, 6);
  const gb = base.color_grading, ga = accent.color_grading;
  const color_grading: ColorGrading = {
    saturation: Math.round(gb.saturation * wb + ga.saturation * wa), contrast: gb.contrast, shadow_tint: hexMix(gb.shadow_tint, ga.shadow_tint, wb), highlight_tint: hexMix(gb.highlight_tint, ga.highlight_tint, wb),
    grain: `${gb.grain} (base); ${ga.grain} confined to the accent element`, dynamic_range: `${gb.dynamic_range}; localized spike from accent`, lut_match: `${gb.lut_match} base + ${ga.lut_match} patch on the accent element`,
  };
  const negs = [...new Set([...base.negative_locks.split(', '), ...ga.contrast ? accent.negative_locks.split(', ') : []])].join(', ');
  return { base, accent, weights: [wb, wa], optics: base.optics, palette_hex: palette, color_grading, conflicts, negative_locks: negs,
    prompt_core: `${base.prompt_core}. ACCENT (isolated on ONE element/surface, ${Math.round(wa * 100)}%): ${accent.prompt_core}` };
}

/* ───────────────────────── MOTORES ───────────────────────── */
export interface EngineNeeds { kind: 'video' | 'image'; styleAlias?: string; needsAudio?: boolean; durationS?: number; ratio?: string; mode?: string }
export interface EngineChoice { model: ModelSpec; score: number; reasons: string[]; warnings: string[] }

export function staleEngines(today = new Date()): ModelSpec[] {
  const limit = CONFIG.engine_lifecycle.stale_after_days * 86400000;
  return MODELS.filter(m => m.status === 'sunsetting' || today.getTime() - new Date(m.verified_on).getTime() > limit);
}

export function recommendEngines(n: EngineNeeds, today = new Date()): EngineChoice[] {
  const style = n.styleAlias ? resolveStyle(n.styleAlias) : undefined;
  const preferred = style ? style.engines[n.kind] : [];
  const stale = new Set(staleEngines(today).map(m => m.id));
  return MODELS.filter(m => m.kind === n.kind && m.status !== 'sunsetting').map(model => {
    let score = 0; const reasons: string[] = []; const warnings: string[] = [];
    const idx = preferred.findIndex(p => p === model.id || p.startsWith(model.id.split('_').slice(0, 2).join('_')));
    if (idx >= 0) { score += 30 - idx * 5; reasons.push(`afinidade com ${style?.alias} (#${idx + 1})`); }
    if (n.kind === 'video') {
      if (n.durationS && model.duration_s) {
        if (n.durationS > model.duration_s[1]) { score -= 25; warnings.push(`duração ${n.durationS}s > máx ${model.duration_s[1]}s: dividir em segmentos com seams`); }
        else { score += 5; reasons.push(`cobre ${n.durationS}s em 1 passe`); }
      }
      if (n.needsAudio) { if (model.native_audio) { score += 10; reasons.push('áudio nativo'); } else { score -= 15; warnings.push('sem áudio nativo: usar Skill 26/49 em pós'); } }
    }
    if (n.ratio && model.aspect_ratios && !model.aspect_ratios.includes(n.ratio)) { score -= 10; warnings.push(`proporção ${n.ratio} não nativa: compor em ${model.aspect_ratios[0]} e recompor`); }
    if (n.mode && model.modes?.includes(n.mode)) { score += 8; reasons.push(`suporta modo ${n.mode}`); }
    if (model.confidence === 'low') { score -= 6; warnings.push('specs não verificadas: confirmar na plataforma'); }
    if (stale.has(model.id)) warnings.push(`verified_on ${model.verified_on} venceu (>${CONFIG.engine_lifecycle.stale_after_days} dias)`);
    return { model, score, reasons, warnings };
  }).sort((a, b) => b.score - a.score);
}

/* ───────────────────────── COMPILADOR DE PROMPT ───────────────────────── */
export interface CompileRequest {
  engineId: string; styleAlias?: string; ratio?: string; durationS?: number; resolution?: string; multishot?: boolean;
  subject?: string; setting?: string; firstFrame?: string; action?: string | string[]; camera?: string; physics?: string; lighting?: string;
  speech?: string; ambience?: string; diegetic?: string[]; score?: string; text?: string; palette?: string[];
  references?: { label: string; role: string }[];
  /** v3.3: mistura 1 base + 1 acento (Skill 57). Se presente, substitui styleAlias no bloco STYLE. */
  blend?: { base: string; accent: string; baseWeight?: number };
  /** Modo Marca (G9): só tem efeito se brandGate(brand).active. */
  brand?: BrandModeInput;
}
export interface CompiledPrompt { engine: ModelSpec; kind: ModelKind; positive: string; negative?: string; params: Record<string, unknown>; warnings: string[]; disclosure?: string }

const todo = (what: string, w: string[]) => { w.push(`preencher: ${what}`); return `[definir: ${what}]`; };
const asList = (a?: string | string[]) => (a === undefined ? [] : Array.isArray(a) ? a : [a]);

function compileCore(req: CompileRequest): CompiledPrompt {
  const engine = getModel(req.engineId); if (!engine) throw new Error(`motor desconhecido: ${req.engineId}`);
  const blend = req.blend ? blendStyles(req.blend.base, req.blend.accent, req.blend.baseWeight) : undefined;
  const style = blend ? { ...blend.base, prompt_core: blend.prompt_core, palette_hex: blend.palette_hex, color_grading: blend.color_grading, negative_locks: blend.negative_locks } as VisualStyle : req.styleAlias ? resolveStyle(req.styleAlias) : undefined;
  const warnings: string[] = [];
  if (req.blend && !blend) warnings.push(`mistura inválida: ${req.blend.base}+${req.blend.accent}`);
  if (blend) warnings.push(...blend.conflicts);
  if (req.styleAlias && !style) warnings.push(`estilo não encontrado: ${req.styleAlias}`);
  if (engine.status === 'sunsetting') warnings.push(`${engine.name} está em desativação: ${engine.notes ?? ''}`);
  const ratio = req.ratio ?? style?.aspect_ratios[0] ?? CONFIG.defaults.ratio;
  const o = style?.optics;
  const opticsLine = o ? `FOV ${o.fov_degrees}° (${o.camera}${o.lens ? ', ' + o.lens : ''}${o.aperture ? ', ' + o.aperture : ''}), shutter ${o.shutter}, WB ${o.white_balance}` : todo('FOV em graus + distância da câmera', warnings);
  const paletteLine = (req.palette ?? style?.palette_hex ?? []).join(' ');
  const gradeLine = styleGradeLine(style);
  const params: Record<string, unknown> = { aspect_ratio: ratio, ...(req.durationS ? { duration_s: req.durationS } : {}), ...(req.resolution ? { resolution: req.resolution } : {}), ...(engine.fps ? { fps: engine.fps } : {}) };

  /* ---------- IMAGEM ---------- */
  if (engine.kind === 'image') {
    const subject = req.subject ?? todo('assunto', warnings);
    if (engine.id === 'flux_2') {
      const json = {
        scene: [req.setting ?? '', style?.prompt_core ?? ''].filter(Boolean).join('. '), subjects: [{ description: subject, position: 'per composition', action: asList(req.action).join('; ') }],
        style: style?.full_name ?? '', color_palette: req.palette ?? style?.palette_hex ?? [], lighting: req.lighting ?? style?.lighting ?? '', mood: [style?.textures ?? '', gradeLine].filter(Boolean).join('. '),
        background: req.setting ?? '', composition: req.camera ?? 'rule of thirds', camera: { angle: req.camera ?? 'eye level', fov_degrees: o?.fov_degrees ?? 0, depth_of_field: o?.aperture ?? '' },
      };
      if (req.text) warnings.push('texto em imagem: no FLUX.2 use [flex] e cite o texto literal no JSON (subjects[].description)');
      return { engine, kind: 'image', positive: JSON.stringify(json, null, 2), params, warnings };
    }
    const prose = [
      `Subject: ${subject}`, req.action ? `Action: ${asList(req.action).join('; ')}` : '', req.setting ? `Setting: ${req.setting}` : '', `Optics: ${opticsLine}`,
      `Light: ${req.lighting ?? style?.lighting ?? todo('luz (direção, qualidade, Kelvin, razão)', warnings)}`,
      style ? `Style/DNA: ${style.prompt_core}${paletteLine ? '. Palette ' + paletteLine : ''}` : '', gradeLine,
      req.text ? `TEXT (literal, render exactly once): "${req.text}"` : '',
      style ? `Constraints: keep ${style.dna_tags.slice(0, 3).join(', ')}` : '',
    ].filter(Boolean).join('\n');
    return { engine, kind: 'image', positive: prose, params, warnings };
  }

  /* ---------- VÍDEO ---------- */
  if (req.durationS && engine.duration_s && req.durationS > engine.duration_s[1]) warnings.push(`duração ${req.durationS}s > máx ${engine.duration_s[1]}s de ${engine.name}: dividir em segmentos`);
  if (engine.aspect_ratios && !engine.aspect_ratios.includes(ratio)) warnings.push(`proporção ${ratio} não nativa em ${engine.name}`);
  const actions = asList(req.action);
  const dur = req.durationS ?? engine.duration_s?.[1] ?? 8;
  const shots = req.multishot === false ? 1 : Math.max(1, Math.round(dur / 2));
  const cuts = Array.from({ length: shots - 1 }, (_, i) => +((i + 1) * (dur / shots)).toFixed(1));
  const positiveOnly = engine.grammar.structure.includes('POSITIVE LOCKS');
  const speech = req.speech && engine.speech ? (() => {
    const cap = Math.floor((engine.speech.max_words_per_10s * dur) / 10); const words = req.speech.trim().split(/\s+/).length;
    if (words > cap) warnings.push(`fala com ${words} palavras > ${cap} para ${dur}s (limite ${engine.speech.max_words_per_10s}/10s)`);
    const d = engine.speech.delimiter;
    return `${d}${req.speech}${d}` + (engine.speech.anti_repeat_clause ? ' Deliver the line exactly once at a natural, unhurried pace; do NOT repeat, stutter, or loop any word or phrase.' : '');
  })() : req.speech ? (warnings.push('motor sem fala nativa: usar Skill 26/49'), undefined) : undefined;
  const audioLine = engine.native_audio
    ? [speech ? `SPEECH ${speech}` : '', `AMBIENT: ${req.ambience ?? todo('ambiência geográfica', warnings)}`, req.diegetic?.length ? `DIEGETIC: ${req.diegetic.join('; ')}` : '', `SCORE: ${req.score ?? 'None. Fully diegetic.'}`, 'IP LOCK: generic audio, no real-brand sound, no real voice cloning'].filter(Boolean).join(' | ')
    : 'silent (audio in post: Skill 26/49)';
  const refs = (req.references ?? []).map(r => `${r.label} = ${r.role}`).join('; ');
  const styleBlock = style ? `${style.prompt_core}${paletteLine ? '. Palette ' + paletteLine : ''}${gradeLine ? '. ' + gradeLine : ''}` : todo('textura, grão, paleta', warnings);

  if (positiveOnly) {
    const blocks: [string, string][] = [
      ['SCENE CONTEXT', [req.subject, req.setting].filter(Boolean).join(' — ') || todo('resumo da cena', warnings)],
      ['LOCATION MAP', req.setting ?? todo('o que fica onde (âncora espacial)', warnings)],
      ['FIRST FRAME', req.firstFrame ?? actions[0] ?? todo('primeiro frame já em mid-action', warnings)],
      ['FORMAT MODE', shots > 1 ? `multishot, ${shots} shots, ${cuts.length} hard cuts at ${cuts.map(c => c + 's').join(', ')}` : 'single take'],
      ['OPTICS', opticsLine],
      ['CAMERA', req.camera ?? todo('um movimento físico motivado', warnings)],
      ['ACTION TIMING', actions.length ? actions.map((a, i) => `Shot ${i + 1} (${(i * dur / shots).toFixed(1)}–${((i + 1) * dur / shots).toFixed(1)}s): ${a}`).join('\n') : todo('ação por shot', warnings)],
      ['PHYSICS', req.physics ?? todo('peso, inércia, material', warnings)],
      ['LIGHTING', req.lighting ?? style?.lighting ?? todo('fontes práticas + WB em Kelvin', warnings)],
      ['AUDIO', audioLine],
      ['STYLE', styleBlock],
      ['POSITIVE LOCKS', [style ? style.dna_tags.join(', ') : '', shots > 1 ? `${shots} shots, ${cuts.length} cuts at ${cuts.map(c => c + 's').join(', ')}` : 'single take', refs].filter(Boolean).join('; ')],
    ];
    return { engine, kind: 'video', positive: blocks.map(([k, v]) => `${k}: ${v}`).join('\n'), params, warnings };
  }

  const per = dur / Math.max(actions.length, 1);
  const shotLines = actions.length > 1 ? actions.map((a, i) => `Shot ${i + 1} (${(i * per).toFixed(0)}–${((i + 1) * per).toFixed(0)}s): ${a}`).join('\n') : actions.join(' ');
  const para = [
    req.subject ?? todo('assunto', warnings), req.setting ? `Setting: ${req.setting}.` : '', shotLines || todo('ação', warnings),
    `Camera: ${req.camera ?? todo('movimento motivado', warnings)}. Optics: ${opticsLine}.`, `Lighting: ${req.lighting ?? style?.lighting ?? todo('luz', warnings)}.`,
    style ? `Style: ${styleBlock}.` : '', refs ? `References: ${refs}.` : '', `Audio: ${audioLine}.`,
  ].filter(Boolean).join('\n');
  const negative = style && engine.id === 'veo_3_1' ? style.negative_locks : undefined; // Veo aceita negative_prompt; demais motores: manter positivo-only
  return { engine, kind: 'video', positive: para, negative, params, warnings };
}

/* ───────────────────────── LINT ───────────────────────── */
export interface LintIssue { level: 'error' | 'warn'; code: string; message: string }
export interface LintOptions { engineId?: string; durationS?: number; ratio?: string; brand?: BrandModeInput; description?: string; styleAliases?: string[] }

export function lintPrompt(text: string, opt: LintOptions = {}): LintIssue[] {
  const issues: LintIssue[] = []; const t = fold(text);
  for (const term of TABLES.banned_terms) if (new RegExp(`(^|[^a-z0-9])${fold(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(t)) issues.push({ level: 'warn', code: 'EMPTY_TERM', message: `termo vazio/proibido: "${term}" — troque por especificação óptica real` });
  for (const m of text.matchAll(/\b(\d{1,3})\s?mm\b/gi)) {
    const near = fold(text.slice(Math.max(0, (m.index ?? 0) - 12), (m.index ?? 0) + 24));
    if (!/macro|probe|tilt|shift/.test(near)) issues.push({ level: 'warn', code: 'MM_NOTATION', message: `"${m[0]}" → use FOV em graus (≈ ${mmToFov(+m[1])}°)` });
  }
  if (/\bno (motion )?blur\b/i.test(text)) issues.push({ level: 'error', code: 'NO_BLUR', message: 'Feasibility Veto: use obturador 180° (ou 90° para ação crisp), nunca "no blur"' });
  if (/\b(no|without|avoid|never|don't)\s+(people|humans?|persons?|faces?|text|logos?)\b/i.test(text)) issues.push({ level: 'warn', code: 'NEGATIVE_PHRASING', message: 'negação planta o objeto: escreva o que ESTÁ no quadro (POSITIVE LOCKS)' });
  if (/\bFOV\b/.test(text) && !/FOV\s*\d+(\.\d+)?\s*(°|deg)/i.test(text)) issues.push({ level: 'warn', code: 'FOV_UNIT', message: 'FOV deve vir em graus (ex.: FOV 47°)' });
  /* v3.3 — grade vaga e mistura excessiva */
  if (/\b(cinematic|film|movie)\s+(color\s+)?(grade|grading|look|colou?rs?)\b/i.test(text) && !/saturation\s*~?\d+/i.test(text)) issues.push({ level: 'warn', code: 'GRADE_VAGUE', message: 'grade sem números: use "saturation ~N/100, shadow tint #HEX, highlight tint #HEX, grain: …" (style.color_grading / Skill 58)' });
  if ((opt.styleAliases?.length ?? 0) > 2) issues.push({ level: 'error', code: 'BLEND_OVERLOAD', message: 'Feasibility Veto: no máximo 1 base + 1 acento (Skill 57)' });
  const tags = (text.match(/#[\p{L}\p{N}_]+/gu) ?? []).filter(x => !isDisclosureTag(x)); // rótulo de divulgação não conta entre as 3
  if (tags.length && tags.length !== CONFIG.defaults.hashtags) issues.push({ level: 'warn', code: 'HASHTAGS', message: `use exatamente ${CONFIG.defaults.hashtags} hashtags (marca + nicho + formato); encontrei ${tags.length}` });
  /* G9 — Modo Marca */
  const found = detectBrands(text);
  if (found.length) {
    const gate = brandGate(opt.brand);
    if (!gate.active) issues.push({ level: 'error', code: 'BRAND_UNGATED', message: `marca real citada (${found.join(', ')}) sem Modo Marca ativo (G9). Responda as 5 perguntas ou use substituto genérico (Non-IP, G8).${gate.missing.length ? ' Faltando: ' + gate.missing.join('; ') : ''}` });
    else {
      const declared = fold(`${opt.brand?.brand ?? ''} ${opt.brand?.product ?? ''}`);
      const extra = found.filter(b => !declared.includes(fold(b)));
      if (extra.length) issues.push({ level: 'warn', code: 'BRAND_UNLISTED', message: `marca(s) fora do que foi declarado no G9: ${extra.join(', ')}` });
    }
  }
  if (opt.brand && brandGate(opt.brand).active && opt.brand.relationship !== 'sem_vinculo' && opt.description !== undefined) {
    const d = fold(opt.description);
    if (!/(#publi|#ad\b|#afiliado|#parceria|#gifted|#sponsored|#recebido|publi|afiliad|patrocin|cedido)/.test(d)) issues.push({ level: 'warn', code: 'BRAND_NO_DISCLOSURE', message: 'descrição sem rótulo de divulgação (publi/afiliado/parceria). Use disclosureBlock().' });
  }
  const model = opt.engineId ? getModel(opt.engineId) : undefined;
  if (model) {
    if (model.status === 'sunsetting') issues.push({ level: 'error', code: 'ENGINE_SUNSET', message: `${model.name} em desativação — migrar (Skill 53)` });
    if (opt.durationS && model.duration_s && opt.durationS > model.duration_s[1]) issues.push({ level: 'error', code: 'DURATION', message: `${opt.durationS}s > máx ${model.duration_s[1]}s em ${model.name}` });
    if (opt.ratio && model.aspect_ratios && !model.aspect_ratios.includes(opt.ratio)) issues.push({ level: 'warn', code: 'RATIO', message: `${opt.ratio} não é nativo em ${model.name}` });
    const sp = text.match(/(?:SPEECH\]?:?\s*)(['"“])(.+?)\1/s);
    if (sp && model.speech && opt.durationS) {
      const words = sp[2].trim().split(/\s+/).length; const cap = Math.floor((model.speech.max_words_per_10s * opt.durationS) / 10);
      if (words > cap) issues.push({ level: 'error', code: 'SPEECH_LEN', message: `fala com ${words} palavras > ${cap} para ${opt.durationS}s` });
    }
  }
  return issues;
}

/* ───────────────────────── MODO MARCA (G9) ───────────────────────── */
/** Non-IP (G8) é o padrão. G9 é opt-in: só ativa com as 5 respostas. Não é aconselhamento jurídico. */
export type BrandRelationship = 'afiliado' | 'patrocinado' | 'cedido' | 'sem_vinculo';
export interface BrandModeInput {
  brand: string; product: string; relationship?: BrandRelationship; link?: string; acceptsDisclosure?: boolean;
  context?: string; contextCompatible?: boolean; usage?: 'organico' | 'anuncio_pago'; writtenAuth?: boolean; referencePhoto?: boolean;
}
export interface BrandModeTable {
  default: boolean; rules: string[]; disclosure_tags: string[]; watchlist: string[];
  disclosure_templates: Record<BrandRelationship, string>; fallback_substitutes: Record<string, string>;
  questions: { id: string; key: string; text: string; options?: string[] }[];
}
export const BRAND_MODE = (TABLES as unknown as { brand_mode: BrandModeTable }).brand_mode;
const DISCLOSURE_TAGS = new Set(BRAND_MODE.disclosure_tags.map(fold));
const isDisclosureTag = (tag: string) => DISCLOSURE_TAGS.has(fold(tag));
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Marcas da watchlist presentes no texto (palavra inteira, sem acento/caixa). */
export function detectBrands(text: string): string[] {
  const t = fold(text);
  return BRAND_MODE.watchlist.filter(b => new RegExp(`(^|[^a-z0-9])${escRe(fold(b))}([^a-z0-9]|$)`).test(t));
}

/** As 5 perguntas do G9. active=true só com tudo respondido; caso contrário, seguir Non-IP. */
export function brandGate(b?: BrandModeInput): { active: boolean; missing: string[]; warnings: string[]; disclosure?: string; disclosureTags: string[] } {
  const missing: string[] = []; const warnings: string[] = [];
  if (!b || !b.brand?.trim() || !b.product?.trim()) missing.push('1) marca e produto exatos');
  if (!b?.relationship) missing.push('2) vínculo (afiliado | patrocinado | cedido | sem_vinculo)');
  if (b?.relationship === 'afiliado' && !b.link?.trim()) missing.push('3) link de afiliado');
  if (b?.relationship && b.relationship !== 'sem_vinculo' && !b.acceptsDisclosure) missing.push('3) aceitar rotular na descrição');
  if (!b?.contextCompatible) missing.push('4) contexto da cena compatível com a marca');
  if (!b?.usage) missing.push('5) uso orgânico ou anúncio pago');
  if (b?.usage === 'anuncio_pago' && !b.writtenAuth) missing.push('5) autorização escrita da marca (anúncio pago)');
  if (b && !b.referencePhoto) warnings.push('sem foto oficial de referência: a IA pode distorcer logo/embalagem (use papel "produto")');
  const active = missing.length === 0;
  const tags = b?.relationship && b.relationship !== 'sem_vinculo' ? ['#publi'] : [];
  return { active, missing, warnings, disclosure: active && b ? disclosureBlock(b) : undefined, disclosureTags: tags };
}

/** Linha de divulgação para a descrição (não conta entre as 3 hashtags). */
export function disclosureBlock(b: BrandModeInput): string {
  const tpl = BRAND_MODE.disclosure_templates[b.relationship ?? 'sem_vinculo'];
  return tpl.replace('{brand}', b.brand).replace('{product}', b.product).replace('{link}', b.link ?? '').trim();
}

/** Compila o prompt e, se o G9 estiver ativo, injeta a especificação do produto e devolve o bloco de divulgação. */
function applyCompiledPromptQuality(out: CompiledPrompt, req: CompileRequest): CompiledPrompt {
  const modality: Modality = out.kind === 'image' ? 'image' : out.kind === 'audio' ? 'audio' : 'video';
  const intent = [req.subject, req.action, req.setting, req.speech, req.ambience].flatMap(asList).filter(Boolean).join(' ').trim();
  const qa = qualityLoop({
    modality, intent: intent || 'Compile the supplied production specification',
    destination: req.ratio ?? CONFIG.defaults.ratio,
    technical: { fov_degrees: resolveStyle(req.styleAlias ?? '')?.optics.fov_degrees ?? 47,
      shutter_angle: 180, fps: out.engine.fps ?? CONFIG.defaults.fps },
    constraints: ['Positive-only production instructions', 'Use FOV in degrees', 'Use 180-degree shutter as the video default']
  }, out.positive);
  out.warnings.push(`QUALITY_LOOP: ${qa.status}; AntiSlopScore ${qa.antiSlopScore}`);
  out.warnings.push(...qa.findings.map(x => `QUALITY: ${x}`));
  out.warnings.push(...qa.fixes.map(x => `QUALITY_FIX: ${x}`));
  if (qa.status === 'REGENERATE') out.warnings.push('QUALITY_GATE: revise the prompt before delivery; regenerate only the failing block or shot.');
  return out;
}

export function compilePrompt(req: CompileRequest): CompiledPrompt {
  const out = compileCore(req);
  if (!req.brand) return applyCompiledPromptQuality(out, req);
  const gate = brandGate(req.brand); out.warnings.push(...gate.warnings);
  if (!gate.active) { out.warnings.push(`G9 inativo (seguindo Non-IP): ${gate.missing.join('; ')}`); return applyCompiledPromptQuality(out, req); }
  const b = req.brand;
  const spec = `${b.brand} ${b.product}, rendered as the plain product shown in the attached official reference photo (role: product); logo and text only as visible in that photo${b.context ? `; placement: ${b.context}` : ''}`;
  if (out.engine.id === 'flux_2') {
    try { const j = JSON.parse(out.positive); if (j.subjects?.[0]) j.subjects[0].description += `; product: ${spec}`; out.positive = JSON.stringify(j, null, 2); } catch { out.positive += `\nPRODUCT: ${spec}`; }
  } else out.positive += `\nPRODUCT SPEC: ${spec}`;
  out.disclosure = gate.disclosure;
  return applyCompiledPromptQuality(out, req);
}


export function compilePromptForDelivery(req: CompileRequest, policy: QualityGatePolicy = {}): CompiledPrompt {
  const out = compilePrompt(req);
  const diagnostic = out.warnings.find(w => w.startsWith('QUALITY_LOOP:'));
  const status = (diagnostic?.match(/QUALITY_LOOP: (PASS|POLISH|REGENERATE|UNASSESSED)/)?.[1] ?? 'UNASSESSED') as AntiSlopStatus;
  const gate = qualityDeliveryGate(status, policy);
  out.warnings.push(`QUALITY_DELIVERY_GATE: ${gate.allowed ? 'ALLOW' : 'BLOCK'}; ${gate.reason}`);
  assertDeliverable(gate);
  return out;
}

/* ───────────────────────── HELPERS DE PRODUÇÃO ───────────────────────── */
/** Orçamento de palavras: fala nativa (≤25/10s) e leitura de roteiro (145 wpm) por mercado. */
export function wordBudget(seconds: number, market = 'PT-BR') {
  const m = TABLES.markets.find(x => x.id === market) ?? TABLES.markets[0];
  return { market: m.id, spoken: [Math.round((m.wpm10[0] * seconds) / 10), Math.round((m.wpm10[1] * seconds) / 10)] as [number, number],
    nativeGenCap: Math.floor((TABLES.speech_budget.native_gen_cap_words * seconds) / 10), scriptWords145: Math.round((TABLES.speech_budget.script_wpm_default * seconds) / 60), direction: m.dir };
}
/** Exatamente 3 hashtags: marca + nicho + formato/objetivo. */
export const hashtags = (brand: string, niche: string, format: string): [string, string, string] => {
  const h = (s: string) => '#' + fold(s).replace(/[^a-z0-9]/g, '');
  return [h(brand), h(niche), h(format)];
};
/** Skill 30: diagnóstico por ponto de queda. */
export const diagnoseDrop = (drop: string) => TABLES.retention_diagnosis.find(r => fold(r.drop) === fold(drop));
export const ctrRetentionQuadrant = (ctrHigh: boolean, retentionHigh: boolean) =>
  TABLES.ctr_retention_matrix[`${ctrHigh ? 'high' : 'low'}_${retentionHigh ? 'high' : 'low'}`];
/** Auditoria de atuação (Skill 24/55): ≥2 sintomas ⇒ regerar. */
export const actingVerdict = (found: string[]) => ({ count: found.length, regenerate: found.length >= 2, symptoms: found.filter(f => TABLES.symptoms_15.includes(f)) });

/* ═══════════════════════════════════════════════════════════════════════════
 * Daniskills 3.3 — CINEMATIC INTELLIGENCE ARCHITECTURE  (credits: Daniel Rodrigues)
 * Intent → Shot Spec (Shot DNA) → Engine Adapter → Prompt  ·  Model Intelligence  ·  Continuity / Asset Graph
 * Cinema Audit · Cinema Slop Detector · Artifact verdicts · Director Profiles · Design Tokens
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ───────── adapters (Skill 66) ───────── */
export interface EngineAdapter {
  engine_id: string; dialect: string; prompt_language: string; structure: string[]; speech_rule: string;
  reference_rule: string; duration_rule: string; do: string[]; dont: string[]; notes: string;
}
export const ADAPTERS = (CONFIG as unknown as { engine_adapters: EngineAdapter[] }).engine_adapters;
export const getAdapter = (engineId: string) => ADAPTERS.find(a => a.engine_id === engineId);

/** Cinematic intent as data (Shot DNA). One spec compiles into many engine dialects. */
export interface ShotSpec {
  shot_id: string; story_function?: string;
  /** Optional optical intent; compiler emits generic optical language, not a real lens brand. */
  optics?: OpticalRequest;
  subject: string; action: string; emotion?: string; location: string; time?: string;
  camera: { size?: string; fov_degrees: number; movement?: string; device?: string; angle?: string; axis?: string; screen_direction?: string };
  lighting: string;
  audio?: { dialogue?: string; speaker?: string; sfx?: string[]; ambience?: string; silence?: string };
  style?: string | { base: string; accent: string; weight?: number };
  duration_s?: number; ratio?: string;
  acting_beats?: { t: string; beat: string }[];
  continuity?: { characters?: string[]; locations?: string[]; props?: string[]; time?: string; weather?: string; wardrobe?: string; light_direction?: string };
  references?: string[]; needs_native_audio?: boolean;
}
export interface CompiledShot { engine: ModelSpec; adapter?: EngineAdapter; prompt: string; negative?: string; warnings: string[]; opticalNotes?: string[]; deliveryGate?: QualityDeliveryGate }

/** Parse explicit beat timestamps only; unsupported notation is left for human review. */
export function validateShotTiming(shot: ShotSpec): { errors: string[]; parsedBeats: { index: number; seconds: number }[] } {
  const errors: string[] = [];
  const parsedBeats: { index: number; seconds: number }[] = [];
  const beats = shot.acting_beats ?? [];
  const parseTime = (raw: string): number | undefined => {
    const value = raw.trim();
    const clock = value.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
    if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
    const seconds = value.match(/^(\d+(?:\.\d+)?)\s*s?$/i);
    if (seconds) return Number(seconds[1]);
    return undefined;
  };
  beats.forEach((beat, index) => {
    const seconds = parseTime(beat.t);
    if (seconds === undefined) return;
    parsedBeats.push({ index, seconds });
    if (shot.duration_s != null && seconds > shot.duration_s) {
      errors.push(`TIMING_BEYOND_DURATION: beat ${index + 1} at ${beat.t} exceeds shot duration ${shot.duration_s}s.`);
    }
    const previous = parsedBeats.length > 1 ? parsedBeats[parsedBeats.length - 2] : undefined;
    if (previous && seconds < previous.seconds) {
      errors.push(`TIMING_ORDER_CONFLICT: beat ${index + 1} at ${beat.t} occurs before beat ${previous.index + 1} at ${beats[previous.index].t}.`);
    }
  });
  return { errors, parsedBeats };
}

function resolveShotStyle(s: ShotSpec): { core: string; grade: string; negatives: string } {
  if (!s.style) return { core: '', grade: '', negatives: '' };
  if (typeof s.style === 'string') {
    const st = resolveStyle(s.style);
    return st ? { core: st.prompt_core, grade: styleGradeLine(st), negatives: st.negative_locks } : { core: s.style, grade: '', negatives: '' };
  }
  const b = blendStyles(s.style.base, s.style.accent, s.style.weight ?? 0.7);
  if (!b) return { core: `${s.style.base} + ${s.style.accent}`, grade: '', negatives: '' };
  const g = b.color_grading;
  return { core: b.prompt_core, negatives: b.negative_locks,
    grade: `Color grade: saturation ~${g.saturation}/100, ${g.contrast}, shadow tint ${g.shadow_tint}, highlight tint ${g.highlight_tint}, grain: ${g.grain}` };
}

const cameraLine = (c: ShotSpec['camera']) =>
  `${[c.size, c.angle].filter(Boolean).join(' ')} at ${c.fov_degrees}-degree FOV${c.movement ? `, ${c.movement}` : ', locked-off'}${c.device ? ` (${c.device})` : ''}`.trim();
const audioLine = (a?: ShotSpec['audio']) => {
  if (!a) return '';
  const parts: string[] = [];
  if (a.dialogue) parts.push(`${a.speaker ? a.speaker + ' says ' : ''}"${a.dialogue}"`);
  if (a.ambience) parts.push(`ambience: ${a.ambience}`);
  if (a.sfx?.length) parts.push(`sfx: ${a.sfx.join(', ')}`);
  if (a.silence) parts.push(`silence: ${a.silence}`);
  return parts.join('; ');
};

function blockFor(key: string, s: ShotSpec, st: ReturnType<typeof resolveShotStyle>): string | undefined {
  const k = key.toLowerCase();
  const beats = s.acting_beats?.map(b => `${b.t} ${b.beat}`).join(' → ');
  switch (k) {
    case 'subject': return s.subject;
    case 'action': case 'motion': case 'motion_instruction': case 'action_timing': return beats ? `${s.action} (${beats})` : s.action;
    case 'setting': case 'scene': case 'scene_context': case 'location_map': case 'background': return `${s.location}${s.time ? `, ${s.time}` : ''}`;
    case 'first_frame': return `${s.subject} already mid-action: ${s.action}`;
    case 'format_mode': return `single take${s.duration_s ? `, ${s.duration_s}s` : ''}`;
    case 'camera': case 'camera_preset': case 'optics': case 'size_angle': case 'movement': return cameraLine(s.camera);
    case 'lighting': case 'light': return s.lighting;
    case 'style': case 'mood': return [st.core, st.grade].filter(Boolean).join('. ');
    case 'audio': case 'speech': return audioLine(s.audio);
    case 'physics': return s.emotion ? `weight and inertia consistent with ${s.emotion}` : 'natural weight, inertia and material response';
    case 'positive_locks': return [`${s.duration_s ?? ''}${s.duration_s ? 's, ' : ''}1 camera device`, s.continuity?.wardrobe ? `wardrobe: ${s.continuity.wardrobe}` : '', s.continuity?.weather ? `weather: ${s.continuity.weather}` : ''].filter(Boolean).join('; ');
    case 'composition': return `${s.camera.size ?? ''} framing, ${s.camera.axis ?? 'stable axis'}`.trim();
    case 'color_palette': return '';
    case 'text_literal': case 'typography': case 'layout': return undefined;
    case 'reference_roles': case 'image_reference': case 'reference': return s.references?.length ? s.references.map((r, i) => `ref ${i + 1}: ${r}`).join('; ') : undefined;
    case 'change': return s.action;
    case 'keep_locked': return s.continuity?.characters?.length ? `keep unchanged: ${s.continuity.characters.join(', ')}, framing, background` : 'keep unchanged: face, pose, background';
    case 'character_soul_id': return s.continuity?.characters?.join(', ');
    default: return undefined;
  }
}

/**
 * Compile ONE Shot Spec into ONE engine dialect. Cinematic intent never mentions the model;
 * the adapter decides the grammar. Returns warnings from the Feasibility Veto, engine limits and the slop detector.
 */
export function compileShot(shot: ShotSpec, engineId: string): CompiledShot | undefined {
  const engine = getModel(engineId); if (!engine) return undefined;
  const adapter = getAdapter(engineId); const warnings: string[] = []; const st = resolveShotStyle(shot);
  const timingQA = validateShotTiming(shot);
  warnings.push(...timingQA.errors);
  // Feasibility Veto (G3) and engine limits
  if (shot.camera.fov_degrees >= 94 && (shot.emotion || shot.acting_beats?.length)) warnings.push('VETO: micro-acting at FOV >= 94 degrees — raise the shot size or lower the FOV.');
  if (engine.status === 'sunsetting') warnings.push(`ENGINE_SUNSET: ${engine.name} is sunsetting — do not start new pipelines on it.`);
  if (engine.duration_s && shot.duration_s && (shot.duration_s > engine.duration_s[1])) warnings.push(`DURATION: ${shot.duration_s}s exceeds ${engine.name} max ${engine.duration_s[1]}s — split with seams.`);
  if ((shot.needs_native_audio || shot.audio?.dialogue) && engine.kind === 'video' && !engine.native_audio) warnings.push(`AUDIO: ${engine.name} has no native audio — add dialogue/foley in post.`);
  if (shot.ratio && engine.aspect_ratios && !engine.aspect_ratios.includes(shot.ratio)) warnings.push(`RATIO: ${shot.ratio} not listed for ${engine.name} (${engine.aspect_ratios.join(', ')}).`);
  if (shot.audio?.dialogue && engine.speech) {
    const words = shot.audio.dialogue.trim().split(/\s+/).length; const budget = Math.round(engine.speech.max_words_per_10s * ((shot.duration_s ?? 10) / 10));
    if (words > budget) warnings.push(`SPEECH_LEN: ${words} words > ~${budget} for ${shot.duration_s ?? 10}s on ${engine.name}.`);
  }
  if (engine.confidence === 'low') warnings.push(`CONFIDENCE: specs for ${engine.name} are low-confidence (verified ${engine.verified_on}) — confirm on the platform.`);
  const structure = adapter?.structure ?? engine.grammar.structure;
  const dialect = adapter?.dialect ?? 'single_paragraph';
  const blocks = structure.map(key => ({ key, text: blockFor(key, shot, st) })).filter(b => b.text);
  const opticalResolution = shot.optics ? resolveOptics({
    ...shot.optics,
    movement: shot.optics.movement ?? shot.camera.movement,
    engine: shot.optics.engine ?? (engine.kind === 'image' ? 'generic' : 'video'),
  }) : undefined;
  const opticalPrompt = opticalResolution ? [
    `${opticalResolution.selectedFocalLengthMm}mm focal length`,
    `${opticalResolution.lens.family.replace(/-/g, ' ')}`,
    shot.optics?.aperture ? `aperture ${shot.optics.aperture}` : undefined,
    shot.optics?.depthOfField ? `${shot.optics.depthOfField} depth of field` : undefined,
    shot.optics?.sensorFormat && shot.optics.sensorFormat !== 'unknown' ? `${shot.optics.sensorFormat} sensor format` : undefined,
    shot.optics?.anamorphic ? 'anamorphic optical characteristics; specify squeeze ratio only when verified' : undefined,
  ].filter(Boolean).join(', ') : '';
  if (opticalResolution?.compatibility === 'verify-image-circle-and-mount') warnings.push('OPTICS_COMPATIBILITY: verify sensor image circle and lens mount before treating this as a real-camera configuration.');
  if (opticalResolution?.compatibility === 'unknown-format') warnings.push('OPTICS_FORMAT: sensor format is unspecified; optical compatibility remains unassessed.');
  if (opticalResolution) warnings.push('OPTICS_CATALOG: optical intent resolved; branded lens names are omitted from prompt output unless Brand Mode (G9) is explicitly handled.');
  let prompt: string;
  switch (dialect) {
    case 'twelve_block': prompt = structure.map(key => `${key.replace(/_/g, ' ').toUpperCase()}: ${blockFor(key, shot, st) ?? '[definir]'}`).join('\n'); break;
    case 'shot_list': prompt = `Shot 1${shot.duration_s ? ` (${shot.duration_s}s)` : ''}: ${[cameraLine(shot.camera), shot.action, audioLine(shot.audio)].filter(Boolean).join(' · ')}\nStyle: ${[st.core, st.grade].filter(Boolean).join('. ')}`; break;
    case 'json_scene': prompt = JSON.stringify({ scene: `${shot.location}${shot.time ? ', ' + shot.time : ''}`, subjects: [shot.subject], style: st.core, lighting: shot.lighting, mood: [shot.emotion, st.grade].filter(Boolean).join('. '), composition: blockFor('composition', shot, st), camera: cameraLine(shot.camera) }, null, 2); break;
    case 'flag_prose': prompt = `${[shot.subject, shot.action, shot.location, st.core].filter(Boolean).join(', ')} --ar ${shot.ratio ?? '16:9'}`; break;
    case 'json_dag': prompt = '// ComfyUI: build the node graph from this Shot Spec via the workflow skill (Skill 16); keep inputs[n].link in links[].\n' + JSON.stringify(shot, null, 2); break;
    case 'platform_ui': prompt = blocks.map(b => `${b.key}: ${b.text}`).join('\n'); break;
    default: prompt = blocks.map(b => b.text).join('. ') + '.';
  }
  if (opticalPrompt) prompt = [prompt, opticalPrompt].filter(Boolean).join('. ');
  if (adapter && /zh/i.test(adapter.notes)) warnings.push('NOTE: Chinese-native engine — an optional short Chinese keyword line can help (verify on platform).');
  const slop = cinemaSlop(prompt).map(i => `${i.id}: ${i.message}`);
  const modality: Modality = engine.kind === 'image' ? 'image' : engine.kind === 'audio' ? 'audio' : 'video';
  const qa = qualityLoop({
    modality, intent: [shot.subject, shot.action, shot.location, shot.emotion].filter(Boolean).join(' '),
    destination: shot.ratio ?? CONFIG.defaults.ratio,
    technical: { fov_degrees: shot.camera.fov_degrees, shutter_angle: 180, fps: engine.fps ?? CONFIG.defaults.fps },
    constraints: ['Preserve shot continuity', 'Keep one dominant camera device per short shot', 'Positive-only production instructions']
  }, prompt);
  const effectiveQualityStatus: AntiSlopStatus = timingQA.errors.length ? 'REGENERATE' : qa.status;
  const qualityWarnings = [`QUALITY_LOOP: ${effectiveQualityStatus}; AntiSlopScore ${qa.antiSlopScore}`,
    ...qa.findings.map(x => `QUALITY: ${x}`), ...qa.fixes.map(x => `QUALITY_FIX: ${x}`)];
  if (effectiveQualityStatus === 'REGENERATE') qualityWarnings.push('QUALITY_GATE: revise this shot only; do not regenerate the whole sequence.');
  return { engine, adapter, prompt, negative: st.negatives || undefined, warnings: [...warnings, ...slop, ...qualityWarnings], opticalNotes: opticalResolution ? [...opticalResolution.opticalNotes, ...opticalResolution.caveats] : undefined };
}
/** Compile a shot and enforce the delivery policy. Drafting remains available through compileShot(). */
export function compileShotForDelivery(shot: ShotSpec, engineId: string, policy: QualityGatePolicy = {}): CompiledShot | undefined {
  const out = compileShot(shot, engineId);
  if (!out) return undefined;
  const diagnostic = out.warnings.find(w => w.startsWith('QUALITY_LOOP:'));
  const status = (diagnostic?.match(/QUALITY_LOOP: (PASS|POLISH|REGENERATE|UNASSESSED)/)?.[1] ?? 'UNASSESSED') as AntiSlopStatus;
  const gate = qualityDeliveryGate(status, policy);
  out.deliveryGate = gate;
  out.warnings.push(`QUALITY_DELIVERY_GATE: ${gate.allowed ? 'ALLOW' : 'BLOCK'}; ${gate.reason}`);
  assertDeliverable(gate);
  return out;
}

/** One cinematic intent → many dialects. */
export const compileShotForAll = (shot: ShotSpec, engineIds: string[]) =>
  Object.fromEntries(engineIds.map(id => [id, compileShot(shot, id)]));

/* ───────── Model Intelligence (Skill 67) ───────── */
export interface ShotNeeds {
  kind: 'video' | 'image'; dialogue?: boolean; characters?: number; facialActing?: boolean; durationS?: number;
  identityRef?: boolean; nativeAudio?: boolean; budget?: 'low' | 'medium' | 'high'; styleAlias?: string; ratio?: string; mode?: string;
}
export interface ModelDecision { shot: string; needs: string[]; ranked: { engine_id: string; score: number; why: string[]; risk: string[]; cost: string }[]; decision?: string }
type MI = { weights: Record<string, number>; budget_tiers: Record<string, string[]> };
type Bench = { results: Record<string, Record<string, number>>; dimensions: string[] };
export function modelIntelligence(shotLabel: string, n: ShotNeeds, today = new Date()): ModelDecision {
  const mi = (TABLES as unknown as { model_intelligence: MI }).model_intelligence; const w = mi.weights;
  const bench = (TABLES as unknown as { engine_benchmark: Bench }).engine_benchmark.results;
  const style = n.styleAlias ? resolveStyle(n.styleAlias) : undefined;
  const tierOf = (id: string) => (Object.entries(mi.budget_tiers).find(([, ids]) => ids.includes(id))?.[0] ?? 'medium');
  const needs: string[] = [n.kind]; if (n.dialogue) needs.push('dialogue'); if (n.facialActing) needs.push('facial acting'); if (n.identityRef) needs.push('identity reference');
  if (n.nativeAudio) needs.push('native audio'); if (n.durationS) needs.push(`${n.durationS}s`); if (n.budget) needs.push(`budget ${n.budget}`);
  const ranked = MODELS.filter(m => m.kind === n.kind).map(m => {
    let score = 0; const why: string[] = []; const risk: string[] = []; const max = Object.values(w).reduce((a, b) => a + b, 0);
    if (n.dialogue) { if (m.speech) { score += w.dialogue; why.push('dialogue support'); } else risk.push('no dialogue support'); } else score += w.dialogue * 0.5;
    if (n.nativeAudio || n.dialogue) { if (m.native_audio) { score += w.native_audio; why.push('native audio'); } else risk.push('no native audio'); } else score += w.native_audio * 0.5;
    if (n.durationS && m.duration_s) { if (n.durationS <= m.duration_s[1]) { score += w.duration; } else { score += w.duration * 0.3; risk.push(`max ${m.duration_s[1]}s`); } } else score += w.duration * 0.6;
    if (n.identityRef) { const refs = (m.refs as { images?: number } | undefined)?.images ?? 0; if (refs >= 3) { score += w.references; why.push('multi-reference'); } else if (refs > 0) score += w.references * 0.5; else risk.push('weak identity control'); } else score += w.references * 0.5;
    if (n.ratio) { if (!m.aspect_ratios || m.aspect_ratios.includes(n.ratio)) score += w.ratio; else risk.push(`no ${n.ratio}`); } else score += w.ratio;
    if (n.mode) { if (m.modes?.includes(n.mode)) { score += w.mode; why.push(`${n.mode} supported`); } else if (m.modes) risk.push(`no ${n.mode}`); } else score += w.mode;
    if (style && (style.engines.video.includes(m.id) || style.engines.image.includes(m.id))) { score += w.style_affinity; why.push(`${style.alias} affinity`); } else score += w.style_affinity * 0.4;
    score += m.status === 'sunsetting' ? 0 : (m.status === 'rolling_out' ? w.status * 0.6 : w.status);
    if (m.status === 'sunsetting') risk.push('sunsetting');
    const cost = tierOf(m.id); if (n.budget) { score += cost === n.budget ? w.budget : (cost === 'low' || n.budget === 'high') ? w.budget * 0.7 : w.budget * 0.3; } else score += w.budget * 0.6;
    if (m.confidence === 'low') risk.push('low-confidence specs');
    const staleDays = (today.getTime() - new Date(m.verified_on).getTime()) / 86400000; if (staleDays > CONFIG.engine_lifecycle.stale_after_days) risk.push(`specs ${Math.round(staleDays)}d old`);
    let pct = (score / max) * 100;
    const b = bench[m.id]; if (b) { const vals = Object.values(b); if (vals.length) pct = pct * 0.6 + (vals.reduce((a, c) => a + c, 0) / vals.length) * 0.4; why.push('measured benchmark blended'); }
    return { engine_id: m.id, score: Math.round(pct), why, risk, cost };
  }).sort((a, b) => b.score - a.score);
  return { shot: shotLabel, needs, ranked, decision: ranked[0]?.engine_id };
}

/* ───────── Cinema Slop Detector (Skill 64) ───────── */
export interface SlopRule { id: string; severity: 'warn' | 'error'; pattern: string; message: string; fix: string }
export interface SlopHit { id: string; severity: 'warn' | 'error'; message: string; fix: string }
export const SLOP_RULES = (TABLES as unknown as { cinema_slop: { rules: SlopRule[] } }).cinema_slop.rules;
export function cinemaSlop(text: string): SlopHit[] {
  return SLOP_RULES.filter(r => { try { return new RegExp(r.pattern, 'i').test(text); } catch { return false; } })
    .map(r => ({ id: r.id, severity: r.severity, message: r.message, fix: r.fix }));
}
/** Classic prompt lint + cinema slop in one call. */
export const lintCinema = (text: string, opt: LintOptions = {}) => ({ lint: lintPrompt(text, opt), slop: cinemaSlop(text) });

/* ───────── Cinema Audit (Skill 64 · G12) ───────── */
export interface AuditDimension { id: string; label: string; weight: number }
export interface AuditFinding { dimension: string; level: 'CRITICAL' | 'WARNING' | 'RECOMMENDATION'; shots?: string[]; message: string; fix?: string }
export interface AuditResult { score: number; passed: boolean; byDimension: { id: string; label: string; score: number; level: 'ok' | 'warning' | 'critical' }[]; missing: string[]; critical: AuditFinding[]; warnings: AuditFinding[]; recommendations: AuditFinding[]; polishShots: string[] }
type AuditTable = { pass_score: number; dimensions: AuditDimension[]; severity: { critical_below: number; warning_below: number } };
export function cinemaAudit(scores: Partial<Record<string, number>>, findings: AuditFinding[] = []): AuditResult {
  const t = (TABLES as unknown as { audit_dimensions: AuditTable }).audit_dimensions;
  const present = t.dimensions.filter(d => typeof scores[d.id] === 'number'); const missing = t.dimensions.filter(d => typeof scores[d.id] !== 'number').map(d => d.id);
  const wSum = present.reduce((a, d) => a + d.weight, 0) || 1;
  const score = Math.round(present.reduce((a, d) => a + (scores[d.id] as number) * d.weight, 0) / wSum);
  const byDimension = present.map(d => { const s = scores[d.id] as number; return { id: d.id, label: d.label, score: s, level: (s < t.severity.critical_below ? 'critical' : s < t.severity.warning_below ? 'warning' : 'ok') as 'ok' | 'warning' | 'critical' }; });
  const critical: AuditFinding[] = [...findings.filter(f => f.level === 'CRITICAL'), ...byDimension.filter(d => d.level === 'critical').map(d => ({ dimension: d.id, level: 'CRITICAL' as const, message: `${d.label} scored ${d.score}/100` }))];
  const warnings = findings.filter(f => f.level === 'WARNING'); const recommendations = findings.filter(f => f.level === 'RECOMMENDATION');
  const polishShots = [...new Set([...critical, ...warnings].flatMap(f => f.shots ?? []))].sort();
  return { score, passed: score >= t.pass_score && critical.length === 0 && missing.length === 0, byDimension, missing, critical, warnings, recommendations, polishShots };
}
/** Polish = regenerate ONLY the shots that failed (never the whole film). */
export const polishPlan = (a: AuditResult) => a.polishShots.map(shot => ({ shot, reasons: [...a.critical, ...a.warnings].filter(f => f.shots?.includes(shot)).map(f => f.fix ?? f.message) }));

/* ───────── Artifact verdicts (Skill 63 · G13) ───────── */
export type Verdict = 'PASS' | 'WARN' | 'FAIL';
export function artifactVerdict(checks: Record<'human' | 'physics' | 'camera' | 'continuity', Record<string, Verdict>>) {
  const groups = Object.entries(checks).map(([group, items]) => ({ group, fails: Object.entries(items).filter(([, v]) => v === 'FAIL').map(([k]) => k), warns: Object.entries(items).filter(([, v]) => v === 'WARN').map(([k]) => k) }));
  const renderAgain = groups.some(g => g.fails.length > 0 || g.warns.length >= 2);
  return { renderAgain, groups, g13: !groups.some(g => g.fails.length > 0) };
}

/* ───────── Continuity + Asset Graph (Skill 70 · G11) ───────── */
export interface ShotNode {
  id: string; characters: string[]; location?: string; props?: string[]; style?: string; engine?: string;
  fov_degrees?: number; screen_direction?: 'left' | 'right' | 'center'; axis?: string; light_direction?: string; time?: string; weather?: string;
  wardrobe?: Record<string, string>; prop_state?: Record<string, string>; micro_acting?: boolean;
  /** Explicit editorial intent prevents continuity QA from treating designed discontinuities as accidental errors. */
  editorialIntent?: 'continuity' | 'cross_cut' | 'time_jump' | 'montage' | 'match_cut' | 'axis_break';
  /** Explicit causal evidence for a prop-state change introduced by this shot. */
  propTransitions?: { prop: string; from: string; to: string; cause: string; beat?: string }[];
}
export interface ContinuityIssue { level: 'CRITICAL' | 'WARNING'; check: string; between: [string, string]; message: string }
export function continuityCheck(a: ShotNode, b: ShotNode): ContinuityIssue[] {
  const out: ContinuityIssue[] = [];
  const between: [string, string] = [a.id, b.id];
  const sameLoc = Boolean(a.location && a.location === b.location);
  const intent = b.editorialIntent ?? a.editorialIntent ?? 'continuity';
  const crossCut = intent === 'cross_cut' || intent === 'montage';
  const timeJump = intent === 'time_jump' || intent === 'montage';
  const axisBreak = intent === 'axis_break' || intent === 'montage';
  const matchCut = intent === 'match_cut' || intent === 'montage';

  if (!crossCut && !axisBreak && sameLoc && a.axis && b.axis && a.axis !== b.axis) {
    out.push({ level: 'WARNING', check: '180-degree rule / camera axis', between, message: `axis ${a.axis} → ${b.axis} inside the same location` });
  }
  if (!crossCut && !axisBreak && sameLoc && a.screen_direction && b.screen_direction &&
      a.screen_direction !== 'center' && b.screen_direction !== 'center' && a.screen_direction !== b.screen_direction) {
    out.push({ level: 'WARNING', check: 'screen direction', between, message: `screen direction flips ${a.screen_direction} → ${b.screen_direction}` });
  }
  if (!timeJump) {
    for (const c of a.characters.filter(c => b.characters.includes(c))) {
      const wa = a.wardrobe?.[c], wb = b.wardrobe?.[c];
      if (wa && wb && wa !== wb && a.time === b.time) {
        out.push({ level: 'CRITICAL', check: 'wardrobe', between, message: `${c}: "${wa}" → "${wb}" with no time change` });
      }
    }
    if (sameLoc && a.light_direction && b.light_direction && a.light_direction !== b.light_direction && a.time === b.time) {
      out.push({ level: 'WARNING', check: 'light direction / sun position', between, message: `${a.light_direction} → ${b.light_direction}` });
    }
    if (sameLoc && a.time && b.time && a.time !== b.time) out.push({ level: 'WARNING', check: 'time of day', between, message: `${a.time} → ${b.time} in the same location` });
    if (sameLoc && a.weather && b.weather && a.weather !== b.weather) out.push({ level: 'WARNING', check: 'weather', between, message: `${a.weather} → ${b.weather}` });
    for (const p of (a.props ?? []).filter(p => (b.props ?? []).includes(p))) {
      const sa = a.prop_state?.[p], sb = b.prop_state?.[p];
      if (sa && sb && sa !== sb) {
        const transition = b.propTransitions?.find(t =>
          t.prop === p && t.from === sa && t.to === sb && t.cause.trim().length > 0
        );
        if (transition) {
          // A structured cause is sufficient to explain the state delta; a beat is recommended for production traceability.
          if (!transition.beat?.trim()) out.push({
            level: 'WARNING', check: 'causal traceability',
            between, message: `${p}: state change is explained by "${transition.cause}", but no acting beat is linked`
          });
        } else {
          out.push({ level: 'WARNING', check: 'prop position and state', between, message: `${p}: ${sa} → ${sb}` });
          out.push({ level: 'WARNING', check: 'unexplained state transition', between,
            message: `${p}: ${sa} → ${sb} has no matching propTransitions entry with a non-empty cause` });
        }
      }
    }
  }
  if (!matchCut && a.fov_degrees && b.fov_degrees && Math.abs(a.fov_degrees - b.fov_degrees) < 12 &&
      a.characters.join() === b.characters.join() && sameLoc) {
    out.push({ level: 'WARNING', check: 'focal relationship', between, message: `FOV ${a.fov_degrees}° → ${b.fov_degrees}° is too similar (jump-cut feel); change size by 12°+ or the angle by 30°+` });
  }
  if (b.micro_acting && (b.fov_degrees ?? 0) >= 94) {
    out.push({ level: 'CRITICAL', check: 'Feasibility Veto', between, message: 'micro-acting at FOV >= 94 degrees' });
  }
  return out;
}
export function sequenceContinuity(shots: ShotNode[]) { return shots.slice(1).flatMap((s, i) => continuityCheck(shots[i], s)); }

export interface StateLedgerSnapshot {
  shotId: string;
  props: Record<string, string>;
}
export interface StateLedgerFinding {
  level: 'WARNING' | 'CRITICAL';
  code: 'STATE_LEDGER_UNEXPLAINED_CHANGE' | 'STATE_LEDGER_FROM_MISMATCH' | 'STATE_LEDGER_TO_MISMATCH' | 'STATE_LEDGER_PROP_UNDECLARED' | 'STATE_LEDGER_CAUSE_MISSING' | 'STATE_LEDGER_BEAT_MISSING';
  shotId: string;
  previousShotId?: string;
  prop: string;
  expected?: string;
  actual?: string;
  message: string;
}
export interface StateLedgerResult {
  snapshots: StateLedgerSnapshot[];
  findings: StateLedgerFinding[];
}

/**
 * Deterministic per-sequence prop-state ledger. It validates only explicit prop_state
 * and propTransitions metadata; it never infers off-screen actions or custody.
 * Declared time jumps/montages do not require state continuity across the cut.
 */
export function buildStateLedger(shots: ShotNode[]): StateLedgerResult {
  const snapshots: StateLedgerSnapshot[] = shots.map(shot => ({
    shotId: shot.id,
    props: Object.fromEntries(Object.entries(shot.prop_state ?? {}).sort(([a], [b]) => a.localeCompare(b)))
  }));
  const findings: StateLedgerFinding[] = [];
  const add = (finding: StateLedgerFinding) => findings.push(finding);

  shots.forEach((shot, index) => {
    const previous = shots[index - 1];
    const previousState = previous?.prop_state ?? {};
    const currentState = shot.prop_state ?? {};
    const intent = shot.editorialIntent ?? previous?.editorialIntent ?? 'continuity';
    const discontinuity = intent === 'time_jump' || intent === 'montage';
    const transitions = shot.propTransitions ?? [];

    for (const transition of transitions) {
      if (!(shot.props ?? []).includes(transition.prop) && !(transition.prop in currentState)) {
        add({ level: 'WARNING', code: 'STATE_LEDGER_PROP_UNDECLARED', shotId: shot.id, previousShotId: previous?.id,
          prop: transition.prop, message: `${transition.prop}: transition references a prop absent from this shot's props and prop_state metadata` });
      }
      if (previous && !discontinuity && transition.prop in previousState && previousState[transition.prop] !== transition.from) {
        add({ level: 'WARNING', code: 'STATE_LEDGER_FROM_MISMATCH', shotId: shot.id, previousShotId: previous.id,
          prop: transition.prop, expected: previousState[transition.prop], actual: transition.from,
          message: `${transition.prop}: transition starts at "${transition.from}", previous shot records "${previousState[transition.prop]}"` });
      }
      if (transition.prop in currentState && currentState[transition.prop] !== transition.to) {
        add({ level: 'WARNING', code: 'STATE_LEDGER_TO_MISMATCH', shotId: shot.id, previousShotId: previous?.id,
          prop: transition.prop, expected: currentState[transition.prop], actual: transition.to,
          message: `${transition.prop}: transition ends at "${transition.to}", incoming shot records "${currentState[transition.prop]}"` });
      }
      if (!transition.cause?.trim()) {
        add({ level: 'WARNING', code: 'STATE_LEDGER_CAUSE_MISSING', shotId: shot.id, previousShotId: previous?.id,
          prop: transition.prop, message: `${transition.prop}: transition has no causal explanation` });
      } else if (!transition.beat?.trim()) {
        add({ level: 'WARNING', code: 'STATE_LEDGER_BEAT_MISSING', shotId: shot.id, previousShotId: previous?.id,
          prop: transition.prop, message: `${transition.prop}: causal explanation has no linked acting beat` });
      }
    }

    if (!previous || discontinuity) return;
    const sharedProps = (previous.props ?? []).filter(prop => (shot.props ?? []).includes(prop));
    for (const prop of sharedProps) {
      const from = previousState[prop], to = currentState[prop];
      if (!from || !to || from === to) continue;
      const transition = transitions.find(t => t.prop === prop && t.from === from && t.to === to && t.cause?.trim());
      if (!transition) add({
        level: 'WARNING', code: 'STATE_LEDGER_UNEXPLAINED_CHANGE', shotId: shot.id, previousShotId: previous.id,
        prop, expected: from, actual: to,
        message: `${prop}: state changes "${from}" → "${to}" without a matching causal transition`
      });
    }
  });

  return { snapshots, findings };
}
export class AssetGraph {
  private shots = new Map<string, ShotNode>();
  add(...ss: ShotNode[]) { ss.forEach(s => this.shots.set(s.id, s)); return this; }
  assets(): { characters: string[]; locations: string[]; props: string[]; styles: string[] } {
    const all = [...this.shots.values()]; const u = (a: (string | undefined)[]) => [...new Set(a.filter((x): x is string => !!x))].sort();
    return { characters: u(all.flatMap(s => s.characters)), locations: u(all.map(s => s.location)), props: u(all.flatMap(s => s.props ?? [])), styles: u(all.map(s => s.style)) };
  }
  /** Build a state ledger from the graph's shots in insertion order. */
  stateLedger(): StateLedgerResult { return buildStateLedger([...this.shots.values()]); }
  /** "If I change X, which shots must be regenerated?" */
  impactOf(asset: string): string[] {
    return [...this.shots.values()].filter(s => s.characters.includes(asset) || s.location === asset || (s.props ?? []).includes(asset) || s.style === asset || s.engine === asset).map(s => s.id).sort();
  }
}


/* ───────── Daniskills 3.3 Quality System: Hardness / Anti-Slop / Smart Sharpen ───────── */
export const QUALITY_COMMANDS = {
  '/hardness': 'hardness',
  '/anti-slop': 'antiSlop',
  '/smart-sharpen': 'smartSharpen',
  '/humanize': 'humanizeText',
  '/post-sharpen': 'postSharpenPlan',
  '/quality:loop': 'qualityLoop'
} as const;

export type QualityCommand = keyof typeof QUALITY_COMMANDS;
export function executeQualityCommand(command: QualityCommand, input: HardnessInput, text = '') {
  switch (command) {
    case '/hardness': return hardness(input);
    case '/anti-slop': return antiSlop(text, input.modality);
    case '/smart-sharpen': return smartSharpen(input);
    case '/humanize': return humanizeText(text);
    case '/post-sharpen': return postSharpenPlan({ modality: input.modality, destination: input.destination });
    case '/quality:loop': return qualityLoop(input, text);
  }
}

export type Modality = 'image' | 'audio' | 'video' | 'text' | 'script';
export type QualityStatus = 'PASS' | 'POLISH' | 'REGENERATE';
export type AntiSlopStatus = QualityStatus | 'UNASSESSED';

export interface HardnessInput {
  modality: Modality;
  intent: string;
  audience?: string;
  destination?: string;
  constraints?: string[];
  technical?: Record<string, unknown>;
}
export interface SharpenSpec {
  modality: Modality;
  intent: string;
  decisions: string[];
  technical: Record<string, unknown>;
  locks: string[];
}
export interface AntiSlopResult {
  modality: Modality;
  score: number | 'UNASSESSED';
  status: AntiSlopStatus;
  hits: { id: string; severity: 'warn' | 'error'; message: string; fix: string }[];
  dimensions: Record<string, number>;
}
export interface PostSharpenPlan {
  modality: Modality;
  destination: string;
  steps: string[];
  cautions: string[];
}
export interface QualityLoopResult {
  status: AntiSlopStatus;
  antiSlopScore: number | 'UNASSESSED';
  findings: string[];
  fixes: string[];
  postPlan: PostSharpenPlan;
}

const EMPTY_ADJECTIVES = /\b(ultra[- ]?real(?:istic)?|hyper[- ]?real(?:istic)?|8k|masterpiece|stunning|epic|cinematic|highly detailed|amazing|beautiful|award[- ]?winning|premium|viral|next[- ]?level)\b/gi;
const MODALITY_SLOP: Record<Modality, { id: string; pattern: RegExp; fix: string }[]> = {
  image: [
    { id: 'IMG_GENERIC_COMPOSITION', pattern: /beautiful composition|perfect composition|stunning composition/i, fix: 'specify subject hierarchy, position, scale and negative space' },
    { id: 'IMG_PLASTIC_TEXTURE', pattern: /perfect skin|flawless skin|plastic skin/i, fix: 'specify natural skin texture, pore scale and light response' }
  ],
  video: [
    { id: 'VID_UNMOTIVATED_CAMERA', pattern: /dynamic camera|epic camera movement|cinematic camera/i, fix: 'name one motivated camera device, direction, speed and duration' },
    { id: 'VID_GENERIC_ACTION', pattern: /dramatic action|epic movement|cinematic motion/i, fix: 'define the physical action as timed beats' }
  ],
  audio: [
    { id: 'AUD_TRAILER_CLICHE', pattern: /epic trailer|cinematic whoosh|epic sound/i, fix: 'define source, perspective, duration, dynamics and acoustic space' },
    { id: 'AUD_GENERIC_VOICE', pattern: /powerful voice|cinematic voice|perfect voice/i, fix: 'define delivery, distance, room response and dynamics' }
  ],
  script: [
    { id: 'SCRIPT_FORMULAIC_OPEN', pattern: /in a world where|little did .* know|it all changed when/i, fix: 'open with a concrete event, image, conflict or decision' },
    { id: 'SCRIPT_ABSTRACT_EMOTION', pattern: /a journey of|tale of|powerful story about/i, fix: 'replace abstraction with observable behavior and stakes' }
  ],
  text: [
    { id: 'TEXT_AI_FORMULA', pattern: /in today'?s (?:fast[- ]?paced|ever[- ]?changing) world|unlock the power of|game[- ]?changer/i, fix: 'replace formula with a concrete claim, example or action' },
    { id: 'TEXT_EMPTY_PROMISE', pattern: /take your .* to the next level|revolutionize|transform your/i, fix: 'state the measurable benefit or specific action' }
  ]
};

export function hardness(input: HardnessInput): SharpenSpec {
  const decisions: string[] = [];
  const technical: Record<string, unknown> = { ...(input.technical ?? {}) };
  const locks = [...(input.constraints ?? [])];
  if (input.modality === 'video' || input.modality === 'image') {
    if (technical.fov_degrees == null) technical.fov_degrees = 47;
    if (technical.kelvin == null) technical.kelvin = 5600;
  }
  if (input.modality === 'video') {
    if (technical.shutter_angle == null) technical.shutter_angle = 180;
    if (technical.fps == null) technical.fps = 24;
  }
  decisions.push(`resolve subject/action hierarchy for ${input.modality}`);
  if (input.destination) decisions.push(`optimize for destination: ${input.destination}`);
  if (input.audience) decisions.push(`optimize information density for audience: ${input.audience}`);
  return { modality: input.modality, intent: input.intent.trim(), decisions, technical, locks };
}

export function smartSharpen(input: HardnessInput | SharpenSpec): SharpenSpec {
  const spec = 'decisions' in input ? input : hardness(input);
  const decisions = [...spec.decisions];
  const technical = { ...spec.technical };
  if (spec.modality === 'video') {
    technical.shutter_angle ??= 180;
    technical.fps ??= 24;
    decisions.push('motivate camera movement with physical and narrative cause');
  }
  if (spec.modality === 'audio') decisions.push('resolve source distance, perspective, acoustic space, dynamics and silence');
  if (spec.modality === 'script' || spec.modality === 'text') decisions.push('resolve voice, audience, concrete behavior, rhythm and information density');
  if (spec.modality === 'image') decisions.push('resolve composition, perspective, light direction, material response and texture');
  return { ...spec, decisions: [...new Set(decisions)], technical };
}

export function antiSlop(text: string, modality: Modality): AntiSlopResult {
  const hits: AntiSlopResult['hits'] = [];
  if (!text.trim()) {
    return { modality, score: 'UNASSESSED', status: 'UNASSESSED', hits, dimensions: {} };
  }
  const empty = text.match(EMPTY_ADJECTIVES) ?? [];
  empty.forEach((term, i) => hits.push({ id: `EMPTY_ADJECTIVE_${i + 1}`, severity: 'warn', message: `empty adjective: ${term}`, fix: 'replace adjective with an observable production parameter' }));
  for (const rule of MODALITY_SLOP[modality]) if (rule.pattern.test(text)) hits.push({ id: rule.id, severity: 'warn', message: `formula detected for ${modality}`, fix: rule.fix });
  // Evidence-aware deterministic heuristic: vocabulary alone must not produce a PASS.
  const evidence = {
    observableAction: /\b(cross(?:es|ed|ing)?|walk(?:s|ed|ing)?|run(?:s|ning)?|turn(?:s|ed|ing)?|open(?:s|ed|ing)?|close(?:s|d|ing)?|push(?:es|ed|ing)?|pull(?:s|ed|ing)?|fall(?:s|en|ing)?|compress(?:es|ed|ing)?|break(?:s|ing)?|drift(?:s|ed|ing)?|flicker(?:s|ed|ing)?|speaks|whispers|pauses|moves|stops|accelerates|decelerates|cuts|fades)\b/i.test(text),
    subjectOrSource: /\b(courier|person|character|subject|vehicle|door|light|camera|voice|speaker|footstep|engine|wind|water|object|performer|narrator|music|sound|rain|crowd|hand|face|animal|product|device)\b/i.test(text),
    settingOrPerspective: /\b(in|inside|outside|across|through|behind|beside|at|from|foreground|background|close-up|wide shot|overhead|eye-level|room|courtyard|street|hallway|studio|forest|coast|surface|distance|perspective)\b/i.test(text),
    measurableConstraint: /\b\d+(?:\.\d+)?\s*(?:degrees?|°|mm|cm|m|seconds?|secs?|s|fps|hz|khz|db|k|kelvin|%)\b|\b180°\b/i.test(text),
    causalRelation: /\b(because|causes?|so that|therefore|as a result|compress(?:es|ed)? into|driven by|motivated by|in response to|while|until)\b/i.test(text),
    explicitConstraint: /\b(only|single|one|maintain|preserve|fixed|locked|remains|without|consistent|exactly|must)\b/i.test(text),
    temporalStructure: /\b(first|then|before|after|until|pause|beat|timing|rhythm|duration|cut|hold|silence|pace|at \d+(?:\.\d+)?s)\b/i.test(text),
    materialResponse: /\b(water|metal|wood|fabric|glass|skin|stone|dust|grain|surface|texture|reflection|ripples?|condensation|friction|reverb|acoustic)\b/i.test(text)
  };
  const evidenceCount = Object.values(evidence).filter(Boolean).length;
  const specificity = Math.min(20, 2 + evidenceCount * 3);
  // Originality is credited for grounded combinations, not merely for avoiding banned phrases.
  const groundedPairs = Number(evidence.observableAction && evidence.subjectOrSource)
    + Number(evidence.settingOrPerspective && evidence.materialResponse)
    + Number(evidence.causalRelation && evidence.temporalStructure)
    + Number(evidence.measurableConstraint && evidence.explicitConstraint);
  const originality = Math.min(20, 9 + groundedPairs * 4);
  const technicalPattern: Record<Modality, RegExp> = {
    image: /\b(FOV|degrees?|Kelvin|\d{3,4}\s*K|aperture|focal length|HEX|light source|key light|fill light|shadow direction|aspect ratio)\b/i,
    video: /\b(FOV|degrees?|Kelvin|\d{3,4}\s*K|180°|shutter|fps|frame rate|camera|lens|cut|duration|seconds?|tracking|pan|tilt|dolly)\b/i,
    audio: /\b(dB|Hz|kHz|LUFS|seconds?|duration|reverb|acoustic|distance|perspective|stereo|mono|transient|dynamic range|silence|source)\b/i,
    text: /\b(audience|claim|example|source|evidence|specific|paragraph|headline|word count|tone|voice|structure|context|fact)\b/i,
    script: /\b(scene|beat|dialogue|character|action|INT\.|EXT\.|slugline|duration|pause|cut|motivation|stakes|subtext)\b/i
  };
  let technical = technicalPattern[modality].test(text) && (evidence.measurableConstraint || /\b(camera|lens|light source|key light|fill light|aspect ratio|frame rate|tracking|pan|tilt|dolly|dB|Hz|kHz|LUFS|reverb|acoustic|stereo|mono|audience|claim|example|source|evidence|word count|scene|beat|dialogue|INT\.|EXT\.)\b/i.test(text)) ? 15 : 6;

  // Hard contradictions are explicit QA findings and reduce technical credit.
  let technicalConflictCount = 0;
  if ((modality === 'video' || modality === 'image') && /\bFOV\s*\d+(?:\.\d+)?\s*mm\b/i.test(text)) {
    hits.push({ id: 'FOV_UNIT_CONFLICT', severity: 'error', message: 'FOV is expressed in millimeters instead of degrees', fix: 'Express field of view in degrees; if millimeters describe the lens focal length, label focal length separately.' });
    technicalConflictCount++;
  }
  if (modality === 'video') {
    const shutterAngles = [...text.matchAll(/\b(\d{1,3})\s*°\s*shutter\b|\bshutter(?: angle)?\s*(?:of\s*)?(\d{1,3})\s*°/gi)]
      .map(match => Number(match[1] ?? match[2]))
      .filter(value => value > 0 && value <= 360);
    const uniqueAngles = [...new Set(shutterAngles)];
    if (uniqueAngles.length > 1) {
      hits.push({ id: 'SHUTTER_ANGLE_CONFLICT', severity: 'error', message: 'Multiple shutter angles are specified without shot-specific separation', fix: 'Choose one shutter angle for this shot or assign each angle to a clearly separated shot.' });
      technicalConflictCount++;
    }
  }
  technical = Math.max(0, technical - technicalConflictCount * 10);
  const humanity = evidence.observableAction && (evidence.subjectOrSource || evidence.causalRelation) ? 15 : evidence.observableAction || evidence.causalRelation ? 10 : 4;
  const materiality = evidence.materialResponse ? 10 : 3;
  const rhythm = evidence.temporalStructure ? 10 : 3;
  const cliché = Math.max(0, 10 - Math.min(10, hits.length * 3));
  const score = specificity + originality + technical + humanity + materiality + rhythm + cliché;
  const status: AntiSlopStatus = hits.some(hit => hit.severity === 'error') ? 'REGENERATE' : score >= 90 ? 'PASS' : score >= 80 ? 'POLISH' : 'REGENERATE';
  return { modality, score, status, hits, dimensions: { specificity, originality, technical, humanity, materiality, rhythm, absence_of_cliches: cliché } };
}

export function humanizeText(text: string): string {
  return text
    .replace(/\b(in today(?:'|’)?s (?:fast[- ]?paced|ever[- ]?changing) world)\b/gi, (m) => /^[I]/.test(m) ? 'In practice' : 'in practice')
    .replace(/\b(leverage|utilize)\b/gi, 'use')
    .replace(/\b(delves into|journey|game[- ]?changer|unlock the power of)\b/gi, (m) => ({ 'delves into': 'explores', 'journey': 'process', 'game-changer': 'change', 'unlock the power of': 'make better use of' }[m.toLowerCase()] ?? m))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function postSharpenPlan(asset: { modality: Modality; destination?: string }): PostSharpenPlan {
  const destination = asset.destination ?? 'general';
  const steps: string[] = [];
  const cautions: string[] = [];
  if (asset.modality === 'image') steps.push('controlled upscale', 'selective microcontrast recovery', 'artifact cleanup', 'edge and skin inspection');
  if (asset.modality === 'video') steps.push('temporal artifact cleanup', 'controlled upscale', 'motion-aware detail recovery', 'edge and skin inspection');
  if (asset.modality === 'audio') steps.push('noise/artifact cleanup', 'dynamic-range check', 'perspective and ambience check');
  if (asset.modality === 'text' || asset.modality === 'script') steps.push('second-pass repetition cut', 'abstraction check', 'voice consistency check');
  cautions.push('avoid halos, plastic texture, invented detail, temporal shimmer and over-compression');
  if (/social|reel|short/i.test(destination)) cautions.push('prioritize first-frame legibility and small-screen readability');
  return { modality: asset.modality, destination, steps, cautions };
}

export function antiSlopScore(text: string, modality: Modality): number | 'UNASSESSED' {
  return antiSlop(text, modality).score;
}

export function qualityLoop(input: HardnessInput, generatedText: string): QualityLoopResult {
  const sharpened = smartSharpen(input);
  const audit = antiSlop(generatedText, input.modality);
  const postPlan = postSharpenPlan({ modality: input.modality, destination: input.destination });
  const findings = audit.hits.map(h => h.message);
  const fixes = audit.hits.map(h => h.fix);
  const status: AntiSlopStatus = audit.status;
  if (status === 'UNASSESSED') {
    findings.push('Insufficient material for quality assessment');
    fixes.push('Provide non-empty generated content before scoring or delivery');
  }
  if (sharpened.technical.fov_degrees != null && (input.modality === 'image' || input.modality === 'video')) {
    if (!findings.includes('FOV resolved')) findings.push('FOV resolved in degrees');
  }
  return { status, antiSlopScore: audit.score, findings, fixes, postPlan };
}


export interface QualityGatePolicy {
  allowPolish?: boolean;
  allowUnassessed?: boolean;
  overrideReason?: string;
}
export interface QualityDeliveryGate {
  status: AntiSlopStatus;
  allowed: boolean;
  blocked: boolean;
  requiresReview: boolean;
  reason: string;
  overrideAccepted: boolean;
}
export function qualityDeliveryGate(status: AntiSlopStatus, policy: QualityGatePolicy = {}): QualityDeliveryGate {
  const overrideAccepted = Boolean(policy.overrideReason?.trim());
  if (status === 'PASS') return { status, allowed: true, blocked: false, requiresReview: false, reason: 'Quality score meets the delivery threshold.', overrideAccepted: false };
  if (status === 'POLISH') {
    const allowed = Boolean(policy.allowPolish || overrideAccepted);
    return { status, allowed, blocked: !allowed, requiresReview: true, reason: allowed ? (overrideAccepted ? `Explicit override: ${policy.overrideReason!.trim()}` : 'POLISH accepted by delivery policy; review remains required.') : 'POLISH requires revision or explicit policy acceptance.', overrideAccepted };
  }
  if (status === 'UNASSESSED') {
    const allowed = Boolean(policy.allowUnassessed || overrideAccepted);
    return { status, allowed, blocked: !allowed, requiresReview: true, reason: allowed ? (overrideAccepted ? `Explicit override: ${policy.overrideReason!.trim()}` : 'UNASSESSED accepted explicitly by delivery policy.') : 'Insufficient evidence: assess quality before delivery.', overrideAccepted };
  }
  return { status, allowed: overrideAccepted, blocked: !overrideAccepted, requiresReview: true, reason: overrideAccepted ? `Explicit override: ${policy.overrideReason!.trim()}` : 'REGENERATE blocks delivery until the failing content is revised.', overrideAccepted };
}
export function assertDeliverable(gate: QualityDeliveryGate): void {
  if (!gate.allowed) throw new Error(`QUALITY_GATE_BLOCKED: ${gate.status}. ${gate.reason}`);
}

/* ───────── Director Profiles + Design Tokens (Skill 60 / Cinematic Design System) ───────── */
export interface DirectorProfile { id: string; camera: string; composition: string; lighting: string; color: string; editing: string; performance: string; sound: string; dna: string[] }
export const DIRECTOR_PROFILES = (TABLES as unknown as { director_profiles: { profiles: DirectorProfile[] } }).director_profiles.profiles;
export const directorProfile = (idOrDna: string) => DIRECTOR_PROFILES.find(p => p.id === idOrDna || p.dna.some(d => key(d) === key(idOrDna)));
export function designToken(path: string): unknown {
  const t = (TABLES as unknown as { design_tokens: Record<string, Record<string, unknown>> }).design_tokens; const group = path.split('.')[0];
  return t[group]?.[path];
}

/* ───────── Project Bible scaffold (Skill 65 · G10) ───────── */
export function projectBibleScaffold(): { file: string; role: string }[] { return (TABLES as unknown as { project_bible_files: { file: string; role: string }[] }).project_bible_files; }
export function gateG10(files: Record<string, string>) {
  const need = projectBibleScaffold().map(f => f.file); const missing = need.filter(f => !(f in files) || !files[f].trim());
  const core = ['PROJECT.md', 'STYLE_BIBLE.md'].filter(f => missing.includes(f));
  return { passed: core.length === 0, missingCore: core, missingOptional: missing.filter(f => !core.includes(f)) };
}

export default { CONFIG, MODELS, PROFILES, SKILLS, STYLES, PIPELINES, ROUTES, GATES, SKILLS_V26, resolveStyle, routeTask, recommendEngines, compilePrompt, lintPrompt, profileKit, expandSkillChain, wordBudget, hashtags, brandGate, detectBrands, disclosureBlock, blendStyles, gradeCard, styleGradeLine, saturationLabel,
  ADAPTERS, getAdapter, compileShot, compileShotForDelivery, compileShotForAll, compilePromptForDelivery, qualityDeliveryGate, assertDeliverable, modelIntelligence, cinemaSlop, lintCinema, cinemaAudit, polishPlan, hardness, smartSharpen, antiSlop, antiSlopScore, humanizeText, postSharpenPlan, qualityLoop, QUALITY_COMMANDS, executeQualityCommand,
  artifactVerdict, continuityCheck, sequenceContinuity, AssetGraph, directorProfile, designToken, projectBibleScaffold, gateG10 };
