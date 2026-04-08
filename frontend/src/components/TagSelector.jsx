import { useState } from 'react';
import { useApp } from '../context/AppContext';

const DEFAULT_TAGS = ['焦慮', '比較', '委屈', '迷茫', '憤怒', '悲傷', '壓力', '孤獨', '挫折', '疲憊'];

export default function TagSelector({ selected, onChange, presets = DEFAULT_TAGS, placeholder = '自訂標籤（按 Enter 新增）', addLabel = '新增' }) {
  const [custom, setCustom] = useState('');
  const { isDark } = useApp();

  function toggle(tag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const tag = custom.trim();
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag]);
    }
    setCustom('');
  }

  const tagStyle = {
    background:   isDark ? 'rgba(255,255,255,0.07)' : '#f3f4f6',
    border:       `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db'}`,
    color:        isDark ? '#a8a29e' : '#374151',
    borderRadius: 20,
    padding:      '4px 14px',
    cursor:       'pointer',
    fontSize:     14,
  };

  const tagActiveStyle = {
    background:   '#7fb5a0',
    color:        '#fff',
    border:       '1px solid #7fb5a0',
    borderRadius: 20,
    padding:      '4px 14px',
    cursor:       'pointer',
    fontSize:     14,
  };

  const inputStyle = {
    flex:       1,
    border:     `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db'}`,
    borderRadius: 8,
    padding:    '6px 12px',
    fontSize:   14,
    background: isDark ? 'rgba(28,25,23,0.8)' : '#fff',
    color:      isDark ? '#e7e5e4' : '#2d3748',
  };

  const addBtnStyle = {
    background:   isDark ? 'rgba(127,181,160,0.18)' : '#e8f4f0',
    border:       `1px solid ${isDark ? 'rgba(127,181,160,0.3)' : '#b8d9cf'}`,
    color:        isDark ? '#7fb5a0' : '#4a9580',
    borderRadius: 8,
    padding:      '6px 14px',
    cursor:       'pointer',
    fontSize:     14,
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {presets.map((tag) => (
          <button
            key={tag}
            type="button"
            style={selected.includes(tag) ? tagActiveStyle : tagStyle}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
        {selected.filter((t) => !presets.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            style={tagActiveStyle}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder={placeholder}
          style={inputStyle}
        />
        <button type="button" onClick={addCustom} style={addBtnStyle}>{addLabel}</button>
      </div>
    </div>
  );
}
