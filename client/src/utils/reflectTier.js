import { getScenarioById } from '../data/scenarios';

const UNCERTAINTY_MARKERS = [
  'depends',
  'may vary',
  'assumes',
  'assumption',
  'if ',
  'unclear',
  'not enough information',
  'insufficient information',
  'it\'s hard to',
  'hard to say',
  'cannot determine',
];

const HIGH_STAKES_SCENARIO_IDS = new Set([
  'career-doc',
  'revenue-projection',
  'risk-analysis',
]);

function looksHighStakesByText(text) {
  const t = text.toLowerCase();
  return (
    /\b(legal|lawsuit|contract|compliance|tax|audit)\b/.test(t) ||
    /\b(medical|diagnosis|treatment|dosage|symptom|healthcare)\b/.test(t) ||
    /\b(finance|invest|roi|revenue|profit|loss|valuation|pricing|budget)\b/.test(t) ||
    /\b(production|incident|outage|security|breach)\b/.test(t) ||
    /\b(research|study|clinical|dataset)\b/.test(t)
  );
}

function isLongFormAdvisory(text) {
  const len = text.trim().length;
  if (len >= 1200) return true;
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 4) return true;
  const bulletLines = text.split('\n').filter((l) => /^\s*[-*]\s+/.test(l));
  return bulletLines.length >= 6;
}

function hasUncertaintyMarkers(text) {
  const t = ` ${text.toLowerCase()} `;
  return UNCERTAINTY_MARKERS.some((m) => t.includes(m));
}

function looksLikeTradeoffs(text) {
  const t = text.toLowerCase();
  return (
    /\b(trade[- ]?off|pros and cons|option|path|approach)\b/.test(t) ||
    /\b(it depends|consider|choose|either|alternatively)\b/.test(t)
  );
}

function looksLikeUngroundedRecommendations(text) {
  const t = text.toLowerCase();
  const hasRecommend =
    /\b(you should|i recommend|recommend|best to|consider doing)\b/.test(t);
  const hasGrounding =
    /\b(because|given|based on|for example|example|source|cite|data)\b/.test(t);
  return hasRecommend && !hasGrounding && text.trim().length > 500;
}

export function getReflectTier({ responseText, scenarioId }) {
  const text = responseText || '';
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;

  const highStakesScenario =
    (scenario?.id && HIGH_STAKES_SCENARIO_IDS.has(scenario.id)) ||
    (scenario?.title && /career|revenue|risk/i.test(scenario.title));

  const high =
    highStakesScenario ||
    looksHighStakesByText(text) ||
    hasUncertaintyMarkers(text) ||
    isLongFormAdvisory(text) ||
    looksLikeUngroundedRecommendations(text);

  if (high) return 'high';

  const medium =
    looksLikeTradeoffs(text) ||
    (text.trim().length >= 700 && text.split('\n').length >= 6);

  if (medium) return 'medium';
  return 'low';
}

