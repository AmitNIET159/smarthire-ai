'use client';

import { useRef, useState, useCallback } from 'react';

// ─── Print‑only styles ────────────────────────────────────────────────────────
const printStyles = `
@media print {
  body * { visibility: hidden !important; }
  #resume-preview-container,
  #resume-preview-container * {
    visibility: visible !important;
  }
  #resume-preview-container {
    position: absolute;
    left: 0; top: 0;
    width: 100%;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
  }
}
`;

// ─── Shared section renderer ──────────────────────────────────────────────────
function SectionContent({ resumeData, personalInfo, sectionStyles }) {
  const s = sectionStyles; // shorthand

  return (
    <>
      {/* Professional Summary */}
      {resumeData.summary && (
        <div style={{ ...s.section, pageBreakInside: 'avoid' }}>
          <h2 style={s.sectionTitle}>Professional Summary</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          <p style={s.body}>{resumeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience?.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Experience</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          {resumeData.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, pageBreakInside: 'avoid' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 4,
                }}
              >
                <strong style={s.itemTitle}>
                  {exp.title} — {exp.company}
                </strong>
                <span style={s.itemMeta}>{exp.duration}</span>
              </div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                {exp.bullets?.map((b, j) => (
                  <li
                    key={j}
                    style={{
                      ...s.body,
                      borderLeft: s.bulletBorder || '3px solid #6c5ce7',
                      paddingLeft: 10,
                      marginBottom: 5,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {resumeData.projects?.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Projects</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          {resumeData.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: 14, pageBreakInside: 'avoid' }}>
              <strong style={s.itemTitle}>{proj.name}</strong>
              {proj.techStack && (
                <span style={{ ...s.body, fontStyle: 'italic', marginLeft: 8 }}>
                  ({proj.techStack})
                </span>
              )}
              <ul style={{ margin: '6px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                {proj.bullets?.map((b, j) => (
                  <li
                    key={j}
                    style={{
                      ...s.body,
                      borderLeft: s.bulletBorder || '3px solid #6c5ce7',
                      paddingLeft: 10,
                      marginBottom: 5,
                    }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Technical Skills */}
      {resumeData.skills && (
        <div style={{ ...s.section, pageBreakInside: 'avoid' }}>
          <h2 style={s.sectionTitle}>Technical Skills</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(resumeData.skills).map(([cat, list]) =>
              list?.length ? (
                <p key={cat} style={s.body}>
                  <strong style={{ textTransform: 'capitalize' }}>{cat}: </strong>
                  {Array.isArray(list) ? list.join(', ') : list}
                </p>
              ) : null,
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeData.education?.length > 0 && (
        <div style={{ ...s.section, pageBreakInside: 'avoid' }}>
          <h2 style={s.sectionTitle}>Education</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          {resumeData.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: 8, pageBreakInside: 'avoid' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 4,
                }}
              >
                <strong style={s.itemTitle}>{edu.degree}</strong>
                <span style={s.itemMeta}>{edu.year}</span>
              </div>
              <p style={s.body}>
                {edu.university}
                {edu.cgpa ? ` — CGPA: ${edu.cgpa}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {resumeData.achievements?.length > 0 && (
        <div style={{ ...s.section, pageBreakInside: 'avoid' }}>
          <h2 style={s.sectionTitle}>Achievements</h2>
          {s.sectionRule && <hr style={s.sectionRule} />}
          <ul style={{ margin: 0, paddingLeft: 18, ...s.body }}>
            {resumeData.achievements.map((a, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── HEADER helpers ───────────────────────────────────────────────────────────
function ContactLine({ personalInfo, style }) {
  const items = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.portfolio,
  ].filter(Boolean);
  return (
    <p style={{ margin: 0, ...style }}>
      {items.join('  |  ')}
    </p>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPLATE RENDERERS
// ════════════════════════════════════════════════════════════════════════════════

// ── Modern ──────────────────────────────────────────────────────────────────
function ModernTemplate({ resumeData, personalInfo }) {
  const styles = {
    section: { marginBottom: 18 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#1a1a2e',
      marginBottom: 8,
      paddingBottom: 4,
      borderBottom: '2px solid #6c5ce7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    sectionRule: null,
    body: { fontSize: 13, color: '#333', lineHeight: 1.6, margin: '2px 0', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemTitle: { fontSize: 14, color: '#111', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemMeta: { fontSize: 12, color: '#666', fontStyle: 'italic', fontFamily: 'system-ui, -apple-system, sans-serif' },
    bulletBorder: '3px solid #6c5ce7',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left sidebar */}
      <div
        style={{
          width: 210,
          flexShrink: 0,
          background: 'linear-gradient(180deg, #6c5ce7 0%, #a29bfe 100%)',
          color: '#fff',
          padding: '36px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          {personalInfo.name}
        </h1>
        <div style={{ fontSize: 11, lineHeight: 1.7, marginTop: 12, wordBreak: 'break-word' }}>
          {personalInfo.email && <p style={{ margin: '2px 0' }}>✉ {personalInfo.email}</p>}
          {personalInfo.phone && <p style={{ margin: '2px 0' }}>📞 {personalInfo.phone}</p>}
          {personalInfo.linkedin && <p style={{ margin: '2px 0' }}>🔗 {personalInfo.linkedin}</p>}
          {personalInfo.github && <p style={{ margin: '2px 0' }}>💻 {personalInfo.github}</p>}
          {personalInfo.portfolio && <p style={{ margin: '2px 0' }}>🌐 {personalInfo.portfolio}</p>}
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, padding: '32px 28px 24px' }}>
        <SectionContent
          resumeData={resumeData}
          personalInfo={personalInfo}
          sectionStyles={styles}
        />
      </div>
    </div>
  );
}

// ── Classic ─────────────────────────────────────────────────────────────────
function ClassicTemplate({ resumeData, personalInfo }) {
  const styles = {
    section: { marginBottom: 18 },
    sectionTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#222',
      marginBottom: 2,
      fontFamily: 'Georgia, "Times New Roman", serif',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    sectionRule: {
      border: 'none',
      borderTop: '1px solid #999',
      margin: '4px 0 10px',
    },
    body: { fontSize: 13, color: '#333', lineHeight: 1.65, margin: '2px 0', fontFamily: 'Georgia, "Times New Roman", serif' },
    itemTitle: { fontSize: 14, color: '#111', fontFamily: 'Georgia, "Times New Roman", serif' },
    itemMeta: { fontSize: 12, color: '#555', fontFamily: 'Georgia, "Times New Roman", serif' },
    bulletBorder: '3px solid #555',
  };

  return (
    <div style={{ padding: '36px 40px 24px', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Centered header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#111' }}>
          {personalInfo.name}
        </h1>
        <ContactLine
          personalInfo={personalInfo}
          style={{ fontSize: 11, color: '#555', marginTop: 6 }}
        />
      </div>
      <hr style={{ border: 'none', borderTop: '2px solid #333', margin: '0 0 18px' }} />

      <SectionContent
        resumeData={resumeData}
        personalInfo={personalInfo}
        sectionStyles={styles}
      />
    </div>
  );
}

// ── Minimal ─────────────────────────────────────────────────────────────────
function MinimalTemplate({ resumeData, personalInfo }) {
  const styles = {
    section: { marginBottom: 20 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 600,
      color: '#666',
      marginBottom: 8,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: 3,
      fontVariant: 'small-caps',
    },
    sectionRule: null,
    body: { fontSize: 13, color: '#444', lineHeight: 1.7, margin: '2px 0', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemTitle: { fontSize: 13.5, color: '#222', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemMeta: { fontSize: 12, color: '#888', fontFamily: 'system-ui, -apple-system, sans-serif' },
    bulletBorder: '2px solid #ccc',
  };

  return (
    <div style={{ padding: '44px 48px 28px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, margin: 0, color: '#111', letterSpacing: 2 }}>
          {personalInfo.name}
        </h1>
        <ContactLine
          personalInfo={personalInfo}
          style={{ fontSize: 11, color: '#888', marginTop: 8, letterSpacing: 0.5 }}
        />
        <div
          style={{
            width: 40,
            height: 1,
            background: '#bbb',
            marginTop: 16,
          }}
        />
      </div>

      <SectionContent
        resumeData={resumeData}
        personalInfo={personalInfo}
        sectionStyles={styles}
      />
    </div>
  );
}

// ── Bold ────────────────────────────────────────────────────────────────────
function BoldTemplate({ resumeData, personalInfo }) {
  const styles = {
    section: { marginBottom: 18 },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 800,
      color: '#1a1a2e',
      marginBottom: 10,
      paddingLeft: 12,
      borderLeft: '4px solid #6c5ce7',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    sectionRule: null,
    body: { fontSize: 13, color: '#333', lineHeight: 1.65, margin: '2px 0', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemTitle: { fontSize: 14, color: '#111', fontFamily: 'system-ui, -apple-system, sans-serif' },
    itemMeta: { fontSize: 12, color: '#666', fontFamily: 'system-ui, -apple-system, sans-serif' },
    bulletBorder: '3px solid #6c5ce7',
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Dark header */}
      <div
        style={{
          background: '#1a1a2e',
          color: '#fff',
          padding: '32px 36px 24px',
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: 1 }}>
          {personalInfo.name}
        </h1>
        <ContactLine
          personalInfo={personalInfo}
          style={{ fontSize: 12, color: '#aab', marginTop: 8, letterSpacing: 0.3 }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '28px 36px 20px' }}>
        <SectionContent
          resumeData={resumeData}
          personalInfo={personalInfo}
          sectionStyles={styles}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export default function ResumePreview({
  resumeData = {},
  personalInfo = {},
  template = 'modern',
  onBack,
}) {
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // ── PDF Download ──────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = containerRef.current;
      if (!element) return;
      const filename = `${personalInfo.name?.replace(/\s+/g, '_') || 'Resume'}_Resume.pdf`;
      await html2pdf()
        .set({
          margin: 0.5,
          filename,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter' },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF download is not available. Please try the Print option instead.');
    }
  }, [personalInfo.name]);

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resumeData.fullText || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed – please try again.');
    }
  }, [resumeData.fullText]);

  // ── Choose template ───────────────────────────────────────────────────────
  const TemplateComponent = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
    bold: BoldTemplate,
  }[template] || ModernTemplate;

  // ── Action button style ───────────────────────────────────────────────────
  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
  };

  return (
    <>
      <style>{printStyles}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleDownload}
            style={{ ...btnStyle, background: 'var(--accent-primary)', color: '#fff', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            📥 Download PDF
          </button>

          <button
            onClick={handlePrint}
            style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
          >
            🖨️ Print
          </button>

          <button
            onClick={handleCopy}
            style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
          >
            {copied ? '✅ Copied!' : '📋 Copy Text'}
          </button>

          {onBack && (
            <button
              onClick={onBack}
              style={{ ...btnStyle, marginLeft: 'auto' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-card)')}
            >
              ← Back
            </button>
          )}
        </div>

        {/* Resume document preview */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <div
            id="resume-preview-container"
            ref={containerRef}
            style={{
              width: '100%',
              maxWidth: 800,
              minHeight: 1000,
              background: '#ffffff',
              color: '#111',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
              overflow: 'visible',
              /* Scale down on small screens */
              transformOrigin: 'top center',
            }}
          >
            <TemplateComponent
              resumeData={resumeData}
              personalInfo={personalInfo}
            />
          </div>
        </div>
      </div>
    </>
  );
}
