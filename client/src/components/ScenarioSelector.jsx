import { SCENARIOS } from '../data/scenarios';

function ScenarioCard({ scenario, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario)}
      className="theme-transition group flex w-[200px] min-h-[44px] shrink-0 flex-col rounded-reflect border border-reflect-border bg-reflect-card p-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-reflect-accent"
      style={{
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span
        className="mb-3 w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{
          backgroundColor: `${scenario.tagColor}33`,
          color: scenario.tagColor,
        }}
      >
        {scenario.tag}
      </span>
      <span className="mb-2 text-[32px] leading-none">{scenario.icon}</span>
      <span className="text-sm font-semibold text-reflect-text">{scenario.title}</span>
      <span className="mt-1 text-xs text-reflect-muted">{scenario.subtitle}</span>
      <span className="mt-3 text-xs font-medium text-reflect-muted transition-colors group-hover:text-reflect-accent">
        Try this →
      </span>
    </button>
  );
}

export default function ScenarioSelector({
  onLoadScenario,
  className = '',
  scenarios = SCENARIOS,
}) {
  return (
    <div
      className={`flex flex-row flex-nowrap items-stretch gap-3 ${className}`}
      role="list"
      aria-label="Demo scenarios"
    >
      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          onSelect={onLoadScenario}
        />
      ))}
    </div>
  );
}
