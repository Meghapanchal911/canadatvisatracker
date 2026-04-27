function getSpeedColor(days) {
  if (!days) return { bg: '#F1EFE8', text: '#5F5E5A' }
  if (days <= 30) return { bg: '#EAF3DE', text: '#27500A' }
  if (days <= 90) return { bg: '#FAEEDA', text: '#633806' }
  return { bg: '#FAECE7', text: '#712B13' }
}

export default function VisaTable({ trends, loading }) {
  if (loading) {
    return (
      <div style={{ background: 'white', border: '0.5px solid #E0DED8', borderRadius: '12px', padding: '16px' }}>
        <div style={{ height: '12px', width: '30%', background: '#F1EFE8', borderRadius: '4px', marginBottom: '16px' }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ height: '36px', background: '#F8F8F6', borderRadius: '4px', marginBottom: '8px' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ background: 'white', border: '0.5px solid #E0DED8', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>
        All visa types · current snapshot
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {['Visa type', 'Category', 'Processing time', 'Speed', 'Last updated'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '6px 8px',
                borderBottom: '0.5px solid #E0DED8',
                color: '#888780', fontWeight: '500', fontSize: '11px'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trends.map(t => {
            const color = getSpeedColor(t.processing_days)
            const isTemp = t.category === 'Temporary Residence'
            return (
              <tr key={t.visa_code}>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>
                  {t.visa_name}
                </td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
                    background: isTemp ? '#E6F1FB' : '#EEEDFE',
                    color: isTemp ? '#0C447C' : '#3C3489'
                  }}>
                    {t.category}
                  </span>
                </td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8', fontWeight: '500' }}>
                  {t.processing_days ? `${t.processing_days} days` : '—'}
                </td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px',
                    borderRadius: '20px',
                    background: color.bg, color: color.text
                  }}>
                    {!t.processing_days ? 'No data' : t.processing_days <= 30 ? 'Fast' : t.processing_days <= 90 ? 'Medium' : 'Slow'}
                  </span>
                </td>
                <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8', color: '#888780' }}>
                  {t.last_updated || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}