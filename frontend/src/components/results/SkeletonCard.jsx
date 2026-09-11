import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
        </div>
        <div className="h-16 w-16 bg-slate-200 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2 w-16 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}
