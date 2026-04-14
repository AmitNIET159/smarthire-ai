'use client';

/**
 * Interview Page
 * AI-powered mock interview with role selection, question display,
 * answer input, and real-time feedback with scoring.
 */

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScoreGauge from '@/components/ScoreGauge';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function InterviewPage() {
  return (
    <ProtectedRoute>
      <InterviewContent />
    </ProtectedRoute>
  );
}

function InterviewContent() {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [interview, setInterview] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [error, setError] = useState('');

  // ── Start Interview Session ───────────────────────────
  const handleStart = async () => {
    if (!role.trim()) {
      toast.error('Please enter a job role.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/interview/start', { role, difficulty });
      setInterview(res.data.data);
      setCurrentQ(0);
      setFeedbacks({});
      toast.success('Interview session started!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Submit Answer ─────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (answer.length < 10) {
      toast.error('Answer must be at least 10 characters.');
      return;
    }

    const question = interview.questions[currentQ];

    setSubmitting(true);
    try {
      const res = await api.post('/interview/feedback', {
        interviewId: interview.id,
        questionId: question.id,
        answer,
      });

      const fb = res.data.data;
      setFeedbacks((prev) => ({ ...prev, [question.id]: fb.feedback }));
      setAnswer('');

      if (fb.interviewStatus === 'completed') {
        toast.success(`Interview complete! Overall score: ${fb.overallScore}/10`);
      } else {
        toast.success(`Score: ${fb.feedback.score}/10`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────
  const resetInterview = () => {
    setInterview(null);
    setCurrentQ(0);
    setAnswer('');
    setFeedbacks({});
    setError('');
  };

  // ── Calculate overall score ───────────────────────────
  const getOverallScore = () => {
    const scores = Object.values(feedbacks)
      .map((f) => f.score)
      .filter((s) => s != null);
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  const allAnswered =
    interview && Object.keys(feedbacks).length === interview.questions.length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">AI Mock Interview</h1>
        <p className="page-subtitle">
          Practice with AI-generated questions and get instant feedback
        </p>
      </div>

      {/* ── Setup Form ──────────────────────────────── */}
      {!interview && (
        <div style={{ maxWidth: '600px' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              🎯 Configure Your Interview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="input-label" htmlFor="iv-role">Job Role</label>
                <input
                  id="iv-role"
                  className="input-field"
                  placeholder="e.g., Senior React Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Difficulty</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${difficulty === d ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        background: difficulty === d ? 'rgba(108, 92, 231, 0.1)' : 'var(--bg-input)',
                        color: difficulty === d ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: difficulty === d ? 600 : 400,
                        textTransform: 'capitalize',
                        transition: 'all 0.2s ease',
                        fontSize: '0.9rem',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                className="btn-primary"
                disabled={loading || !role.trim()}
                style={{ width: '100%', padding: '14px' }}
              >
                {loading ? <LoadingSpinner size="sm" /> : '🚀 Start Interview'}
              </button>

              {loading && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Generating questions... This may take 15-30 seconds.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(255, 118, 117, 0.08)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: '0.9rem',
                border: '1px solid rgba(255, 118, 117, 0.2)',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* ── Interview Session ───────────────────────── */}
      {interview && (
        <div>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Interview for <strong style={{ color: 'var(--text-primary)' }}>{interview.role}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span className={`badge ${interview.difficulty === 'hard' ? 'badge-danger' : interview.difficulty === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                  {interview.difficulty}
                </span>
                <span className="badge badge-info">
                  {Object.keys(feedbacks).length}/{interview.questions.length} answered
                </span>
              </div>
            </div>

            <button onClick={resetInterview} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
              ↻ New Interview
            </button>
          </div>

          {/* Question Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {interview.questions.map((q, i) => {
              const answered = feedbacks[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${currentQ === i ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: answered
                      ? 'rgba(0, 206, 201, 0.15)'
                      : currentQ === i
                      ? 'rgba(108, 92, 231, 0.1)'
                      : 'var(--bg-input)',
                    color: answered
                      ? 'var(--success)'
                      : currentQ === i
                      ? 'var(--accent-secondary)'
                      : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: feedbacks[interview.questions[currentQ]?.id] ? '1fr 1fr' : '1fr',
              gap: '1.5rem',
            }}
          >
            {/* Question + Answer */}
            <div className="glass-card animate-fadeIn" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <span className={`badge badge-${interview.questions[currentQ]?.category === 'technical' ? 'info' : interview.questions[currentQ]?.category === 'behavioral' ? 'warning' : 'success'}`}>
                  {interview.questions[currentQ]?.category}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Question {currentQ + 1} of {interview.questions.length}
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                {interview.questions[currentQ]?.question}
              </h3>

              {!feedbacks[interview.questions[currentQ]?.id] && (
                <>
                  <textarea
                    className="input-field"
                    placeholder="Type your answer here... (minimum 10 characters)"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    style={{ minHeight: '160px' }}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    className="btn-primary"
                    disabled={submitting || answer.length < 10}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Submit Answer'}
                  </button>
                  {submitting && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                      AI is evaluating your answer...
                    </p>
                  )}
                </>
              )}

              {feedbacks[interview.questions[currentQ]?.id] && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(0, 206, 201, 0.05)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0, 206, 201, 0.15)',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>
                    ✅ Answer submitted
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Panel */}
            {feedbacks[interview.questions[currentQ]?.id] && (
              <div className="animate-fadeInUp" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Score */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <ScoreGauge
                    score={feedbacks[interview.questions[currentQ].id].score * 10}
                    size={120}
                    label="SCORE"
                  />
                </div>

                {/* Strengths */}
                {feedbacks[interview.questions[currentQ].id].strengths?.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--success)' }}>
                      💪 Strengths
                    </h4>
                    <ul style={{ padding: '0 0 0 1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {feedbacks[interview.questions[currentQ].id].strengths.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {feedbacks[interview.questions[currentQ].id].improvements?.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--warning)' }}>
                      🎯 Improvements
                    </h4>
                    <ul style={{ padding: '0 0 0 1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {feedbacks[interview.questions[currentQ].id].improvements.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sample Answer */}
                {feedbacks[interview.questions[currentQ].id].sampleAnswer && (
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--info)' }}>
                      📝 Model Answer
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {feedbacks[interview.questions[currentQ].id].sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Interview Summary ─────────────────────── */}
          {allAnswered && (
            <div
              className="glass-card animate-fadeInUp"
              style={{
                marginTop: '2rem',
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid rgba(0, 206, 201, 0.2)',
              }}
            >
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
                🎉 Interview Complete!
              </h3>

              <ScoreGauge score={getOverallScore() * 10} size={140} label="OVERALL" />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2rem',
                  marginTop: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {getOverallScore()}/10
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Score</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                    {interview.questions.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Questions Answered</div>
                </div>
              </div>

              <button
                onClick={resetInterview}
                className="btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Start New Interview
              </button>
            </div>
          )}

          <style jsx>{`
            @media (max-width: 768px) {
              div[style*="gridTemplateColumns"] {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
