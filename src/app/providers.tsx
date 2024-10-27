// src/app/providers.tsx
'use client';

import { PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/toaster';
// import { useAuth } from '@/hooks/useAuth';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
