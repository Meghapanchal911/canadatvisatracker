export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={{
      background: '#FAECE7',
      border: '0.5px solid #F0997B',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px'
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '500', color: '#712B13', marginBottom: '2px' }}>
          Something went wrong
        </div>
        <div style={{ fontSize: '12px', color: '#993C1D' }}>{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            fontSize: '12px', padding: '6px 12px',
            borderRadius: '6px', border: '0.5px solid #F0997B',
            background: 'white', color: '#712B13',
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}