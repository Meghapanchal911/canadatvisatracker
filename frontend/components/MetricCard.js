function getSpeedColor(days) {
  if (!days) return { bg: '#F1EFE8', text: '#5F5E5A' }
  if (days <= 30) return { bg: '#EAF3DE', text: '#27500A' }
  if (days <= 90) return { bg: '#FAEEDA', text: '#633806' }
  return { bg: '#FAECE7', text: '#712B13' }
}

function getSpeedLabel(days) {
  if (!days) return 'No data'
  if (days <= 30) return 'Fast'
  if (days <= 90) return 'Medium'
  return 'Slow'
}

export default function MetricCard({ visaName, processingDays, loading }) {
  const color = getSpeedColor(processingDays)

  if (loading) {
    return (
      <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px', minHeight: '80px' }}>
        <div style={{ height: '10px', width: '60%', background: '#E0DED8', borderRadius: '4px', marginBottom: '10px' }} />
        <div style={{ height: '24px', width: '40%', background: '#E0DED8', borderRadius: '4px' }} />
      </div>
    )
  }

  return (
    <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px' }}>
      <div style={{ fontSize: '11px', color: '#888780', marginBottom: '6px' }}>
        {visaName}
      </div>
      <div style={{ fontSize: '24px', fontWeight: '500' }}>
        {processingDays
          ? <span>{processingDays} <span style={{ fontSize: '13px', fontWeight: '400', color: '#888780' }}>days</span></span>
          : <span style={{ fontSize: '14px', color: '#B4B2A9' }}>No data</span>
        }
      </div>
      <div style={{ marginTop: '6px' }}>
        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: color.bg, color: color.text }}>
          {getSpeedLabel(processingDays)}
        </span>
      </div>
    </div>
  )
}