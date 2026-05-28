function rate(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

export function getReflectMemoryInsight(memory) {
  if (!memory) return null;
  if (memory.totalPrompts < 4) return null;
  if (memory.totalReflectOpens < 2) return null;

  const usage = memory.scenarioUsage || {};
  const career = usage.career || { prompts: 0, reflectOpens: 0, followUps: 0 };
  const custom = usage.custom || { prompts: 0, reflectOpens: 0, followUps: 0 };
  const risk = usage.risk || { prompts: 0, reflectOpens: 0, followUps: 0 };
  const revenue = usage.revenue || { prompts: 0, reflectOpens: 0, followUps: 0 };

  // RULE A
  const careerOpenRate = rate(career.reflectOpens, career.prompts);
  const customOpenRate = rate(custom.reflectOpens, custom.prompts);
  if (careerOpenRate > 0 && careerOpenRate >= 2 * customOpenRate) {
    return {
      title: 'Pattern spotted',
      body: 'You tend to review career-related answers more carefully than open-ended prompts.',
    };
  }

  // RULE B
  const analyticalPrompts = risk.prompts + revenue.prompts;
  const analyticalOpens = risk.reflectOpens + revenue.reflectOpens;
  if (analyticalPrompts >= 2 && analyticalOpens <= 0) {
    return {
      title: 'Blind spot',
      body: "You often move quickly on analytical outputs without checking Reflect.",
    };
  }

  // RULE C
  if (memory.totalFollowUpsAfterReflect >= 2) {
    return {
      title: 'Reflect is helping',
      body: 'You often refine the answer after opening Reflect — a sign that it is catching useful gaps.',
    };
  }

  // RULE D
  if (memory.totalReflectOpens >= 3 && memory.totalFollowUpsAfterReflect === 0) {
    return {
      title: 'Quick observation',
      body: 'You review Reflect often, but rarely act on it. Consider turning one insight into a follow-up.',
    };
  }

  // RULE E
  return {
    title: 'Reflect Memory',
    body: 'Claude Reflect is starting to learn how you evaluate AI outputs in this session.',
  };
}

