'use client';

/**
 * Resume Builder Page — Interactive 8-Step Wizard
 * Guides users through structured data collection before
 * generating an AI-powered, XYZ-formula-optimized resume.
 */

import { useState, useCallback, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import StepperProgress from '@/components/StepperProgress';
import TagInput from '@/components/TagInput';
import ResumePreview from '@/components/ResumePreview';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// ── Step Definitions ────────────────────────────────────
const STEPS = [
  { label: 'Target Role', icon: '🎯' },
  { label: 'Personal Info', icon: '👤' },
  { label: 'Education', icon: '🎓' },
  { label: 'Skills', icon: '🛠️' },
  { label: 'Projects', icon: '🚀' },
  { label: 'Experience', icon: '💼' },
  { label: 'Achievements', icon: '🏆' },
  { label: 'Review', icon: '✨' },
];

const ROLE_SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Analyst', 'Data Scientist',
  'ML Engineer', 'DevOps Engineer', 'Cloud Engineer',
  'Mobile Developer', 'UI/UX Designer', 'Product Manager',
  'Cybersecurity Analyst', 'QA Engineer', 'System Administrator',
];

const SKILL_SUGGESTIONS = {
  languages: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'R', 'Dart'],
  frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Angular', 'Vue.js', 'Svelte', 'FastAPI', 'TensorFlow', 'PyTorch', 'Flutter', '.NET'],
  tools: ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'Terraform', 'Figma', 'Jira', 'VS Code', 'Postman', 'Webpack', 'Linux', 'Nginx'],
  databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'DynamoDB', 'Elasticsearch', 'SQLite', 'Cassandra', 'Neo4j'],
  other: ['REST APIs', 'GraphQL', 'Microservices', 'CI/CD', 'Agile', 'TDD', 'System Design', 'Data Structures', 'Machine Learning', 'Web Scraping'],
};

const TEMPLATES = [
  { id: 'modern', icon: '🎨', title: 'Modern', desc: 'Clean sans-serif with accent sidebar. Best for tech & startup roles.' },
  { id: 'classic', icon: '📜', title: 'Classic', desc: 'Traditional serif layout with dividers. Best for corporate roles.' },
  { id: 'minimal', icon: '✨', title: 'Minimal', desc: 'Ultra-clean with max whitespace. Best for ATS-heavy companies.' },
  { id: 'bold', icon: '⚡', title: 'Bold', desc: 'Strong headers with dark bar. Best for leadership & senior roles.' },
];

// ── Initial State ───────────────────────────────────────
const INITIAL_DATA = {
  targetRole: '',
  template: 'modern',
  personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' },
  education: [{ degree: '', university: '', graduationYear: '', cgpa: '', relevantCoursework: '' }],
  skills: { languages: [], frameworks: [], tools: [], databases: [], other: [] },
  projects: [{ name: '', techStack: '', description: '', impact: '' }],
  experience: [{ title: '', company: '', duration: '', type: 'internship', achievements: [''] }],
  achievements: { hackathons: [], certifications: [], competitiveProgramming: [], other: [] },
};

export default function ResumeBuilderPage() {
  return (
    <ProtectedRoute>
      <BuilderWizard />
    </ProtectedRoute>
  );
}

function BuilderWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [data, setData] = useState(() => ({
    ...INITIAL_DATA,
    personalInfo: {
      ...INITIAL_DATA.personalInfo,
      name: user?.name || '',
      email: user?.email || '',
    },
  }));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // ── Data Updaters ──────────────────────────────────────
  const updateField = useCallback((path, value) => {
    setData(prev => {
      const keys = path.split('.');
      const updated = JSON.parse(JSON.stringify(prev));
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  const updateArrayItem = useCallback((arrayPath, index, field, value) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let arr = updated;
      for (const key of keys) arr = arr[key];
      arr[index][field] = value;
      return updated;
    });
  }, []);

  const addArrayItem = useCallback((arrayPath, template) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let arr = updated;
      for (const key of keys) arr = arr[key];
      arr.push(template);
      return updated;
    });
  }, []);

  const removeArrayItem = useCallback((arrayPath, index) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = arrayPath.split('.');
      let parent = updated;
      for (let i = 0; i < keys.length - 1; i++) parent = parent[keys[i]];
      parent[keys[keys.length - 1]] = parent[keys[keys.length - 1]].filter((_, i) => i !== index);
      return updated;
    });
  }, []);

  // ── Step Validation ────────────────────────────────────
  const validateStep = useCallback((step) => {
    switch (step) {
      case 0: return data.targetRole.trim().length > 0;
      case 1: return data.personalInfo.name.trim().length > 0 && data.personalInfo.email.trim().length > 0;
      case 2: return true; // education is optional
      case 3: {
        const totalSkills = Object.values(data.skills).reduce((sum, arr) => sum + arr.length, 0);
        return totalSkills > 0;
      }
      case 4: return true; // projects optional
      case 5: return true; // experience optional
      case 6: return true; // achievements optional
      case 7: return true; // review
      default: return true;
    }
  }, [data]);

  // ── Navigation ─────────────────────────────────────────
  const goNext = useCallback(() => {
    if (!validateStep(currentStep)) {
      toast.error('Please fill in the required fields before continuing.');
      return;
    }
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  }, [currentStep, validateStep]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // ── Generate Resume ────────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/resume/build', { builderData: data });
      setResult(res.data.data.generatedResume);
      setShowPreview(true);
      toast.success('🎉 Resume generated with XYZ-formula bullets!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Show Preview ───────────────────────────────────────
  if (showPreview && result) {
    return (
      <div className="page-container">
        <ResumePreview
          resumeData={result}
          personalInfo={data.personalInfo}
          template={data.template}
          onBack={() => setShowPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">AI Resume Builder</h1>
        <p className="page-subtitle">
          Build a professional, ATS-optimized resume step by step
        </p>
      </div>

      <div className="wizard-container">
        <StepperProgress
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        <div className="glass-card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          {loading ? (
            <div className="generating-overlay">
              <div className="generating-spinner" />
              <p className="generating-text">AI is crafting your resume using the XYZ formula...</p>
              <p className="generating-subtext">This may take 15–30 seconds</p>
            </div>
          ) : (
            <>
              <div className="wizard-step" key={currentStep}>
                {currentStep === 0 && <StepTargetRole data={data} updateField={updateField} />}
                {currentStep === 1 && <StepPersonalInfo data={data} updateField={updateField} />}
                {currentStep === 2 && <StepEducation data={data} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
                {currentStep === 3 && <StepSkills data={data} updateField={updateField} />}
                {currentStep === 4 && <StepProjects data={data} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
                {currentStep === 5 && <StepExperience data={data} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} setData={setData} />}
                {currentStep === 6 && <StepAchievements data={data} updateField={updateField} />}
                {currentStep === 7 && <StepReview data={data} updateField={updateField} goToStep={goToStep} onGenerate={handleGenerate} />}
              </div>

              {currentStep < 7 && (
                <div className="wizard-nav">
                  <button
                    className="btn-ghost"
                    onClick={goPrev}
                    disabled={currentStep === 0}
                    style={{ opacity: currentStep === 0 ? 0.3 : 1 }}
                  >
                    ← Previous
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Step {currentStep + 1} of {STEPS.length}
                  </span>
                  <button className="btn-primary" onClick={goNext} style={{ padding: '10px 24px' }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 1: Target Role
// ═══════════════════════════════════════════════════════════
function StepTargetRole({ data, updateField }) {
  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Your target role helps the AI tailor the entire resume — summary, skills emphasis, and bullet points — to match what recruiters for this role look for.</span>
      </div>
      <label className="input-label" htmlFor="wizard-target-role">What role are you targeting? *</label>
      <input
        id="wizard-target-role"
        className="input-field"
        placeholder="e.g., Software Engineer, Data Analyst, Frontend Developer"
        value={data.targetRole}
        onChange={e => updateField('targetRole', e.target.value)}
        autoFocus
      />
      <div className="role-chips" style={{ marginTop: '12px' }}>
        {ROLE_SUGGESTIONS.map(role => (
          <button
            key={role}
            className="role-chip"
            onClick={() => updateField('targetRole', role)}
            style={data.targetRole === role ? { background: 'rgba(108, 92, 231, 0.25)', borderColor: 'var(--accent-primary)' } : {}}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 2: Personal Information
// ═══════════════════════════════════════════════════════════
function StepPersonalInfo({ data, updateField }) {
  const fields = [
    { key: 'name', label: 'Full Name *', placeholder: 'John Doe', type: 'text', required: true },
    { key: 'email', label: 'Email *', placeholder: 'john@example.com', type: 'email', required: true },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567', type: 'tel' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/johndoe', type: 'url' },
    { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/johndoe', type: 'url' },
    { key: 'portfolio', label: 'Portfolio URL', placeholder: 'https://johndoe.dev', type: 'url' },
  ];

  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>This information appears at the top of your resume. Only Name and Email are required — add other links to stand out.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {fields.map(f => (
          <div key={f.key}>
            <label className="input-label" htmlFor={`pi-${f.key}`}>{f.label}</label>
            <input
              id={`pi-${f.key}`}
              className="input-field"
              type={f.type}
              placeholder={f.placeholder}
              value={data.personalInfo[f.key]}
              onChange={e => updateField(`personalInfo.${f.key}`, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 3: Education
// ═══════════════════════════════════════════════════════════
function StepEducation({ data, updateArrayItem, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Add your educational qualifications. Most recent first. This section is optional but recommended.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.education.map((edu, i) => (
          <div key={i} className="glass-card dynamic-list-item" style={{ padding: '1.25rem', position: 'relative' }}>
            {data.education.length > 1 && (
              <button className="dynamic-list-remove" onClick={() => removeArrayItem('education', i)}>✕</button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Degree</label>
                <input className="input-field" placeholder="B.Tech in Computer Science" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} />
              </div>
              <div>
                <label className="input-label">University</label>
                <input className="input-field" placeholder="Indian Institute of Technology" value={edu.university} onChange={e => updateArrayItem('education', i, 'university', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Graduation Year</label>
                <input className="input-field" placeholder="2024" value={edu.graduationYear} onChange={e => updateArrayItem('education', i, 'graduationYear', e.target.value)} />
              </div>
              <div>
                <label className="input-label">CGPA / GPA</label>
                <input className="input-field" placeholder="8.5 / 10" value={edu.cgpa} onChange={e => updateArrayItem('education', i, 'cgpa', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <label className="input-label">Relevant Coursework</label>
              <input className="input-field" placeholder="Data Structures, Algorithms, Operating Systems, DBMS" value={edu.relevantCoursework} onChange={e => updateArrayItem('education', i, 'relevantCoursework', e.target.value)} />
            </div>
          </div>
        ))}
        <button
          className="dynamic-list-add"
          onClick={() => addArrayItem('education', { degree: '', university: '', graduationYear: '', cgpa: '', relevantCoursework: '' })}
        >
          + Add Education
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 4: Technical Skills
// ═══════════════════════════════════════════════════════════
function StepSkills({ data, updateField }) {
  const categories = [
    { key: 'languages', label: '💻 Programming Languages', placeholder: 'Type a language and press Enter...' },
    { key: 'frameworks', label: '📦 Frameworks & Libraries', placeholder: 'Type a framework and press Enter...' },
    { key: 'tools', label: '🔧 Tools & Platforms', placeholder: 'Type a tool and press Enter...' },
    { key: 'databases', label: '🗄️ Databases', placeholder: 'Type a database and press Enter...' },
    { key: 'other', label: '📋 Other Skills', placeholder: 'Type a skill and press Enter...' },
  ];

  const totalSkills = useMemo(
    () => Object.values(data.skills).reduce((sum, arr) => sum + arr.length, 0),
    [data.skills]
  );

  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Add at least one skill. Type a skill name and press Enter to add it. Click suggestions to add quickly. ({totalSkills} skills added)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {categories.map(cat => (
          <TagInput
            key={cat.key}
            label={cat.label}
            tags={data.skills[cat.key]}
            onChange={newTags => updateField(`skills.${cat.key}`, newTags)}
            placeholder={cat.placeholder}
            suggestions={SKILL_SUGGESTIONS[cat.key]}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 5: Projects
// ═══════════════════════════════════════════════════════════
function StepProjects({ data, updateArrayItem, addArrayItem, removeArrayItem }) {
  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Showcase your best projects. Describe what each project does and its measurable impact. The AI will rewrite descriptions using the XYZ formula.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.projects.map((proj, i) => (
          <div key={i} className="glass-card dynamic-list-item" style={{ padding: '1.25rem', position: 'relative' }}>
            {data.projects.length > 1 && (
              <button className="dynamic-list-remove" onClick={() => removeArrayItem('projects', i)}>✕</button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Project Name</label>
                <input className="input-field" placeholder="SmartHire AI" value={proj.name} onChange={e => updateArrayItem('projects', i, 'name', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Tech Stack</label>
                <input className="input-field" placeholder="React, Node.js, MongoDB, Gemini AI" value={proj.techStack} onChange={e => updateArrayItem('projects', i, 'techStack', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <label className="input-label">Description</label>
              <textarea className="input-field" placeholder="What does this project do? What problem does it solve?" value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} style={{ minHeight: '80px' }} />
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <label className="input-label">Impact / Metrics (optional)</label>
              <input className="input-field" placeholder="e.g., 500+ users, 40% faster processing, deployed to production" value={proj.impact} onChange={e => updateArrayItem('projects', i, 'impact', e.target.value)} />
            </div>
          </div>
        ))}
        <button
          className="dynamic-list-add"
          onClick={() => addArrayItem('projects', { name: '', techStack: '', description: '', impact: '' })}
        >
          + Add Project
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 6: Experience
// ═══════════════════════════════════════════════════════════
function StepExperience({ data, updateArrayItem, addArrayItem, removeArrayItem, setData }) {
  const addAchievement = (expIndex) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.experience[expIndex].achievements.push('');
      return updated;
    });
  };

  const updateAchievement = (expIndex, achIndex, value) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.experience[expIndex].achievements[achIndex] = value;
      return updated;
    });
  };

  const removeAchievement = (expIndex, achIndex) => {
    setData(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.experience[expIndex].achievements = updated.experience[expIndex].achievements.filter((_, i) => i !== achIndex);
      return updated;
    });
  };

  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Add your work experience. Don't worry about perfect wording — the AI will rewrite every bullet point using the XYZ formula: &ldquo;Accomplished [X] as measured by [Y], by doing [Z]&rdquo;.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data.experience.map((exp, i) => (
          <div key={i} className="glass-card dynamic-list-item" style={{ padding: '1.25rem', position: 'relative' }}>
            {data.experience.length > 1 && (
              <button className="dynamic-list-remove" onClick={() => removeArrayItem('experience', i)}>✕</button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="input-label">Job Title</label>
                <input className="input-field" placeholder="Software Engineer Intern" value={exp.title} onChange={e => updateArrayItem('experience', i, 'title', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Company</label>
                <input className="input-field" placeholder="Google" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Duration</label>
                <input className="input-field" placeholder="Jun 2024 – Aug 2024" value={exp.duration} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} />
              </div>
              <div>
                <label className="input-label">Type</label>
                <select className="input-field" value={exp.type} onChange={e => updateArrayItem('experience', i, 'type', e.target.value)}>
                  <option value="internship">Internship</option>
                  <option value="fulltime">Full-time</option>
                  <option value="freelance">Freelance</option>
                  <option value="parttime">Part-time</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label className="input-label">Key Achievements / Responsibilities</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exp.achievements.map((ach, j) => (
                  <div key={j} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.85rem' }}>•</span>
                    <input
                      className="input-field"
                      placeholder="e.g., Built a REST API that reduced response time by 40%"
                      value={ach}
                      onChange={e => updateAchievement(i, j, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {exp.achievements.length > 1 && (
                      <button
                        onClick={() => removeAchievement(i, j)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--danger)',
                          cursor: 'pointer', fontSize: '1rem', padding: '4px', opacity: 0.6,
                        }}
                        onMouseEnter={e => e.target.style.opacity = 1}
                        onMouseLeave={e => e.target.style.opacity = 0.6}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addAchievement(i)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-secondary)',
                    cursor: 'pointer', fontSize: '0.82rem', textAlign: 'left', padding: '4px 0',
                    opacity: 0.8,
                  }}
                >
                  + Add bullet point
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          className="dynamic-list-add"
          onClick={() => addArrayItem('experience', { title: '', company: '', duration: '', type: 'internship', achievements: [''] })}
        >
          + Add Experience
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 7: Achievements & Extracurriculars
// ═══════════════════════════════════════════════════════════
function StepAchievements({ data, updateField }) {
  const categories = [
    { key: 'hackathons', label: '🏅 Hackathons & Competitions', placeholder: 'e.g., Winner at HackMIT 2024, Top 10 at Google Code Jam' },
    { key: 'certifications', label: '📜 Certifications', placeholder: 'e.g., AWS Solutions Architect, Google Cloud Professional' },
    { key: 'competitiveProgramming', label: '💻 Competitive Programming', placeholder: 'e.g., LeetCode 2000+ rating, Codeforces Expert' },
    { key: 'other', label: '🌟 Other Achievements', placeholder: 'e.g., Published research paper, Open source contributor' },
  ];

  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">💡</span>
        <span>Add your achievements and extracurriculars. These help you stand out from other candidates. All fields are optional.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {categories.map(cat => (
          <TagInput
            key={cat.key}
            label={cat.label}
            tags={data.achievements[cat.key]}
            onChange={newTags => updateField(`achievements.${cat.key}`, newTags)}
            placeholder={cat.placeholder}
            maxTags={10}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  STEP 8: Review & Generate
// ═══════════════════════════════════════════════════════════
function StepReview({ data, updateField, goToStep, onGenerate }) {
  const totalSkills = Object.values(data.skills).reduce((sum, arr) => sum + arr.length, 0);
  const filledProjects = data.projects.filter(p => p.name.trim()).length;
  const filledExperience = data.experience.filter(e => e.title.trim()).length;
  const totalAchievements = Object.values(data.achievements).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div>
      <div className="step-help">
        <span className="step-help-icon">✨</span>
        <span>Review your information below, choose a template, and generate your resume. The AI will rewrite all bullet points using the XYZ formula.</span>
      </div>

      {/* Template Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="input-label" style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Choose a Resume Template</label>
        <div className="template-grid">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className={`template-card ${data.template === t.id ? 'selected' : ''}`}
              onClick={() => updateField('template', t.id)}
            >
              <div className="template-card-icon">{t.icon}</div>
              <div className="template-card-title">{t.title}</div>
              <div className="template-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <ReviewSection title="🎯 Target Role" onEdit={() => goToStep(0)}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{data.targetRole || '—'}</p>
        </ReviewSection>

        <ReviewSection title="👤 Personal Info" onEdit={() => goToStep(1)}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {data.personalInfo.name} · {data.personalInfo.email}
            {data.personalInfo.phone && ` · ${data.personalInfo.phone}`}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {data.personalInfo.linkedin && <span className="badge badge-info">LinkedIn ✓</span>}
            {data.personalInfo.github && <span className="badge badge-info">GitHub ✓</span>}
            {data.personalInfo.portfolio && <span className="badge badge-info">Portfolio ✓</span>}
          </div>
        </ReviewSection>

        <ReviewSection title="🎓 Education" onEdit={() => goToStep(2)}>
          {data.education.filter(e => e.degree.trim()).map((edu, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {edu.degree} — {edu.university} {edu.graduationYear && `(${edu.graduationYear})`} {edu.cgpa && `• CGPA: ${edu.cgpa}`}
            </p>
          ))}
          {!data.education.some(e => e.degree.trim()) && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not specified</p>}
        </ReviewSection>

        <ReviewSection title={`🛠️ Skills (${totalSkills})`} onEdit={() => goToStep(3)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {Object.entries(data.skills).flatMap(([, vals]) => vals).slice(0, 15).map((s, i) => (
              <span key={i} className="badge badge-info">{s}</span>
            ))}
            {totalSkills > 15 && <span className="badge badge-neutral">+{totalSkills - 15} more</span>}
          </div>
        </ReviewSection>

        <ReviewSection title={`🚀 Projects (${filledProjects})`} onEdit={() => goToStep(4)}>
          {data.projects.filter(p => p.name.trim()).map((p, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <strong>{p.name}</strong> — {p.techStack}
            </p>
          ))}
          {filledProjects === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No projects added</p>}
        </ReviewSection>

        <ReviewSection title={`💼 Experience (${filledExperience})`} onEdit={() => goToStep(5)}>
          {data.experience.filter(e => e.title.trim()).map((e, i) => (
            <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <strong>{e.title}</strong> at {e.company} ({e.duration})
            </p>
          ))}
          {filledExperience === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No experience added</p>}
        </ReviewSection>

        <ReviewSection title={`🏆 Achievements (${totalAchievements})`} onEdit={() => goToStep(6)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {Object.entries(data.achievements).flatMap(([, vals]) => vals).slice(0, 5).map((a, i) => (
              <span key={i} className="badge badge-success">{a}</span>
            ))}
            {totalAchievements === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No achievements added</span>}
          </div>
        </ReviewSection>
      </div>

      {/* Generate Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          className="btn-primary"
          onClick={onGenerate}
          style={{ padding: '16px 48px', fontSize: '1rem' }}
        >
          ✨ Generate Resume with XYZ Formula
        </button>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          AI will rewrite all bullets using &ldquo;Accomplished [X] as measured by [Y], by doing [Z]&rdquo;
        </p>
      </div>
    </div>
  );
}

// ── Review Section Helper ────────────────────────────────
function ReviewSection({ title, onEdit, children }) {
  return (
    <div className="review-section">
      <div className="review-section-header">
        <span className="review-section-title">{title}</span>
        <button className="review-edit-btn" onClick={onEdit}>Edit ✎</button>
      </div>
      {children}
    </div>
  );
}
