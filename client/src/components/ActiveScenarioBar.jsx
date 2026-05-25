export default function ActiveScenarioBar({ scenario }) {
  if (!scenario) return null;

  return (
    <div
      className="theme-transition mb-2 flex items-center gap-2 rounded-reflect border border-reflect-accent/40 bg-reflect-card px-3 py-2"
      style={{ borderLeft: `3px solid ${scenario.tagColor}` }}
    >
      <span className="text-lg">{scenario.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-reflect-text">
          {scenario.title}
        </p>
        <p className="truncate text-[10px] text-reflect-muted">
          {scenario.persona} · focused session
        </p>
      </div>
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{
          backgroundColor: `${scenario.tagColor}22`,
          color: scenario.tagColor,
        }}
      >
        Active
      </span>
    </div>
  );
}
