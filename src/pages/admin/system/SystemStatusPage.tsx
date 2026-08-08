import { useState } from 'react'
import { Gauge } from '@widgets/admin-shell/Gauge'
import { POD_WINDOWS, type PodInfo, type PodWindow } from '@entities/infra/model'
import { fetchCluster, fetchNodes, fetchPods } from '@shared/api/infra'
import { useRemote } from '@features/remote/useRemote'
import { ExampleBadge } from '@widgets/admin-shell/ExampleBadge'
import { AdminTable, EmptyRow } from '@widgets/admin-shell/AdminTable'

/**
 * 시스템 현황 — 클러스터 자원과 노드·파드.
 *
 * 구간을 고르면 **서버에 다시 묻는다.** 받아 온 목록을 화면에서 자르지 않는다 —
 * 자르면 '최근 7일'을 보려고 전 기간을 내려받게 되고, 서버가 붙는 순간 다시 짜야 한다.
 *
 * 재시작 횟수를 표에 넣었다. 이전 데모에는 없었는데, 파드가 조용히 죽고 살아나는 것을
 * 상태(Running)만 보고는 알 수 없다.
 */

const pct = (r: number): string => `${(r * 100).toFixed(1)}%`

function PodRows({ pods }: { pods: PodInfo[] }) {
  return (
    <>
      {pods.map((p) => (
        <tr key={p.name} className="border-t border-slate-100">
          {/* 행 머리글 — 낭독기가 셀마다 '어느 파드의 값인지'를 이걸로 읽는다 */}
          <th scope="row" className="px-3 py-2 text-left font-mono text-[11px] font-normal text-slate-700">
            {p.name}
          </th>
          <td className="px-3 py-2 text-slate-600">{p.namespace}</td>
          <td className="px-3 py-2 tabular-nums text-slate-600">{p.cpuMilli}m</td>
          <td className="px-3 py-2 tabular-nums text-slate-600">{p.memoryMib}Mi</td>
          <td className="px-3 py-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                p.phase === 'Failed'
                  ? 'bg-rose-100 text-rose-800'
                  : p.phase === 'Running'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
              }`}
            >
              {p.phase}
            </span>
          </td>
          {/* 상태만 보면 조용히 죽고 살아나는 파드를 놓친다 */}
          <td className="px-3 py-2 tabular-nums">
            <span className={p.restarts > 0 ? 'font-bold text-rose-700' : 'text-slate-400'}>
              {p.restarts}
            </span>
          </td>
        </tr>
      ))}
    </>
  )
}

export function SystemStatusPage() {
  const [window, setWindow] = useState<PodWindow>('24h')
  const cluster = useRemote(fetchCluster, [])
  const nodes = useRemote(fetchNodes, [])
  const pods = useRemote(() => fetchPods(window), [window])

  const failing =
    pods.kind === 'ready' ? pods.data.filter((p) => p.phase === 'Failed' || p.restarts > 0) : []

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">시스템 현황</h1>
        <ExampleBadge />
      </div>
      <p className="mt-1 text-sm text-slate-600">클러스터 자원과 노드·파드 상태입니다.</p>

      <section aria-labelledby="cluster" className="mt-5">
        <h2 id="cluster" className="text-sm font-black text-slate-900">
          클러스터 자원
        </h2>
        {cluster.kind === 'loading' && (
          <div role="status" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
            <span className="sr-only">클러스터 자원을 불러오는 중입니다</span>
          </div>
        )}
        {cluster.kind === 'error' && (
          <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {cluster.message}
          </p>
        )}
        {cluster.kind === 'ready' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 숫자만 있으면 5.3%와 58.4%가 같은 무게로 보인다 — 채운 만큼을 함께
                보여 준다(원본 배치, D-014). 숫자와 라벨은 그대로 남는다 */}
            <Gauge label="CPU 사용률" value={Number((cluster.data.cpuRatio * 100).toFixed(1))} unit="%" />
            <Gauge label="메모리 사용률" value={Number((cluster.data.memoryRatio * 100).toFixed(1))} unit="%" />
            <Gauge label="GPU 평균 소비 전력" value={Number(cluster.data.gpuPowerWatt.toFixed(1))} unit="W" />
            <Gauge
              label="파일시스템 사용률"
              value={Number((cluster.data.filesystemRatio * 100).toFixed(1))}
              unit="%"
            />
          </div>
        )}
      </section>

      <section aria-labelledby="nodes" className="mt-6">
        <h2 id="nodes" className="text-sm font-black text-slate-900">
          노드 정보
        </h2>
        {nodes.kind === 'ready' && (
          <AdminTable label="노드 정보" minW="min-w-[40rem]" wrap="mt-3">
              <thead className="bg-slate-50 text-[11px] text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">노드</th>
                  <th scope="col" className="px-3 py-2">주소</th>
                  <th scope="col" className="px-3 py-2">OS</th>
                  <th scope="col" className="px-3 py-2">커널</th>
                  <th scope="col" className="px-3 py-2">CPU</th>
                  <th scope="col" className="px-3 py-2">메모리</th>
                </tr>
              </thead>
              <tbody>
            {nodes.data.length === 0 && (
              <EmptyRow cols={6}>클러스터에 노드가 없습니다.</EmptyRow>
            )}
                {nodes.data.map((n) => (
                  <tr key={n.name} className="border-t border-slate-100">
                    <th scope="row" className="px-3 py-2 font-bold text-slate-800 text-left">{n.name}</th>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-600">{n.instance}</td>
                    <td className="px-3 py-2 text-slate-600">{n.os}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{n.kernel}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{pct(n.cpuRatio)}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">{pct(n.memoryRatio)}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
        )}
      </section>

      <section aria-labelledby="pods" className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="pods" className="text-sm font-black text-slate-900">
            파드 정보
          </h2>
          <div className="ml-auto flex flex-wrap gap-1">
            {POD_WINDOWS.map((w) => (
              <label
                key={w}
                className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
              >
                <input
                  type="radio"
                  name="pod-window"
                  value={w}
                  checked={window === w}
                  onChange={() => setWindow(w)}
                  className="sr-only"
                />
                {w}
              </label>
            ))}
          </div>
        </div>

        {pods.kind === 'loading' && (
          <div role="status" className="mt-3 h-40 animate-pulse rounded-xl border border-slate-200 bg-white">
            <span className="sr-only">파드 목록을 불러오는 중입니다</span>
          </div>
        )}
        {pods.kind === 'ready' && (
          <>
            {/* 넓은 구간에서만 드러나는 것이 있다 — 몇 건인지 먼저 말한다 */}
            <p className="mt-2 text-xs text-slate-600">
              {window} 구간 {pods.data.length}건
              {failing.length > 0 ? (
                <span className="ml-1 font-bold text-rose-700">
                  · 실패하거나 재시작한 파드 {failing.length}건
                </span>
              ) : (
                <span className="ml-1 text-slate-400">· 실패·재시작 없음</span>
              )}
            </p>
            <AdminTable label="파드 정보" minW="min-w-[44rem]">
                <thead className="bg-slate-50 text-[11px] text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">파드</th>
                    <th scope="col" className="px-3 py-2">네임스페이스</th>
                    <th scope="col" className="px-3 py-2">CPU</th>
                    <th scope="col" className="px-3 py-2">메모리</th>
                    <th scope="col" className="px-3 py-2">상태</th>
                    <th scope="col" className="px-3 py-2">재시작</th>
                  </tr>
                </thead>
                <tbody>
                  <PodRows pods={pods.data} />
                </tbody>
              </AdminTable>
          </>
        )}
      </section>
    </main>
  )
}
