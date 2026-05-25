export default function MessageSkeleton() {
  return (
    <div className="space-y-2.5 py-1" aria-hidden="true">
      <div className="animate-shimmer h-3 rounded-full" style={{ width: '70%' }} />
      <div className="animate-shimmer h-3 rounded-full" style={{ width: '90%' }} />
      <div className="animate-shimmer h-3 rounded-full" style={{ width: '50%' }} />
    </div>
  );
}
