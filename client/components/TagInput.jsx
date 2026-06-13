'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const tagAnimations = `
@keyframes tagIn {
  from { opacity: 0; transform: scale(0.7) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes tagOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.7); }
}
`;

export default function TagInput({
  tags = [],
  onChange,
  placeholder = 'Type and press Enter…',
  suggestions = [],
  label,
  maxTags = 20,
}) {
  const [inputValue, setInputValue] = useState('');
  const [removingIdx, setRemovingIdx] = useState(null);
  const inputRef = useRef(null);

  // Sanitise & add a tag
  const addTag = useCallback(
    (raw) => {
      const text = raw.trim().replace(/,$/g, '');
      if (!text) return;
      if (tags.length >= maxTags) return;
      if (tags.some((t) => t.toLowerCase() === text.toLowerCase())) return;
      onChange([...tags, text]);
      setInputValue('');
    },
    [tags, maxTags, onChange],
  );

  // Animate-out then remove
  const removeTag = useCallback(
    (idx) => {
      setRemovingIdx(idx);
      setTimeout(() => {
        onChange(tags.filter((_, i) => i !== idx));
        setRemovingIdx(null);
      }, 200);
    },
    [tags, onChange],
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
    // Backspace on empty input removes last tag
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // If they paste/type a comma, treat as submission
    if (val.includes(',')) {
      val.split(',').forEach((chunk) => addTag(chunk));
      return;
    }
    setInputValue(val);
  };

  // Filter suggestions
  const tagsLower = new Set(tags.map((t) => t.toLowerCase()));
  const filteredSuggestions = suggestions.filter(
    (s) => !tagsLower.has(s.toLowerCase()),
  );

  const nearLimit = tags.length >= maxTags - 3;

  return (
    <>
      <style>{tagAnimations}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Label row */}
        {label && (
          <label
            className="input-label"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{label}</span>
            {nearLimit && (
              <span
                style={{
                  fontSize: 12,
                  color:
                    tags.length >= maxTags
                      ? 'var(--danger)'
                      : 'var(--warning)',
                  fontWeight: 500,
                }}
              >
                {tags.length}/{maxTags}
              </span>
            )}
          </label>
        )}

        {/* Tag field container */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            minHeight: 48,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            cursor: 'text',
            transition: 'border-color 0.25s ease',
          }}
          onFocus={() => {}}
        >
          {/* Rendered tags */}
          {tags.map((tag, idx) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px 4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(108, 92, 231, 0.18)',
                border: '1px solid rgba(108, 92, 231, 0.3)',
                color: 'var(--accent-secondary)',
                fontSize: 13,
                fontWeight: 500,
                backdropFilter: 'blur(6px)',
                animation:
                  removingIdx === idx
                    ? 'tagOut 0.2s ease forwards'
                    : 'tagIn 0.25s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(idx);
                }}
                aria-label={`Remove ${tag}`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 15,
                  lineHeight: 1,
                  padding: '0 2px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--danger)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
              >
                ✕
              </button>
            </span>
          ))}

          {/* Text input */}
          {tags.length < maxTags && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? placeholder : ''}
              style={{
                flex: '1 1 120px',
                minWidth: 80,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 14,
                padding: '4px 0',
              }}
            />
          )}
        </div>

        {/* Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 4,
            }}
          >
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="badge badge-info"
                onClick={() => addTag(s)}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
