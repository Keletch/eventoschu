import React from "react";

export function HomeSkeleton() {
  return (
    <div className="w-full space-y-12 py-8 md:py-12 animate-pulse">
      {/* Hero Skeleton */}
      <div className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="h-4 w-32 bg-gray-200 rounded-full mx-auto" />
        <div className="h-12 w-full bg-gray-200 rounded-2xl" />
        <div className="h-6 w-3/4 bg-gray-100 rounded-xl mx-auto" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 justify-center py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl" />
        ))}
      </div>

      {/* Events Carousel Skeleton */}
      <div className="bg-white rounded-[48px] p-10 md:p-16 border border-neutral-100 shadow-sm">
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] h-[400px] bg-gray-100 rounded-[32px]" />
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="mt-16 pt-10 border-t border-neutral-100 space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="h-[300px] w-full bg-gray-50 rounded-[32px]" />
        </div>
      </div>
    </div>
  );
}
