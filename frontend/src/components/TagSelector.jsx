import { useState } from 'react';

const DEFAULT_TAGS = ['焦慮', '比較', '委屈', '迷茫', '憤怒', '悲傷', '壓力', '孤獨', '挫折', '疲憊'];

export default function TagSelector({ selected, onChange, presets = DEFAULT_TAGS }) {
  const [custom, setCustom] = useState('');

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

  return (
    <div>
      <div style={styles.tagList}>
        {presets.map((tag) => (
          <button
            key={tag}
            type="button"
            style={selected.includes(tag) ? styles.tagActive : styles.tag}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
        {selected.filter((t) => !presets.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            style={styles.tagActive}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div style={styles.customRow}>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="自訂標籤（按 Enter 新增）"
          style={styles.input}
        />
        <button type="button" onClick={addCustom} style={styles.addBtn}>新增</button>
      </div>
    </div>
  );
}

const styles = {
  tagList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tag: {
    background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 20,
    padding: '4px 14px', cursor: 'pointer', fontSize: 14,
  },
  tagActive: {
    background: '#6366f1', color: '#fff', border: '1px solid #6366f1',
    borderRadius: 20, padding: '4px 14px', cursor: 'pointer', fontSize: 14,
  },
  customRow: { display: 'flex', gap: 8 },
  input: {
    flex: 1, border: '1px solid #d1d5db', borderRadius: 8,
    padding: '6px 12px', fontSize: 14,
  },
  addBtn: {
    background: '#e0e7ff', border: 'none', borderRadius: 8,
    padding: '6px 14px', cursor: 'pointer', fontSize: 14,
  },
};
