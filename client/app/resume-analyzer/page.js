'use client';

/**
 * Resume Analyzer Page
 * Upload resume, enter job description, and get AI-powered analysis.
 */

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import FileUpload from '@/components/FileUpload';
import ScoreGauge from '@/components/ScoreGauge';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResumeAnalyzerPage() {
  return (
    <ProtectedRoute>
      <AnalyzerContent />
    </ProtectedRoute>
  );
}

function AnalyzerContent() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  // ── Step 1: Upload resume ─────────────────────────────
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume file.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResumeId(res.data.data.id);
      toast.success('Resume uploaded & parsed!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Step 2: Analyze against job description ───────────
  const handleAnalyze = async () => {
    if (!resumeId) {
      toast.error('Please upload a resume first.');
      return;
    }
    if (jobDescription.length < 20) {
      toast.error('Job description must be at least 20 characters.');
      return;
    }

    setAnalyzing(true);
    setError('');
    try {
      const res = await api.post('/resume/analyze', {
        resumeId,
        jobDescription,
      });

      setAnalysis(res.data.data.analysis);
      toast.success('Analysis complete!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResumeId(null);
    setAnalysis(null);
    setJobDescription('');
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Resume Analyzer</h1>
        <p className="page-subtitle">
          Upload your resume and compare it against any job description
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: analysis ? '1fr 1fr' : '1fr',
          gap: '2rem',
          maxWidth: analysis ? '1200px' : '700px',
        }}
      >
        {/* ── Left: Upload & Input ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* File Upload */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              📄 Upload Resume
            </h3>
            <FileUpload onFileSelect={setFile} />

            {file && !resumeId && (
              <button
                onClick={handleUpload}
                className="btn-primary"
                disabled={uploading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {uploading ? <LoadingSpinner size="sm" /> : 'Upload & Parse'}
              </button>
            )}

            {resumeId && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '10px 14px',
                  background: 'rgba(0, 206, 201, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--success)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                ✅ Resume uploaded and parsed successfully
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              💼 Job Description
            </h3>
            <textarea
              className="input-field"
              placeholder="Paste the job description here... (minimum 20 characters)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ minHeight: '180px' }}
            />

            <button
              onClick={handleAnalyze}
              className="btn-primary"
              disabled={analyzing || !resumeId || jobDescription.length < 20}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {analyzing ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                '🔍 Analyze Resume'
              )}
            </button>

            {analyzing && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                AI is analyzing your resume... This may take 15-30 seconds.
              </p>
            )}
          </div>

          {analysis && (
            <button onClick={reset} className="btn-ghost" style={{ alignSelf: 'center' }}>
              ↻ Start Over
            </button>
          )}
        </div>

        {/* ── Right: Analysis Results ───────────────── */}
        {analysis && (
          <div
            className="animate-fadeInUp"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Score */}
            <div
              className="glass-card"
              style={{ padding: '2rem', textAlign: 'center' }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                ATS Match Score
              </h3>
              <ScoreGauge score={analysis.matchScore || 0} size={160} label="MATCH" />

              {analysis.summary && (
                <p
                  style={{
                    marginTop: '1.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}
                >
                  {analysis.summary}
                </p>
              )}
            </div>

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--success)' }}>
                  💪 Strengths
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.strengths.map((s, i) => (
                    <span key={i} className="badge badge-success">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {analysis.missingSkills?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--danger)' }}>
                  ❌ Missing Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {analysis.missingSkills.map((s, i) => (
                    <span key={i} className="badge badge-danger">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--info)' }}>
                  💡 Suggestions
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysis.suggestions.map((s, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(116, 185, 255, 0.06)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        borderLeft: '3px solid var(--info)',
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && !analysis && (
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

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
