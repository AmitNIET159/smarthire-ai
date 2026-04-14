'use client';

/**
 * Landing Page
 * Premium SaaS-style landing with animated hero, feature cards, and CTA.
 */

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: '📊',
    title: 'Resume Analysis',
    desc: 'Upload your resume and get an instant ATS match score, identify missing skills, and receive actionable improvement suggestions.',
  },
  {
    icon: '✍️',
    title: 'AI Resume Builder',
    desc: 'Generate professional, ATS-optimized resume sections powered by AI. Summary, experience bullets, and skills — all tailored to your target role.',
  },
  {
    icon: '🎯',
    title: 'Mock Interviews',
    desc: 'Practice with AI-generated interview questions tailored to your role. Get scored feedback and learn from model answers.',
  },
  {
    icon: '📈',
    title: 'Progress Dashboard',
    desc: 'Track all your resumes, interview sessions, and scores in one place. See your improvement over time.',
  },
];

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX resume and paste the job description.' },
  { num: '02', title: 'Get AI Analysis', desc: 'Receive your ATS score, missing skills, and personalized suggestions.' },
  { num: '03', title: 'Practice Interviews', desc: 'Answer AI-generated questions and get real-time feedback & scores.' },
  { num: '04', title: 'Land Your Dream Job', desc: 'Apply with confidence using your optimized resume and interview skills.' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '200px',
            right: '-200px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(116,185,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div
            className="badge badge-info animate-fadeInUp"
            style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}
          >
            🚀 AI-Powered Career Platform
          </div>

          <h1
            className="animate-fadeInUp delay-100"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Land Your Dream Job with{' '}
            <span
              style={{
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SmartHire AI
            </span>
          </h1>

          <p
            className="animate-fadeInUp delay-200"
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Analyze your resume against any job description, build ATS-optimized resumes,
            and ace your interviews with AI-powered mock sessions and feedback.
          </p>

          <div
            className="animate-fadeInUp delay-300"
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary"
              style={{ padding: '14px 36px', fontSize: '1rem' }}
            >
              Get Started Free →
            </Link>
            <Link
              href="#features"
              className="btn-secondary"
              style={{ padding: '14px 36px', fontSize: '1rem' }}
            >
              See Features
            </Link>
          </div>

          {/* Stats bar */}
          <div
            className="animate-fadeInUp delay-500"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '4rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '10K+', label: 'Resumes Analyzed' },
              { value: '95%', label: 'Satisfaction Rate' },
              { value: '50+', label: 'Roles Supported' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em',
            }}
          >
            Everything You Need to Succeed
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Powerful AI tools designed to give you an unfair advantage in your job search.
          </p>
        </div>

        <div className="grid-cards">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card animate-fadeInUp"
              style={{
                padding: '2rem',
                animationDelay: `${i * 100}ms`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  marginBottom: '1rem',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(108, 92, 231, 0.1)',
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}
              >
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section
        style={{
          padding: '5rem 1.5rem',
          background: 'rgba(26, 26, 46, 0.3)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Four simple steps to transform your job search.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="glass-card animate-slideInLeft"
                style={{
                  padding: '1.5rem 2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  animationDelay: `${i * 150}ms`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    opacity: 0.6,
                    minWidth: '40px',
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ready to Get Hired?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Join thousands of job seekers who have improved their chances with SmartHire AI.
          </p>
          <Link
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="btn-primary"
            style={{ padding: '14px 40px', fontSize: '1.05rem' }}
          >
            Start Free — No Credit Card
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} SmartHire AI. Built with ❤️ for job seekers everywhere.
        </p>
      </footer>
    </div>
  );
}
