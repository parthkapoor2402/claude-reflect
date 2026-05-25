const FALLBACK_REFLECT = {
  severity: 'green',
  reasoning_foundations: [
    'Unable to generate Reflect analysis for this response',
  ],
  confidence_topology: [],
  completeness_gaps: [],
  judgment_prompts: [
    'Consider reviewing this response against your specific context',
  ],
  gap_count: 0,
};

function filterStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim());
}

function normalizeReflect(data) {
  const reasoning_foundations = filterStringArray(data?.reasoning_foundations);
  const confidence_topology = filterStringArray(data?.confidence_topology);
  const completeness_gaps = filterStringArray(data?.completeness_gaps);
  const judgment_prompts = filterStringArray(data?.judgment_prompts);

  let severity = data?.severity;
  if (severity !== 'green' && severity !== 'amber') {
    severity = 'amber';
  }

  return {
    severity,
    reasoning_foundations,
    confidence_topology,
    completeness_gaps,
    judgment_prompts,
    gap_count: completeness_gaps.length,
  };
}

function parseReflectContent(raw) {
  if (!raw || typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidReflectStructure(body) {
  if (!body || typeof body !== 'object') return false;
  if (!['green', 'amber'].includes(body.severity)) return false;
  const arrays = [
    'reasoning_foundations',
    'confidence_topology',
    'completeness_gaps',
    'judgment_prompts',
  ];
  for (const key of arrays) {
    if (!Array.isArray(body[key])) return false;
    if (!body[key].every((item) => typeof item === 'string')) return false;
  }
  if (typeof body.gap_count !== 'number') return false;
  return true;
}

module.exports = {
  FALLBACK_REFLECT,
  normalizeReflect,
  parseReflectContent,
  filterStringArray,
  isValidReflectStructure,
};
