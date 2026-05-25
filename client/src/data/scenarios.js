export const SCENARIOS = [
  {
    id: 'risk-analysis',
    persona: "Arjun's Scenario",
    icon: '📊',
    title: 'Risk Analysis',
    subtitle: 'D2C expansion into tier-2 cities',
    tag: 'Paranoid Professional',
    tagColor: '#f97316',
    prompt:
      'Analyse the key risks of expanding a D2C consumer brand into tier-2 and tier-3 Indian cities. Cover distribution challenges, working capital requirements, competitive dynamics, and consumer behaviour differences versus metro markets.',
    expectedGaps: [
      'working capital for logistics',
      'state-specific regulations',
      'last-mile delivery unit economics',
    ],
  },
  {
    id: 'career-doc',
    persona: "Priya's Scenario",
    icon: '💼',
    title: 'Career Document',
    subtitle: 'PM resume review for Series B',
    tag: 'Autopilot',
    tagColor: '#a855f7',
    prompt:
      'Review this resume summary for a PM role at a Series B startup and tell me if it is strong enough: "Results-driven product manager with 2 years experience building B2C mobile apps. Led cross-functional teams to deliver 3 major features on time. Passionate about user research and data-driven decisions. Looking to grow in a fast-paced environment." What is missing and what should be improved?',
    expectedGaps: [
      'specific metrics and impact numbers',
      'product sense demonstration',
      'company-stage fit signals',
    ],
  },
  {
    id: 'revenue-projection',
    persona: 'High Stakes Numerical',
    icon: '🔢',
    title: 'Revenue Projection',
    subtitle: 'SaaS SMB market sizing India',
    tag: 'Highest Trust Gap',
    tagColor: '#ef4444',
    prompt:
      'A SaaS productivity tool targeting small and medium businesses in India is priced at Rs 1,999 per month per seat. The founding team believes they can reach 10,000 paying SMB customers in 3 years. Build a detailed revenue projection for years 1, 2, and 3 with key assumptions around churn, expansion revenue, and CAC payback period.',
    expectedGaps: [
      'churn rate assumptions',
      'CAC by acquisition channel',
      'SMB budget seasonality in India',
    ],
  },
];

export function getScenarioById(id) {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

export function gapMatchesExpected(gapItem, expectedGaps) {
  if (!gapItem || !expectedGaps?.length) return false;
  const gap = gapItem.toLowerCase();

  return expectedGaps.some((expected) => {
    const e = expected.toLowerCase();
    if (gap.includes(e) || e.includes(gap)) return true;

    const tokens = e.split(/[\s,/]+/).filter((t) => t.length > 3);
    return tokens.some((token) => gap.includes(token));
  });
}
