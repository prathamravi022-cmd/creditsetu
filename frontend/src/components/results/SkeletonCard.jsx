
/**
 * SkeletonCard — placeholder shown while scheme matches are being ranked.
 *
 * Uses the shared .skeleton-shimmer sweep (defined in index.css) instead of
 * Tailwind's opacity pulse, so the loading state reads as a moving highlight in
 * both themes rather than a flicker, and the block colours adapt to dark mode.
 */
export default function SkeletonCard() {
  const block = 'skeleton-shimmer rounded';

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="mb-4 flex justify-between">
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-24 ${block}`} />
          <div className={`h-6 w-48 ${block}`} />
          <div className={`h-3 w-full ${block}`} />
        </div>
        <div className={`h-16 w-16 shrink-0 rounded-full ${block}`} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 border-t border-slate-100 pt-4 dark:border-gray-700">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className={`h-2 w-16 ${block}`} />
            <div className={`h-4 w-20 ${block}`} />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-gray-700">
        <div className={`h-11 w-32 rounded-lg ${block}`} />
        <div className={`h-11 w-32 rounded-lg ${block}`} />
      </div>
    </div>
  );
}
