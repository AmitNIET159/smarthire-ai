'use client';

/**
 * FileUpload Component
 * Drag & drop file upload zone with visual feedback.
 * Props:
 *   onFileSelect: (file: File) => void
 *   accept: string (default ".pdf,.docx")
 *   maxSize: number (bytes, default 10MB)
 */

import { useState, useRef, useCallback } from 'react';

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.docx',
  maxSize = 10 * 1024 * 1024,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      setError('');
      const ext = file.name.split('.').pop().toLowerCase();
      const allowedExts = accept.split(',').map((a) => a.replace('.', '').trim());

      if (!allowedExts.includes(ext)) {
        setError(`Only ${accept} files are allowed.`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File must be under ${Math.round(maxSize / 1024 / 1024)}MB.`);
        return false;
      }
      return true;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClick = () => inputRef.current?.click();

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(108, 92, 231, 0.05)' : 'var(--bg-input)',
          transition: 'all 0.3s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
          {selectedFile ? '📄' : '☁️'}
        </div>

        {selectedFile ? (
          <div>
            <p style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '4px' }}>
              {selectedFile.name}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Drop your resume here
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              or click to browse • PDF, DOCX up to 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
