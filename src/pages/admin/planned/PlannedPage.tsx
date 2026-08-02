import { menusOf, type AdminMenu } from '@entities/admin/nav'

/**
 * 아직 만들지 않은 관리자 화면.
 *
 * 메뉴를 감추지 않는 대신 **눌렀을 때 정직하게 말한다** — 이 화면이 무엇을 할 것이고,
 * 어느 단계에서 만들며, 지금 대신 볼 수 있는 것이 있는지.
 *
 * 껍데기 화면을 복제해 두는 것보다 낫다. 껍데기는 눌러도 아무 일이 없는데
 * 만들어진 것처럼 보이고, 그 상태로 검수를 통과하면 나중에 아무도 못 찾는다.
 */

const PHASE_NOTE: Record<AdminMenu['phase'], string> = {
  P1: '지금 단계',
  P2: '운영·관리 단계에서 만듭니다',
  P3: 'AI 서비스 단계에서 만듭니다',
  P4: '인프라·개발 단계에서 만듭니다',
}

export function PlannedPage({ menu }: { menu: AdminMenu }) {
  const siblings = menusOf(menu.section).filter((m) => m.id !== menu.id)
  const ready = siblings.filter((m) => m.status === 'ready')

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-black text-slate-900">{menu.label}</h1>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
          준비 중
        </span>
      </div>

      <div className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-700">{menu.summary}</p>
        <p className="mt-3 text-sm font-bold text-slate-900">
          아직 만들지 않았습니다 — {PHASE_NOTE[menu.phase]}
        </p>
        {/* 만든 척하지 않는 이유를 말한다 */}
        <p className="mt-2 text-xs text-slate-500">
          목록에서 감추지 않은 것은 이 기능이 빠졌다는 뜻이 아니기 때문입니다. 대신 눌러도 아무
          일이 없는 껍데기 화면을 두지 않습니다.
        </p>
      </div>

      {ready.length > 0 && (
        <div className="mt-4 max-w-2xl">
          <p className="text-xs font-bold text-slate-500">
            {menu.section} 구역에서 지금 볼 수 있는 화면
          </p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {ready.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                {m.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
