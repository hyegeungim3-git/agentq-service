import { ADMIN_MENUS, findMenu } from '@entities/admin/nav'

/**
 * 관리 홈 — 자주 여는 화면으로 가는 진입점.
 *
 * 이전 데모의 관리 홈은 카드 9장짜리 바로가기였다. 그중 '공지사항'과 '시스템
 * 모니터링'은 **다른 메뉴에 이미 있는 화면**이었다. 화면을 두 벌 만들지 않고
 * 여기서는 진입점만 둔다 — 카드를 누르면 그 화면 하나로 간다.
 *
 * 아직 안 만든 화면으로 가는 카드는 '준비 중'으로 표시한다. 감추면 없는 기능으로
 * 읽히고, 그냥 두면 눌렀을 때 아무 일도 없는 카드가 된다.
 */

const CARDS: { menuId: string; desc: string }[] = [
  { menuId: 'users.list', desc: '계정·권한·상태' },
  { menuId: 'users.approval', desc: '가입·권한·한도 신청' },
  { menuId: 'analytics.stats', desc: '질의량·활성 사용자' },
  { menuId: 'users.log', desc: '누가 언제 무엇에 접근했는지' },
  { menuId: 'llmops.quality', desc: '전문가 검토와 사용자 피드백' },
  { menuId: 'content', desc: '공지·Q&A — 포털에 그대로 나갑니다' },
  { menuId: 'system', desc: '클러스터·노드·파드' },
  { menuId: 'sysops.integration', desc: '외부 시스템 연동 상태' },
  { menuId: 'knowledge', desc: 'RAG 지식 DB와 접근 권한' },
]

export function AdminHomePage({ onOpen }: { onOpen: (menuId: string) => void }) {
  const ready = ADMIN_MENUS.filter((m) => m.status === 'ready')

  return (
    <main className="min-w-0 p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">관리 홈</h1>
      <p className="mt-1 text-sm text-slate-600">
        자주 여는 화면입니다. 카드를 누르면 그 화면 하나로 갑니다 — 같은 화면을 두 벌 만들지
        않았습니다.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((c) => {
          const menu = findMenu(c.menuId)
          if (!menu) return null
          const isReady = menu.status === 'ready'
          return (
            <li key={c.menuId}>
              <button
                type="button"
                onClick={() => onOpen(c.menuId)}
                className={`min-h-24 w-full rounded-xl border p-4 text-left ${
                  isReady
                    ? 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                    : 'border-dashed border-slate-300 bg-slate-50'
                }`}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{menu.label}</span>
                  {/* 감추면 없는 기능으로, 그냥 두면 죽은 카드로 읽힌다 */}
                  {!isReady && (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      준비 중
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-slate-600">{c.desc}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-5 max-w-3xl text-xs text-slate-500">
        지금 쓸 수 있는 관리 화면은 {ready.filter((m) => m.parentId !== null || m.id === 'content').length}
        개입니다. 왼쪽 메뉴에서 전체를 볼 수 있고, 아직 만들지 않은 것은 '준비 중'으로 표시해
        두었습니다.
      </p>
    </main>
  )
}
