export default function OfflineBanner({ visible }) {
  if (!visible) return null;

  return (
    <div
      className="shrink-0 bg-red-600/90 px-4 py-2 text-center text-xs font-medium text-white"
      role="alert"
    >
      Connection lost — reconnecting...
    </div>
  );
}
