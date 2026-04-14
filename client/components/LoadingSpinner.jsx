'use client';

/**
 * LoadingSpinner Component
 * Versatile loading indicator with different sizes and styles.
 * Props:
 *   size: "sm" | "md" | "lg" (default "md")
 *   text: optional loading message
 */

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: { spinner: 20, border: 2 },
    md: { spinner: 36, border: 3 },
    lg: { spinner: 56, border: 4 },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: `${s.spinner}px`,
          height: `${s.spinner}px`,
          border: `${s.border}px solid var(--bg-card)`,
          borderTop: `${s.border}px solid var(--accent-primary)`,
          borderRadius: '50%',
          animation: 'spin-slow 0.8s linear infinite',
        }}
      />
      {text && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton Components
 * Shimmer loading placeholders for various content types.
 */
export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid-stats">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton" style={{ width: '60px', height: '32px', marginTop: '8px', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="skeleton skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '50%' }} />
            <div className="skeleton skeleton-text" style={{ width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
