'use client';

/**
 * ProtectedRoute Component
 * Wraps pages that require authentication.
 * Redirects to login if not authenticated.
 */

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <LoadingDots />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            animation: 'float 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
