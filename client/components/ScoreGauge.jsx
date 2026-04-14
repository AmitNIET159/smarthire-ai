'use client';

/**
 * ScoreGauge Component
 * Animated circular progress indicator for displaying scores.
 * Props:
 *   score: number (0-100)
 *   size: number (px, default 140)
 *   label: string (e.g., "Match Score")
 */

import { useEffect, useState } from 'react';

export default function ScoreGauge({ score = 0, size = 140, label = 'Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Score color grading
  const getColor = (s) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return '#74b9ff';
    if (s >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Animate score count-up
  useEffect(() => {
    let current = 0;
    const increment = Math.max(1, Math.ceil(score / 60));
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-card)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(animatedScore)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${getColor(animatedScore)})`,
          }}
        />
      </svg>
      <span className="score-value" style={{ color: getColor(animatedScore) }}>
        {animatedScore}
      </span>
      <span className="score-label">{label}</span>
    </div>
  );
}
