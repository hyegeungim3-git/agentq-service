import { lazy } from 'react'
import { AdminShell } from '@widgets/admin-shell/AdminShell'
import { findMenu, type AdminSection } from '@entities/admin/nav'
import { PlannedPage } from '@pages/admin/planned/PlannedPage'
import { Loadable } from '@shared/ui/Loadable'

/**
 * 관리자 — **셸만 여기 있고 화면은 섹션별로 따로 받는다.**
 *
 * 두 단계로 나눴다.
 *  ① 관리자 전체를 `App`에서 떼어 냈다. 업무 화면만 쓰는 사람이 관리자 44화면을
 *    받지 않게 하려는 것이다(첫 청크 gzip 262KB → 184KB).
 *  ② 그러고도 관리자에 들어가는 순간 58KB를 한꺼번에 받았다. 시스템 현황만 보는
 *    사람에게 MLOps·에이전트 정의·규정 화면까지 딸려 오는 것은 같은 문제의 축소판이다.
 *    그래서 **사이드바 섹션 단위**로 한 번 더 나눴다.
 *
 * 섹션을 경계로 삼은 이유: 사용자가 눈으로 보는 구분과 같고, 한 섹션 안에서
 * 화면을 옮길 때는 이미 받은 것이라 기다림이 없다. 화면마다 나누면 44개 요청이 되고,
 * 안 나누면 처음에 다 받는다 — 그 사이다.
 *
 * 새 관리자 화면은 **해당 섹션 파일**(`src/admin/sections/*.tsx`)에 넣는다.
 * 여기에 직접 import하면 섹션 경계가 무너져 전부 한 덩어리로 돌아간다.
 */

type SectionProps = { menuId: string; onMenu: (id: string) => void }

const SECTIONS: Record<AdminSection, React.LazyExoticComponent<(p: SectionProps) => React.ReactNode>> = {
  대시보드: lazy(() =>
    import('./admin/sections/dashboard').then((m) => ({ default: m.DashboardSection })),
  ),
  '인프라 · 개발': lazy(() =>
    import('./admin/sections/infra').then((m) => ({ default: m.InfraSection })),
  ),
  'AI 서비스': lazy(() => import('./admin/sections/ai').then((m) => ({ default: m.AiSection }))),
  '지식 · RAG': lazy(() =>
    import('./admin/sections/knowledge').then((m) => ({ default: m.KnowledgeSection })),
  ),
  '운영 · 관리': lazy(() => import('./admin/sections/ops').then((m) => ({ default: m.OpsSection }))),
}

export type AdminAppProps = {
  menuId: string
  onMenu: (id: string) => void
  onExit: () => void
  onUserPortal: () => void
  admin: { name: string; org: string }
}

export function AdminApp({ menuId, onMenu, onExit, onUserPortal, admin }: AdminAppProps) {
  const menu = findMenu(menuId)
  /* 메뉴를 못 찾으면 '준비 중' 화면으로 간다 — 섹션을 찍어서 엉뚱한 것을 받지 않는다 */
  const Section = menu ? SECTIONS[menu.section] : null

  return (
    <AdminShell
      menuId={menuId}
      onMenu={onMenu}
      onExitAdmin={onExit}
      onUserPortal={onUserPortal}
      admin={admin}
    >
      {menu !== null && menu.status === 'planned' && <PlannedPage menu={menu} />}
      {menu !== null && menu.status !== 'planned' && Section !== null && (
        /* 셸 안이므로 `inner` — 여기서 화면 높이를 또 주면 사이드바 옆이 한 화면만큼 밀린다 */
        <Loadable fill="inner">
          <Section menuId={menuId} onMenu={onMenu} />
        </Loadable>
      )}
    </AdminShell>
  )
}
