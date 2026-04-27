import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import LoadingSpinner from './LoadingSpinner'

export default function TrendChart({ snapshots, visaName, countryCode, loading, accentColor = '#185FA5' }) {
  return (
    <div style={{ background: 'white', border: '0.5px solid #E5E5E3', borderRadius: '12px', padding: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1C1C', marginBottom: '2px' }}>
        Processing time trend
      </div>
      <div style={{ fontSize: '11px', color: '#737373', marginBottom: '14px' }}>
        {visaName} · {countryCode} · {snapshots.length} data points
      </div>

      {loading ? (
        <LoadingSpinner message="Loading trend data..." />
      ) : snapshots.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={snapshots}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
            <XAxis dataKey="scraped_date" tick={{ fontSize: 10, fill: '#A3A3A3' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#A3A3A3' }} tickLine={false} axisLine={false} unit="d" />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '0.5px solid #E5E5E3', boxShadow: 'none' }}
              formatter={(val) => [`${val} days`, 'Processing time']}
            />
            <Line
              type="monotone"
              dataKey="processing_days"
              stroke={accentColor}
              strokeWidth={2}
              dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ fontSize: '13px', color: '#D4D4D4' }}>No historical data yet</div>
          <div style={{ fontSize: '11px', color: '#D4D4D4' }}>Run the scraper daily to build trends</div>
        </div>
      )}
    </div>
  )
}