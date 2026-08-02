import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DistributionBar, TrendPoint } from '@entities/analysis/model'

/**
 * 차트 묶음 — 이 파일만 recharts를 import한다.
 *
 * 호출부에서 React.lazy로 불러 초기 번들에 recharts가 들어가지 않게 한다
 * (DECISIONS D-005: 차트를 쓰는 화면에서만 지연 로딩).
 *
 * 접근성: 차트는 시각 정보라 스크린리더가 읽지 못한다. 같은 데이터를
 * 표로도 제공하는 것은 호출부 책임이며, 여기서는 aria-hidden으로 중복을 막는다.
 */

const AXIS = { fontSize: 11, fill: '#64748b' }

export function TrendChart({ data, unit }: { data: TrendPoint[]; unit: string }) {
  const limit = data[0]?.limit
  return (
    <div aria-hidden="true" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={AXIS} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} unit={unit} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(v) => [`${typeof v === 'number' ? v : '-'}${unit}`, '실측']}
          />
          {limit !== undefined && (
            <ReferenceLine
              y={limit}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: `관리 기준 ${limit}${unit}`, position: 'insideTopRight', fontSize: 10, fill: '#b45309' }}
            />
          )}
          <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DistributionChart({ data }: { data: DistributionBar[] }) {
  return (
    <div aria-hidden="true" className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(v) => [`${typeof v === 'number' ? v : '-'}건`, '발생']}
          />
          <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
