import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5, cols = 4 }) => {
  const pulseClass = 'animate-pulse bg-gray-200 rounded';

  if (type === 'table') {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className={`${pulseClass} h-4 ${j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/6' : 'flex-1'}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${pulseClass} h-24 rounded-xl`} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="p-6 space-y-4">
        <div className={`${pulseClass} h-8 w-1/3`} style={{ animationDelay: '0s' }} />
        <div className={`${pulseClass} h-4 w-1/2`} style={{ animationDelay: '0.05s' }} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className={`${pulseClass} h-4 ${j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/6' : 'flex-1'}`}
                style={{ animationDelay: `${(i + 1) * 0.08 + j * 0.02}s` }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className={`${pulseClass} w-16 h-16 rounded-full`} />
          <div className="space-y-2 flex-1">
            <div className={`${pulseClass} h-5 w-1/3`} />
            <div className={`${pulseClass} h-4 w-1/2`} />
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`${pulseClass} h-4 w-full`} style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 space-y-4">
        <div className={`${pulseClass} h-8 w-1/4`} style={{ animationDelay: '0s' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`${pulseClass} h-64 rounded-xl`} style={{ animationDelay: '0.05s' }} />
          <div className={`${pulseClass} h-64 rounded-xl`} style={{ animationDelay: '0.1s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${pulseClass} h-4 w-full`} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
};

export default SkeletonLoader;