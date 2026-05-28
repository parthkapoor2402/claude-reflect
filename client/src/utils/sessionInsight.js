let reflectOpenCount = 0;
let followUpActionCount = 0;
let sessionCardShown = false;

export function incrementReflectOpenCount() {
  reflectOpenCount += 1;
}

export function incrementFollowUpActionCount() {
  followUpActionCount += 1;
}

export function getSessionInsightCounts() {
  return { reflectOpenCount, followUpActionCount, sessionCardShown };
}

export function markSessionCardShown() {
  sessionCardShown = true;
}

export function resetSessionInsight() {
  reflectOpenCount = 0;
  followUpActionCount = 0;
  sessionCardShown = false;
}

