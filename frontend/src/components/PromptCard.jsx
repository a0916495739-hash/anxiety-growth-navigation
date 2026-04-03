import { useNavigate } from 'react-router-dom';

export default function PromptCard({ message, buttonLabel, to, onDismiss }) {
  const navigate = useNavigate();

  return (
    <div style={styles.card}>
      <p style={styles.message}>{message}</p>
      <div style={styles.actions}>
        <button style={styles.primary} onClick={() => navigate(to)}>
          {buttonLabel}
        </button>
        <button style={styles.dismiss} onClick={onDismiss}>
          稍後再說
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#f0f4ff',
    border: '1px solid #c7d2fe',
    borderRadius: 12,
    padding: '16px 20px',
    marginTop: 20,
  },
  message: { margin: '0 0 12px', color: '#3730a3', fontSize: 15 },
  actions: { display: 'flex', gap: 10 },
  primary: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 14,
  },
  dismiss: {
    background: 'transparent',
    color: '#6366f1',
    border: '1px solid #6366f1',
    borderRadius: 8,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 14,
  },
};
