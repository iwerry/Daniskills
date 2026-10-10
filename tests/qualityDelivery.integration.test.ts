import { describe, expect, it } from 'vitest';
import { resolveOptics } from '../opticsCatalog';
import {
  compilePrompt,
  compilePromptForDelivery,
  compileShot,
  compileShotForDelivery,
  continuityCheck,
  sequenceContinuity,
  buildStateLedger,
  AssetGraph,
  validateShotTiming
} from '../skillsData';

const minimalShot = {
  shot_id: 'integration-minimal',
  subject: 'object',
  action: 'moves',
  location: 'room',
  camera: { fov_degrees: 47 },
  lighting: 'light'
};

describe('sequence continuity editorial intent', () => {
  const shotA = {
    id: 'A', characters: ['Mara'], location: 'warehouse', props: ['case'],
    fov_degrees: 47, axis: 'north', screen_direction: 'left' as const,
    time: 'night', wardrobe: { Mara: 'dark coat' }, prop_state: { case: 'closed' }
  };

  it('flags axis, screen direction, wardrobe and prop-state discontinuities by default', () => {
    const shotB = {
      ...shotA, id: 'B', axis: 'south', screen_direction: 'right' as const,
      wardrobe: { Mara: 'white shirt' }, prop_state: { case: 'open' }
    };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === '180-degree rule / camera axis')).toBe(true);
    expect(issues.some(issue => issue.check === 'screen direction')).toBe(true);
    expect(issues.some(issue => issue.check === 'wardrobe' && issue.level === 'CRITICAL')).toBe(true);
    expect(issues.some(issue => issue.check === 'prop position and state')).toBe(true);
    expect(sequenceContinuity([shotA, shotB])).toHaveLength(issues.length);
  });

  it('flags a prop state change without explicit causal evidence', () => {
    const shotB = { ...shotA, id: 'B', prop_state: { case: 'open' } };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === 'unexplained state transition')).toBe(true);
  });

  it('accepts a state transition with a cause and warns when no acting beat is linked', () => {
    const shotB = {
      ...shotA, id: 'B', prop_state: { case: 'open' },
      propTransitions: [{ prop: 'case', from: 'closed', to: 'open', cause: 'Mara opens the latch' }]
    };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === 'unexplained state transition')).toBe(false);
    expect(issues.some(issue => issue.check === 'causal traceability')).toBe(true);
  });

  it('accepts a causally explained state change linked to an acting beat', () => {
    const shotB = {
      ...shotA, id: 'B', prop_state: { case: 'open' },
      propTransitions: [{
        prop: 'case', from: 'closed', to: 'open',
        cause: 'Mara opens the latch', beat: '00:02 Mara lifts the lid'
      }]
    };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === 'unexplained state transition')).toBe(false);
    expect(issues.some(issue => issue.check === 'causal traceability')).toBe(false);
    expect(issues.some(issue => issue.check === 'prop position and state')).toBe(false);
  });


  it('builds ordered state snapshots and identifies unexplained state changes', () => {
    const shotB = { ...shotA, id: 'B', prop_state: { case: 'open' } };
    const ledger = buildStateLedger([shotA, shotB]);
    expect(ledger.snapshots).toEqual([
      { shotId: 'A', props: { case: 'closed' } },
      { shotId: 'B', props: { case: 'open' } }
    ]);
    expect(ledger.findings.some(f => f.code === 'STATE_LEDGER_UNEXPLAINED_CHANGE' && f.prop === 'case')).toBe(true);
  });

  it('reports from/to state mismatches in explicit transitions', () => {
    const shotB = {
      ...shotA, id: 'B', prop_state: { case: 'ajar' },
      propTransitions: [{ prop: 'case', from: 'locked', to: 'open', cause: 'Mara opens the latch', beat: '00:02 Mara lifts the lid' }]
    };
    const ledger = buildStateLedger([shotA, shotB]);
    expect(ledger.findings.some(f => f.code === 'STATE_LEDGER_FROM_MISMATCH')).toBe(true);
    expect(ledger.findings.some(f => f.code === 'STATE_LEDGER_TO_MISMATCH')).toBe(true);
  });

  it('does not require state continuity across declared time jumps', () => {
    const shotB = {
      ...shotA, id: 'B', prop_state: { case: 'open' }, editorialIntent: 'time_jump' as const
    };
    const ledger = buildStateLedger([shotA, shotB]);
    expect(ledger.findings.some(f => f.code === 'STATE_LEDGER_UNEXPLAINED_CHANGE')).toBe(false);
  });

  it('exposes the same deterministic ledger through AssetGraph', () => {
    const shotB = { ...shotA, id: 'B', prop_state: { case: 'open' } };
    const graph = new AssetGraph().add(shotA, shotB);
    expect(graph.stateLedger()).toEqual(buildStateLedger([shotA, shotB]));
  });

  it('honors declared cross-cuts and axis breaks without suppressing feasibility vetoes', () => {
    const shotB = {
      ...shotA, id: 'B', axis: 'south', screen_direction: 'right' as const,
      editorialIntent: 'cross_cut' as const, micro_acting: true, fov_degrees: 100
    };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === '180-degree rule / camera axis')).toBe(false);
    expect(issues.some(issue => issue.check === 'screen direction')).toBe(false);
    expect(issues.some(issue => issue.check === 'Feasibility Veto')).toBe(true);
  });

  it('allows a declared time jump to change wardrobe and time of day', () => {
    const shotB = {
      ...shotA, id: 'B', time: 'dawn', wardrobe: { Mara: 'linen jacket' },
      editorialIntent: 'time_jump' as const
    };
    const issues = continuityCheck(shotA, shotB);
    expect(issues.some(issue => issue.check === 'wardrobe')).toBe(false);
    expect(issues.some(issue => issue.check === 'time of day')).toBe(false);
  });

  it('treats a match cut as intentional even when focal relationship repeats', () => {
    const shotB = { ...shotA, id: 'B', editorialIntent: 'match_cut' as const };
    expect(continuityCheck(shotA, shotB).some(issue => issue.check === 'focal relationship')).toBe(false);
  });
});

describe('delivery wrappers', () => {

  it('integrates generic optical intent without leaking branded lens names into the prompt', () => {
    const shot = {
      shot_id: 'optics-integration',
      subject: 'A ceramic artist',
      action: 'turns a clay bowl toward the window',
      location: 'a working ceramics studio',
      camera: { fov_degrees: 47, movement: 'slow push-in' },
      lighting: '5600K window daylight',
      optics: {
        intent: 'portrait' as const,
        focalLengthMm: 85,
        sensorFormat: 'full-frame' as const,
        aperture: 'T2.0',
        depthOfField: 'shallow' as const,
      },
    };
    const resolved = resolveOptics(shot.optics);
    const result = compileShot(shot, 'veo_3_1');
    expect(result).toBeDefined();
    expect(result?.prompt).toContain(`${resolved.selectedFocalLengthMm}mm focal length`);
    expect(result?.prompt).toContain('spherical cinema prime');
    expect(result?.prompt).toContain('aperture T2.0');
    expect(result?.prompt).not.toMatch(/Cooke|ARRI|ZEISS|Sony|RED/i);
    expect(result?.opticalNotes?.length).toBeGreaterThan(0);
  });

  it('flags acting beats that exceed duration or run backwards in time', () => {
    const base = {
      shot_id: 'timing-qa',
      subject: 'A courier',
      action: 'crosses the wet courtyard and opens a gate',
      location: 'a stone courtyard at dawn',
      camera: { fov_degrees: 47, movement: 'slow lateral track' },
      lighting: '5600K skylight',
      duration_s: 6,
      acting_beats: [
        { t: '0s', beat: 'enters frame' },
        { t: '4.5s', beat: 'reaches the gate' },
        { t: '7s', beat: 'opens the gate' }
      ]
    };
    const overrun = validateShotTiming(base);
    expect(overrun.errors.some(error => error.startsWith('TIMING_BEYOND_DURATION'))).toBe(true);

    const outOfOrder = validateShotTiming({
      ...base,
      duration_s: 8,
      acting_beats: [
        { t: '4s', beat: 'reaches the gate' },
        { t: '2s', beat: 'turns toward the gate' }
      ]
    });
    expect(outOfOrder.errors.some(error => error.startsWith('TIMING_ORDER_CONFLICT'))).toBe(true);
  });

  it('blocks delivery when explicit beat timestamps contradict shot duration', () => {
    const shot = {
      shot_id: 'timing-gate',
      subject: 'A courier',
      action: 'crosses a wet stone courtyard, pauses, then opens a metal gate',
      location: 'an enclosed courtyard at dawn',
      camera: { fov_degrees: 47, movement: 'slow lateral track' },
      lighting: '5600K dawn skylight',
      duration_s: 5,
      acting_beats: [
        { t: '0s', beat: 'crosses the courtyard' },
        { t: '6s', beat: 'opens the gate' }
      ]
    };
    expect(() => compileShotForDelivery(shot, 'veo_3_1')).toThrow(/QUALITY_GATE_BLOCKED: REGENERATE/);
  });

  it('blocks a weak shot at the delivery boundary by default', () => {
    expect(() => compileShotForDelivery(minimalShot, 'veo_3_1'))
      .toThrow(/^QUALITY_GATE_BLOCKED: /);
  });

  it('allows an explicitly overridden shot and attaches its gate result', () => {
    const result = compileShotForDelivery(minimalShot, 'veo_3_1', {
      overrideReason: 'Integration test: explicit editorial override'
    });
    expect(result?.deliveryGate?.allowed).toBe(true);
    expect(result?.deliveryGate?.overrideAccepted).toBe(true);
    expect(result?.warnings.some(w => w.startsWith('QUALITY_DELIVERY_GATE: ALLOW'))).toBe(true);
  });

  it('allows a prompt that passes the quality threshold and records the delivery decision', () => {
    const req = {
      engineId: 'veo_3_1',
      subject: 'A courier crosses a wet stone courtyard',
      setting: 'a wet stone courtyard enclosed at dawn',
      action: 'walks toward a metal gate, pauses for 2 seconds, then opens it',
      camera: 'slow lateral track',
      lighting: '5600K dawn skylight with warm practical lamps',
      physics: 'footfalls compress water into small ripples',
      durationS: 6
    };
    const out = compilePromptForDelivery(req);
    expect(out.warnings.some(w => w.startsWith('QUALITY_LOOP: PASS'))).toBe(true);
    expect(out.warnings.some(w => w.startsWith('QUALITY_DELIVERY_GATE: ALLOW'))).toBe(true);
  });

  it('blocks a slop-heavy prompt unless a reasoned override is provided', () => {
    const req = {
      engineId: 'veo_3_1',
      subject: 'ultra realistic stunning masterpiece',
      setting: 'room',
      action: 'dramatic action with epic movement and cinematic motion',
      camera: 'dynamic camera',
      lighting: 'beautiful cinematic light',
      physics: 'epic movement'
    };
    expect(() => compilePromptForDelivery(req)).toThrow(/QUALITY_GATE_BLOCKED: REGENERATE/);
    const overridden = compilePromptForDelivery(req, {
      overrideReason: 'Editorial exception for integration coverage'
    });
    expect(overridden.warnings.some(w => w.startsWith('QUALITY_LOOP: REGENERATE'))).toBe(true);
    expect(overridden.warnings.some(w => w.startsWith('QUALITY_DELIVERY_GATE: ALLOW; Explicit override'))).toBe(true);
  });

  it('keeps the Quality Loop active when Brand Mode G9 is inactive', () => {
    const out = compilePrompt({
      engineId: 'veo_3_1',
      subject: 'A courier crosses a wet stone courtyard',
      setting: 'an enclosed courtyard at dawn',
      action: 'walks toward a metal gate',
      camera: 'slow lateral track',
      lighting: '5600K dawn skylight with warm practical lamps',
      physics: 'footfalls compress water into small ripples',
      brand: { brand: '', product: '', usage: 'organico' }
    });
    expect(out.warnings.some(w => w.startsWith('G9 inativo'))).toBe(true);
    expect(out.warnings.some(w => w.startsWith('QUALITY_LOOP:'))).toBe(true);
  });

  it('runs the Quality Loop with Brand Mode G9 active', () => {
    const out = compilePrompt({
      engineId: 'veo_3_1',
      subject: 'A courier crosses a wet stone courtyard',
      setting: 'an enclosed courtyard at dawn',
      action: 'walks toward a metal gate',
      camera: 'slow lateral track',
      lighting: '5600K dawn skylight with warm practical lamps',
      physics: 'footfalls compress water into small ripples',
      brand: {
        brand: 'Example Camera',
        product: 'X1',
        relationship: 'sem_vinculo',
        context: 'held at chest height',
        contextCompatible: true,
        usage: 'organico',
        referencePhoto: true
      }
    });
    expect(out.disclosure).toBeTruthy();
    expect(out.warnings.some(w => w.startsWith('QUALITY_LOOP:'))).toBe(true);
  });
});
