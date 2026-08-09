import { useId, useState } from 'react'
import { AlertTriangle, ArrowRight, Bell, Eye } from 'lucide-react'
import { actionCount, buildAlerts, type AdminAlert } from '@entities/adminalert/model'
import { fetchHrSync } from '@shared/api/sysops'
import { fetchPods } from '@shared/api/infra'
import { useRemote } from '@features/remote/useRemote'

/**
 * 상단바 알림 — 원본에 있던 종 모양.
 *
 * 아이콘만 옮기면 **누르면 아무 일도 없는 장식**이 된다. 그래서 화면 여기저기
 * 흩어져 있는 '확인이 필요한 것'을 실제로 세어 여기 모았다. 누르면 그 화면으로 간다.
 *
 * 세는 규칙은 `entities/adminalert/model.ts`에 있다 — 여기는 받아서 그릴 뿐이다.
 */

function Row({ alert, onGo }: { alert: AdminAlert; onGo: () => void }) {
  const urgent = alert.level === 'action'
  return (
    <li className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={onGo}
        className="flex w-full items-start gap-2 px-3 py-3 text-left hover:bg-slate-50"
      >
        {urgent ? (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
        ) : (
          <Eye className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-slate-900">{alert.title}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600">
            {alert.detail}
          </span>
        </span>
        <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    </li>
  )
}

export function AdminBell({ onMenu }: { onMenu: (menuId: string) => void }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  /* 상단바는 어느 화면에서나 떠 있다 — 파드는 기본 구간만 본다.
     구간을 넓히면 알림이 화면마다 달라져서, 같은 종을 눌렀는데 다른 수가 나온다 */
  const pods = useRemote(() => fetchPods('24h'), [])
  const hr = useRemote(fetchHrSync, [])

  /* 도구는 여기서 안 센다. 도구는 **발주처마다 다른데** 상단바는 발주처를 고르지 않는다 —
     아무 발주처의 도구를 세면 다른 발주처의 화면을 보면서 그 수를 보게 된다 */
  const ready = pods.kind === 'ready' && hr.kind === 'ready'
  const alerts = ready
    ? buildAlerts({
        pods: pods.data,
        hrFailed: hr.data.changes,
      })
    : []
  const urgent = actionCount(alerts)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        /* 수를 이름에 넣는다 — 빨간 점만 두면 낭독기에는 아무 일도 안 일어난다 */
        aria-label={
          alerts.length === 0
            ? '확인할 알림 없음'
            : `확인이 필요한 것 ${alerts.length}건, 그중 급한 것 ${urgent}건`
        }
        className="relative flex size-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
      >
        <Bell className="size-4" aria-hidden="true" />
        {alerts.length > 0 && (
          <span
            aria-hidden="true"
            className={`absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black text-white ${
              urgent > 0 ? 'bg-rose-600' : 'bg-amber-500'
            }`}
          >
            {alerts.length}
          </span>
        )}
      </button>

      {/* 접혔다고 안 그리면 `aria-controls`가 없는 id를 가리킨다 — 자리는 늘 둔다
          (문서 요약의 처리 단계에서 이미 한 번 밟은 것) */}
      <div
        hidden={!open}
        id={panelId}
        className="absolute top-12 right-0 z-40 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
      >
          <p className="border-b border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-500">
            지금 확인이 필요한 것
          </p>
          {alerts.length === 0 ? (
            <p className="px-3 py-4 text-xs text-slate-600">
              {ready
                ? '확인이 필요한 것이 없습니다.'
                : '상태를 불러오는 중입니다.'}
            </p>
          ) : (
            <ul>
              {alerts.map((a) => (
                <Row
                  key={a.id}
                  alert={a}
                  onGo={() => {
                    onMenu(a.menuId)
                    setOpen(false)
                  }}
                />
              ))}
            </ul>
          )}
          {/* 어디서 온 수인지 밝힌다 — 알림만 보고 '어딘가 다른 집계'라고 오해하지 않게 */}
          <p className="border-t border-slate-200 px-3 py-2 text-[10px] leading-relaxed text-slate-500">
            시스템 현황·HR 연계 화면의 값을 그대로 셌습니다. 따로 집계한 수가 아닙니다.
          </p>
      </div>
    </div>
  )
}
