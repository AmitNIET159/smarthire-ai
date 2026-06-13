'use client';

import { useState, useEffect } from 'react';

const pulseKeyframes = `
@keyframes stepPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(108, 92, 231, 0); }
}
@keyframes stepFadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
`;

export default function StepperProgress({
  steps = [],
  currentStep = 0,
  completedSteps = new Set(),
  onStepClick,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ---------- Mobile compact view ----------
  if (isMobile) {
    const step = steps[currentStep] || {};
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {completedSteps.has(currentStep) ? '✓' : step.icon}
          </span>
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {step.label}
          </span>
        </div>
        <span
          style={{
            color: 'var(--text-secondary)',
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
        >
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>
    );
  }

  // ---------- Desktop horizontal stepper ----------
  return (
    <>
      <style>{pulseKeyframes}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          padding: '8px 0 4px',
          overflowX: 'auto',
        }}
      >
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(idx);
          const isCurrent = idx === currentStep;
          const isFuture = !isCompleted && !isCurrent;
          const isClickable = isCompleted && onStepClick;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                flex: isLast ? '0 0 auto' : '1 1 0',
                minWidth: 0,
              }}
            >
              {/* Step circle + label column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: isClickable ? 'pointer' : 'default',
                  flexShrink: 0,
                }}
                onClick={() => isClickable && onStepClick(idx)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(idx);
                  }
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isCompleted ? 18 : 20,
                    fontWeight: 700,
                    transition: 'all 0.35s ease',
                    animation: isCurrent ? 'stepPulse 2s ease-in-out infinite' : 'stepFadeIn 0.3s ease',
                    background: isCompleted
                      ? 'var(--success)'
                      : isCurrent
                        ? 'var(--bg-card)'
                        : 'var(--bg-secondary)',
                    border: isCurrent
                      ? '2px solid var(--accent-primary)'
                      : isCompleted
                        ? '2px solid var(--success)'
                        : '2px solid var(--border-color)',
                    color: isCompleted
                      ? '#fff'
                      : isCurrent
                        ? 'var(--accent-secondary)'
                        : 'var(--text-muted)',
                    boxShadow: isCurrent
                      ? '0 0 16px rgba(108,92,231,0.45)'
                      : 'none',
                  }}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent
                      ? 'var(--text-primary)'
                      : isCompleted
                        ? 'var(--success)'
                        : 'var(--text-muted)',
                    textAlign: 'center',
                    maxWidth: 80,
                    lineHeight: 1.3,
                    transition: 'color 0.3s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    marginTop: 20,
                    marginLeft: -2,
                    marginRight: -2,
                    minWidth: 20,
                    borderRadius: 2,
                    background: 'var(--bg-input)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      borderRadius: 2,
                      background: 'var(--accent-gradient)',
                      transition: 'width 0.5s ease',
                      width: isCompleted ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
