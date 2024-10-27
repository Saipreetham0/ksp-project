// src/components/AuthButton.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  className?: string;
}

export function AuthButton({ className }: AuthButtonProps) {
  const { signInWithGoogle, loading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const handleAuth = async () => {
    setLocalLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled in useAuth hook
      console.error("An error occurred:", error);

    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={loading || localLoading}
      className={cn(
        "w-full flex items-center justify-center px-4 py-3",
        "border border-gray-300 rounded-lg shadow-sm",
        "text-sm font-medium text-gray-700 bg-white",
        "hover:bg-gray-50 focus:outline-none focus:ring-2",
        "focus:ring-offset-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-200",
        className
      )}
    >
      {(loading || localLoading) ? (
        <div className="w-5 h-5 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin" />
      ) : (
        <>
          <Image
            src="/google.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="mr-2"
          />
          Continue with Google
        </>
      )}
    </button>
  );
}
