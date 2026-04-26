import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const API = 'http://127.0.0.1:8000/api'

// Color coding for processing times
function getSpeedColor(days) {
  if (!days) return { bg: '#F1EFE8', text: '#5F5E5A' }
  if (days <= 30)  return { bg: '#EAF3DE', text: '#27500A' }
  if (days <= 90)  return { bg: '#FAEEDA', text: '#633806' }
  return { bg: '#FAECE7', text: '#712B13' }
}

function getSpeedLabel(days) {
  if (!days) return 'No data'
  if (days <= 30)  return `${days} days`
  if (days <= 90)  return `${days} days`
  return `${days} days`
}

export default function Home() {
  const [visaTypes, setVisaTypes]       = useState([])
  const [trends, setTrends]             = useState([])
  const [snapshots, setSnapshots]       = useState([])
  const [lastUpdated, setLastUpdated]   = useState(null)
  const [selectedVisa, setSelectedVisa] = useState('study')
  const [selectedCountry, setSelectedCountry] = useState('IN')
  const [loading, setLoading]           = useState(true)

  // Fetch visa types on load
  useEffect(() => {
    fetch(`${API}/visa-types/`)
      .then(r => r.json())
      .then(data => setVisaTypes(data))
  }, [])

  // Fetch last updated on load
  useEffect(() => {
    fetch(`${API}/last-updated/`)
      .then(r => r.json())
      .then(data => setLastUpdated(data))
  }, [])

  // Fetch trends when country changes
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/trends/?country_code=${selectedCountry}`)
      .then(r => r.json())
      .then(data => {
        setTrends(data)
        setLoading(false)
      })
  }, [selectedCountry])

  // Fetch snapshots when visa or country changes
  useEffect(() => {
    fetch(`${API}/snapshots/?visa_code=${selectedVisa}&country_code=${selectedCountry}`)
      .then(r => r.json())
      .then(data => {
        // Reverse so oldest is on the left of the chart
        setSnapshots([...data].reverse())
      })
  }, [selectedVisa, selectedCountry])

  // Get metric for a specific visa code from trends
  function getMetric(code) {
    return trends.find(t => t.visa_code === code)
  }

  // Top 4 visa types to show as metric cards
  const topVisas = ['visitor-outside-canada', 'study', 'work', 'supervisa']

  // Bar chart data from trends
  const barData = trends
    .filter(t => t.processing_days)
    .map(t => ({
      name: t.visa_name.split(' ').slice(0, 2).join(' '),
      days: t.processing_days
    }))
    .sort((a, b) => a.days - b.days)

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F6', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>CanadaVisaTracker</title>
      </Head>

      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '0.5px solid #E0DED8', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#185FA5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' }}>C</div>
          CanadaVisaTracker
        </div>
        {lastUpdated && (
          <div style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', border: '0.5px solid #5DCAA5' }}>
            Data updated · {new Date(lastUpdated.last_updated).toLocaleDateString()} · {lastUpdated.records_saved} records
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* Section label */}
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Overview — country: {selectedCountry}
        </div>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {topVisas.map(code => {
            const metric = getMetric(code)
            const color  = getSpeedColor(metric?.processing_days)
            return (
              <div key={code} style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', color: '#888780', marginBottom: '6px' }}>
                  {metric?.visa_name || code}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>
                  {metric?.processing_days
                    ? <span>{metric.processing_days} <span style={{ fontSize: '13px', fontWeight: '400', color: '#888780' }}>days</span></span>
                    : <span style={{ fontSize: '14px', color: '#B4B2A9' }}>No data</span>
                  }
                </div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: color.bg, color: color.text }}>
                    {metric?.processing_days ? getSpeedLabel(metric.processing_days) : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px', borderRadius: '8px', border: '0.5px solid #C8C6BE', background: 'white' }}
          >
            <option value="IN">India (IN)</option>
            <option value="CA">Canada (CA)</option>
            <option value="US">USA (US)</option>
            <option value="GB">UK (GB)</option>
            <option value="PH">Philippines (PH)</option>
            <option value="CN">China (CN)</option>
            <option value="NG">Nigeria (NG)</option>
            <option value="PK">Pakistan (PK)</option>
          </select>

          <select
            value={selectedVisa}
            onChange={e => setSelectedVisa(e.target.value)}
            style={{ fontSize: '13px', padding: '6px 10px', borderRadius: '8px', border: '0.5px solid #C8C6BE', background: 'white' }}
          >
            {visaTypes.map(v => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>

          {/* Line chart */}
          <div style={{ background: 'white', border: '0.5px solid #E0DED8', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>Processing time trend</div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '14px' }}>
              {visaTypes.find(v => v.code === selectedVisa)?.name} · {selectedCountry}
            </div>
            {snapshots.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={snapshots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
                  <XAxis dataKey="scraped_date" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '0.5px solid #E0DED8' }}
                    formatter={(val) => [`${val} days`, 'Processing time']}
                  />
                  <Line
                    type="monotone"
                    dataKey="processing_days"
                    stroke="#185FA5"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#185FA5' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B4B2A9', fontSize: '13px' }}>
                No historical data yet — run scraper daily to build trends
              </div>
            )}
          </div>

          {/* Bar chart */}
          <div style={{ background: 'white', border: '0.5px solid #E0DED8', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>All visa types comparison</div>
            <div style={{ fontSize: '11px', color: '#888780', marginBottom: '14px' }}>
              Current processing days · {selectedCountry}
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '0.5px solid #E0DED8' }}
                    formatter={(val) => [`${val} days`, 'Processing time']}
                  />
                  <Bar dataKey="days" fill="#185FA5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B4B2A9', fontSize: '13px' }}>
                No data available for this country
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '0.5px solid #E0DED8', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>All visa types · current snapshot</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['Visa type', 'Category', 'Processing time', 'Speed', 'Last updated'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '0.5px solid #E0DED8', color: '#888780', fontWeight: '500', fontSize: '11px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trends.map(t => {
                const color = getSpeedColor(t.processing_days)
                return (
                  <tr key={t.visa_code}>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>{t.visa_name}</td>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>
                      <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: t.category === 'Temporary Residence' ? '#E6F1FB' : '#EEEDFE', color: t.category === 'Temporary Residence' ? '#0C447C' : '#3C3489' }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8', fontWeight: '500' }}>
                      {t.processing_days ? `${t.processing_days} days` : '—'}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '0.5px solid #F1EFE8' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: color.bg, color: color.text }}>
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

        <div style={{ fontSize: '11px', color: '#B4B2A9', textAlign: 'center', paddingBottom: '20px' }}>
          Data sourced directly from IRCC · {lastUpdated?.records_saved || 0} records · updates daily
        </div>
      </div>
    </div>
  )
}