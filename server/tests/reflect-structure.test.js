const {
  normalizeReflect,
  filterStringArray,
} = require('../utils/reflectValidation');

describe('reflect structure validation', () => {
  test('valid complete JSON passes validation', () => {
    const input = {
      severity: 'amber',
      reasoning_foundations: ['Distribution risk in tier-2'],
      confidence_topology: ['Growth rate assumed at 25%'],
      completeness_gaps: ['Working capital not modelled'],
      judgment_prompts: ['What is your CAC in tier-2?'],
    };

    const result = normalizeReflect(input);

    expect(result.severity).toBe('amber');
    expect(result.reasoning_foundations).toHaveLength(1);
    expect(result.completeness_gaps).toHaveLength(1);
    expect(result.judgment_prompts).toHaveLength(1);
    expect(result.gap_count).toBe(1);
  });

  test('JSON missing completeness_gaps defaults to empty array', () => {
    const result = normalizeReflect({
      severity: 'green',
      reasoning_foundations: ['Foundational point'],
    });

    expect(result.completeness_gaps).toEqual([]);
    expect(result.gap_count).toBe(0);
  });

  test('invalid severity defaults to amber', () => {
    const result = normalizeReflect({
      severity: 'red',
      reasoning_foundations: ['x'],
    });

    expect(result.severity).toBe('amber');
  });

  test('gap_count equals completeness_gaps.length', () => {
    const result = normalizeReflect({
      severity: 'amber',
      completeness_gaps: ['gap one', 'gap two', 'gap three'],
    });

    expect(result.gap_count).toBe(3);
    expect(result.gap_count).toBe(result.completeness_gaps.length);
  });

  test('all string arrays contain only strings', () => {
    const result = normalizeReflect({
      severity: 'amber',
      reasoning_foundations: ['valid', 42, null, { bad: true }, 'also valid'],
      confidence_topology: [1, 'topology note'],
      completeness_gaps: ['gap', undefined, ''],
      judgment_prompts: [false, 'prompt'],
    });

    expect(result.reasoning_foundations).toEqual(['valid', 'also valid']);
    expect(result.confidence_topology).toEqual(['topology note']);
    expect(result.completeness_gaps).toEqual(['gap']);
    expect(result.judgment_prompts).toEqual(['prompt']);

    const arrays = [
      result.reasoning_foundations,
      result.confidence_topology,
      result.completeness_gaps,
      result.judgment_prompts,
    ];
    for (const arr of arrays) {
      expect(arr.every((item) => typeof item === 'string')).toBe(true);
    }
  });

  test('filterStringArray strips non-strings', () => {
    expect(filterStringArray(['a', 1, 'b'])).toEqual(['a', 'b']);
    expect(filterStringArray(null)).toEqual([]);
  });
});
