export default function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="typing-dot h-2 w-2 rounded-full bg-reflect-muted" />
      <span className="typing-dot h-2 w-2 rounded-full bg-reflect-muted" />
      <span className="typing-dot h-2 w-2 rounded-full bg-reflect-muted" />
    </span>
  );
}
