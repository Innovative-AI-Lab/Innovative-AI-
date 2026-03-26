import React from 'react';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] mb-4" />
      <div className="h-3.5 bg-white/[0.06] rounded-lg w-2/3 mb-2.5" />
      <div className="h-2.5 bg-white/[0.04] rounded-lg w-1/3 mb-5" />
      <div className="flex gap-1">
        {[0, 1, 2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/[0.06]" />)}
      </div>
    </div>
  );
}

export default SkeletonCard;