const dismissedBanners = {};

export function dismissBanner(sessionId) {
  dismissedBanners[sessionId] = true;
}

export function isBannerDismissed(sessionId) {
  return Boolean(dismissedBanners[sessionId]);
}

export function getSessionTitle(session) {
  const firstUser = session.messages?.find((message) => message.role === 'user');
  if (!firstUser?.content?.trim()) return 'Untitled session';

  const words = firstUser.content.trim().split(/\s+/).slice(0, 7);
  return `${words.join(' ')}...`;
}

export function truncateWords(text, maxWords) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}...`;
}

export function timeAgo(value) {
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime();
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function getReflectBadge(session) {
  const summary = session.reflectSummary;
  if (!summary || summary.reflectRunCount === 0) return null;

  const openCount = (summary.openInsights ?? []).filter((insight) => !insight.resolved)
    .length;

  if (openCount > 0) {
    return { text: `${openCount} open`, tone: 'open' };
  }

  if (summary.totalInsights > 0) {
    return { text: 'All clear', tone: 'clear' };
  }

  return null;
}

export function getBannerConfig(session) {
  if (!session?.messages?.length) return null;
  if (isBannerDismissed(session.id)) return null;

  const hasReflect = (session.reflectSummary?.reflectRunCount ?? 0) > 0;
  const title = getSessionTitle(session);

  if (hasReflect) {
    const openInsights = (session.reflectSummary?.openInsights ?? []).filter(
      (insight) => !insight.resolved
    );
    if (openInsights.length === 0) return null;

    const latestInsight = openInsights[openInsights.length - 1];
    return {
      mode: 'A',
      sessionId: session.id,
      title,
      insight: latestInsight,
    };
  }

  return {
    mode: 'B',
    sessionId: session.id,
    title,
    lastActiveAt: session.updatedAt,
    lastActiveLabel: timeAgo(session.updatedAt),
  };
}

export function categoryLabel(category) {
  switch (category) {
    case 'correctness':
      return 'correctness';
    case 'completeness':
      return 'completeness';
    case 'reasoning':
      return 'reasoning';
    case 'uncertainty':
      return 'uncertainty';
    default:
      return category || 'insight';
  }
}
