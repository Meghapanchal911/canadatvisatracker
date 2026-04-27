import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import LoadingSpinner from './LoadingSpinner'

export default function ComparisonBar({ trends, countryCode, loading, accentColor = '#185FA5' }) {
  const barData = trends
    .filter(t => t.processing_days)
    .map(t => ({
      name: t.visa_name.split(' ').slice(0, 2).join(' '),
      days: t.processing_days
    }))
    .sort((a, b) => a.days - b.days)

  return (
    <div style={{ background: 'white', border: '0.5px solid #E5E5E3', borderRadius: '12px', padding: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1C1C', marginBottom: '2px' }}>
        All visa types comparison
      </div>
      <div style={{ fontSize: '11px', color: '#737373', marginBottom: '14px' }}>
        Current processing days · {countryCode}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading comparison..." />
      ) : barData.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#A3A3A3' }} tickLine={false} axisLine={false} unit="d" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#A3A3A3' }} tickLine={false} axisLine={false} width={75} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '0.5px solid #E5E5E3' }}
              formatter={(val) => [`${val} days`, 'Processing time']}
            />
            <Bar dataKey="days" fill={accentColor} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4D4D4', fontSize: '13px' }}>
          No data available for {countryCode}
        </div>
      )}
    </div>
  )
}