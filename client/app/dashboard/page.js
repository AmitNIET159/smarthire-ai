'use client';

/**
 * Dashboard Page
 * Shows user stats, recent resumes, and interview sessions.
 * Supports history filtering.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScoreGauge from '@/components/ScoreGauge';
import { SkeletonStats, SkeletonList } from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | resumes | interviews

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = filter !== 'all' ? { filter } : {};
      const res = await api.get('/dashboard', { params });
      setData(res.data.data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your career preparation overview</p>
      </div>

      {/* ── Stats Cards ─────────────────────────────── */}
      {loading ? (
        <SkeletonStats />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboard} />
      ) : (
        <>
          <div className="grid-stats" style={{ marginBottom: '2rem' }}>
            <StatCard
              icon="📄"
              label="Total Resumes"
              value={data?.stats?.totalResumes || 0}
            />
            <StatCard
              icon="🎯"
              label="Avg Match Score"
              value={`${data?.stats?.avgMatchScore || 0}%`}
              color="var(--accent-secondary)"
            />
            <StatCard
              icon="🎙️"
              label="Interviews"
              value={data?.stats?.totalInterviews || 0}
            />
            <StatCard
              icon="⭐"
              label="Avg Interview Score"
              value={`${data?.stats?.avgInterviewScore || 0}/10`}
              color="var(--success)"
            />
          </div>

          {/* ── Quick Actions ────────────────────────── */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}
          >
            <Link href="/resume-analyzer" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              📊 Analyze Resume
            </Link>
            <Link href="/resume-builder" className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              ✍️ Build Resume
            </Link>
            <Link href="/interview" className="btn-secondary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
              🎯 Start Interview
            </Link>
          </div>

          {/* ── Filter Tabs ──────────────────────────── */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem' }}>
            {['all', 'resumes', 'interviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="btn-ghost"
                style={{
                  fontSize: '0.85rem',
                  color: filter === tab ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  background: filter === tab ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Recent Activity ──────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Resumes */}
            {(filter === 'all' || filter === 'resumes') && data?.resumes?.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  📄 Recent Resumes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="glass-card"
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
                          {resume.fileName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(resume.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          className={`badge ${
                            resume.status === 'analyzed'
                              ? 'badge-success'
                              : resume.status === 'built'
                              ? 'badge-info'
                              : 'badge-neutral'
                          }`}
                        >
                          {resume.status}
                        </span>
                        {resume.matchScore != null && (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color:
                                resume.matchScore >= 80
                                  ? 'var(--success)'
                                  : resume.matchScore >= 60
                                  ? 'var(--info)'
                                  : 'var(--warning)',
                            }}
                          >
                            {resume.matchScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interviews */}
            {(filter === 'all' || filter === 'interviews') && data?.interviews?.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  🎙️ Recent Interviews
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.interviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="glass-card"
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
                          {interview.role}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {interview.answeredCount}/{interview.questionCount} answered •{' '}
                          {new Date(interview.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${interview.difficulty === 'hard' ? 'badge-danger' : interview.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                          {interview.difficulty}
                        </span>
                        <span
                          className={`badge ${interview.status === 'completed' ? 'badge-success' : 'badge-warning'}`}
                        >
                          {interview.status}
                        </span>
                        {interview.overallScore != null && (
                          <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                            {interview.overallScore}/10
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && data?.resumes?.length === 0 && data?.interviews?.length === 0 && (
              <div
                className="glass-card"
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  No activity yet
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Start by analyzing a resume or kicking off a mock interview!
                </p>
                <Link href="/resume-analyzer" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: color || 'var(--text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── Error State ─────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
      <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{message}</p>
      <button onClick={onRetry} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
        Try Again
      </button>
    </div>
  );
}
