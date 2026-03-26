import React from 'react';

export default function PageSkeleton() {
  return (
    <div className="animate-pulse flex flex-col min-h-screen w-full bg-slate-50 p-6">
      <div className="h-16 bg-gray-200 rounded-xl w-full max-w-7xl mx-auto mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
          <div className="flex gap-4">
             <div className="h-64 bg-gray-200 rounded-2xl w-1/2"></div>
             <div className="h-64 bg-gray-200 rounded-2xl w-1/2"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        </div>
        <div className="col-span-1 space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-96 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      </div>
    </div>
  );
}
