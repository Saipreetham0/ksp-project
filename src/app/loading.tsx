// app/loading.tsx
import React from 'react';
import Image from 'next/image';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="relative">
        {/* Spinning circle */}
        {/* <div className="absolute -inset-2">
          <div className="w-[calc(100%+16px)] h-[calc(100%+16px)] border-4 border-blue-500 rounded-full animate-spin border-t-transparent"/>
        </div> */}
        {/* Static logo */}
        <div className="relative">
          <Image
            src="/logo-b.png" // Put your logo in the public folder
            alt="Loading..."
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;