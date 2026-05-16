import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import MetricCard from '../components/MetricCard'
import TrendChart from '../components/TrendChart'
import ComparisonBar from '../components/ComparisonBar'
import VisaTable from '../components/VisaTable'
import ErrorMessage from '../components/ErrorMessage'

const API = 'https://canadavisatracker.duckdns.org/api'

const COUNTRIES = [
  { code: 'IN', label: 'India' },
  { code: 'CA', label: 'Canada' },
  { code: 'US', label: 'USA' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'PH', label: 'Philippines' },
  { code: 'CN', label: 'China' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'AU', label: 'Australia' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'FR', label: 'France' },
]

const TOP_VISAS = ['visitor-outside-canada', 'study', 'work', 'supervisa']

const MAPLE_RED = '#DC2626'
const MAPLE_DARK = '#991B1B'

export default function Home() {
  const [visaTypes, setVisaTypes]               = useState([])
  const [trends, setTrends]                     = useState([])
  const [snapshots, setSnapshots]               = useState([])
  const [lastUpdated, setLastUpdated]           = useState(null)
  const [selectedVisa, setSelectedVisa]         = useState('study')
  const [selectedCountry, setSelectedCountry]   = useState('IN')
  const [trendsLoading, setTrendsLoading]       = useState(true)
  const [snapshotsLoading, setSnapshotsLoading] = useState(true)
  const [error, setError]                       = useState(null)

  useEffect(() => {
    fetch(`${API}/visa-types/`)
      .then(r => r.json())
      .then(setVisaTypes)
      .catch(() => setError('Could not connect to the API. Is Django running?'))
  }, [])

  useEffect(() => {
    fetch(`${API}/last-updated/`)
      .then(r => r.json())
      .then(setLastUpdated)
      .catch(() => {})
  }, [])

  const fetchTrends = useCallback(() => {
    setTrendsLoading(true)
    setError(null)
    fetch(`${API}/trends/?country_code=${selectedCountry}`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(data => { setTrends(data); setTrendsLoading(false) })
      .catch(err => { setError(`Could not load data: ${err.message}`); setTrendsLoading(false) })
  }, [selectedCountry])

  useEffect(() => { fetchTrends() }, [fetchTrends])

  useEffect(() => {
    setSnapshotsLoading(true)
    fetch(`${API}/snapshots/?visa_code=${selectedVisa}&country_code=${selectedCountry}`)
      .then(r => r.json())
      .then(data => { setSnapshots([...data].reverse()); setSnapshotsLoading(false) })
      .catch(() => setSnapshotsLoading(false))
  }, [selectedVisa, selectedCountry])

  function getMetric(code) {
    return trends.find(t => t.visa_code === code)
  }

  const selectedCountryLabel = COUNTRIES.find(c => c.code === selectedCountry)?.label || selectedCountry

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Head>
        <title>CanadaVisaTracker — IRCC Processing Times</title>
        <meta name="description" content="Track Canadian immigration processing times with historical trends" />
      </Head>

      {/* Top navigation */}
      <nav style={{ background: 'white', borderBottom: '0.5px solid #E5E5E3', padding: '0 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo with Canadian flag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <rect width="7" height="20" fill={MAPLE_RED}/>
              <rect x="7" width="14" height="20" fill="white"/>
              <rect x="21" width="7" height="20" fill={MAPLE_RED}/>
              <polygon points="14,4 15.2,8 18.5,8 16,9.8 17.2,13.5 14,11.5 10.8,13.5 12,9.8 9.5,8 12.8,8" fill={MAPLE_RED}/>
            </svg>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#1C1C1C' }}>CanadaVisaTracker</span>
            <span style={{ fontSize: '11px', color: '#737373', marginLeft: '4px' }}>by IRCC data</span>
          </div>

          {/* Nav right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {lastUpdated?.last_updated && (
              <span style={{ fontSize: '11px', color: '#737373' }}>
                Updated {new Date(lastUpdated.last_updated).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#FEF2F2', color: MAPLE_DARK, border: `0.5px solid #FECACA` }}>
              {lastUpdated?.records_saved || 0} records
            </span>
          </div>
        </div>
      </nav>

      {/* Red hero section */}
      <div style={{ background: MAPLE_RED }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>

          {/* Hero header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
                Immigration processing times
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                Real-time data from IRCC · {selectedCountryLabel}
              </p>
            </div>

            {/* Country selector in hero */}
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              style={{
                fontSize: '13px', padding: '8px 12px',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                cursor: 'pointer', outline: 'none'
              }}
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code} style={{ color: '#1C1C1C', background: 'white' }}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Metric cards in hero */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {TOP_VISAS.map(code => {
              const metric = getMetric(code)
              const days = metric?.processing_days
              const speedColor = !days ? 'rgba(255,255,255,0.5)' : days <= 30 ? '#4ADE80' : days <= 90 ? '#FCD34D' : '#FCA5A5'
              const speedLabel = !days ? 'No data' : days <= 30 ? 'Fast' : days <= 90 ? 'Medium' : 'Slow'

              return (
                <div key={code} style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px', padding: '14px',
                  backdropFilter: 'blur(4px)'
                }}>
                  {trendsLoading ? (
                    <>
                      <div style={{ height: '10px', width: '70%', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginBottom: '10px' }} />
                      <div style={{ height: '22px', width: '45%', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' }}>
                        {metric?.visa_name || code}
                      </div>
                      <div style={{ fontSize: '26px', fontWeight: '600', color: 'white', lineHeight: 1 }}>
                        {days || '—'}
                        {days && <span style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', marginLeft: '4px' }}>days</span>}
                      </div>
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: speedColor }} />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{speedLabel}</span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* White body */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '16px' }}>
            <ErrorMessage message={error} onRetry={fetchTrends} />
          </div>
        )}

        {/* Visa selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#737373' }}>Viewing trend for:</span>
          <select
            value={selectedVisa}
            onChange={e => setSelectedVisa(e.target.value)}
            style={{
              fontSize: '13px', padding: '7px 12px',
              borderRadius: '8px', border: `1.5px solid ${MAPLE_RED}`,
              background: 'white', color: '#1C1C1C',
              cursor: 'pointer', outline: 'none', fontWeight: '500'
            }}
          >
            {visaTypes.map(v => (
              <option key={v.code} value={v.code}>{v.name}</option>
            ))}
          </select>
          <span style={{ fontSize: '11px', color: '#737373' }}>in {selectedCountryLabel}</span>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <TrendChart
            snapshots={snapshots}
            visaName={visaTypes.find(v => v.code === selectedVisa)?.name || selectedVisa}
            countryCode={selectedCountry}
            loading={snapshotsLoading}
            accentColor={MAPLE_RED}
          />
          <ComparisonBar
            trends={trends}
            countryCode={selectedCountry}
            loading={trendsLoading}
            accentColor={MAPLE_RED}
          />
        </div>

        {/* Table */}
        <VisaTable trends={trends} loading={trendsLoading} />

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '0.5px solid #E5E5E3', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#A3A3A3' }}>
            Data sourced directly from IRCC public API · updates daily
          </span>
          <span style={{ fontSize: '11px', color: '#A3A3A3' }}>
            Built with Django + Next.js
          </span>
        </div>
      </div>
    </div>
  )
}