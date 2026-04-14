'use client';

/**
 * Resume Builder Page
 * Form-based input to generate AI-powered resume sections.
 * Supports download as text file.
 */

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute>
      <BuilderContent />
    </ProtectedRoute>
  );
}

function BuilderContent() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    targetRole: '',
    education: '',
    experience: '',
    skills: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.targetRole || !form.experience || !form.skills) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/resume/build', form);
      setResult(res.data.data.generatedResume);
      toast.success('Resume generated!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.fullText) return;
    const blob = new Blob([result.fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/\s+/g, '_')}_resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  const copyToClipboard = async () => {
    if (!result?.fullText) return;
    try {
      await navigator.clipboard.writeText(result.fullText);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">AI Resume Builder</h1>
        <p className="page-subtitle">
          Fill in your details and let AI craft a professional resume
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: result ? '1fr 1fr' : '1fr',
          gap: '2rem',
          maxWidth: result ? '1200px' : '700px',
        }}
      >
        {/* ── Form ──────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label" htmlFor="rb-name">Full Name *</label>
                <input
                  id="rb-name"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="input-label" htmlFor="rb-email">Email *</label>
                <input
                  id="rb-email"
                  name="email"
                  type="email"
                  className="input-field"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label" htmlFor="rb-role">Target Role *</label>
                <input
                  id="rb-role"
                  name="targetRole"
                  className="input-field"
                  placeholder="Senior React Developer"
                  value={form.targetRole}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="input-label" htmlFor="rb-education">Education</label>
                <input
                  id="rb-education"
                  name="education"
                  className="input-field"
                  placeholder="B.S. Computer Science"
                  value={form.education}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="rb-experience">Experience *</label>
              <textarea
                id="rb-experience"
                name="experience"
                className="input-field"
                placeholder="Describe your work experience, projects, and achievements..."
                value={form.experience}
                onChange={handleChange}
                style={{ minHeight: '140px' }}
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="rb-skills">Skills *</label>
              <textarea
                id="rb-skills"
                name="skills"
                className="input-field"
                placeholder="React, Node.js, Python, AWS, MongoDB, Docker..."
                value={form.skills}
                onChange={handleChange}
                style={{ minHeight: '80px' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px' }}
            >
              {loading ? <LoadingSpinner size="sm" /> : '✨ Generate Resume'}
            </button>

            {loading && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                AI is crafting your resume... This may take 15-30 seconds.
              </p>
            )}
          </form>
        </div>

        {/* ── Generated Result ──────────────────────── */}
        {result && (
          <div
            className="animate-fadeInUp"
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handleDownload} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                📥 Download Resume
              </button>
              <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                📋 Copy to Clipboard
              </button>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>
                  ✨ Professional Summary
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                  {result.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {result.experience?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>
                  💼 Experience Highlights
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.experience.map((bullet, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(108, 92, 231, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        borderLeft: '3px solid var(--accent-primary)',
                      }}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {result.skills?.length > 0 && (
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-secondary)' }}>
                  🛠️ Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.skills.map((skill, i) => (
                    <span key={i} className="badge badge-info">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
