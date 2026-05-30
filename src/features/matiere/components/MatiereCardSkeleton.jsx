// ─── Skeleton card ────────────────────────────────────────────
// src/features/matiere/components/MatiereCardSkeleton.jsx
export const MatiereCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-1 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="h-4 bg-gray-100 rounded-full w-20" />
      </div>
    </div>
  </div>
);
