import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Building2,
  ClipboardCheck,
  Code,
  Cpu,
  Database,
  GraduationCap,
  LayoutGrid,
  LineChart,
  Megaphone,
  Package,
  Rocket,
  Scale,
  ScrollText,
  Server,
  Settings,
  ShieldCheck,
  Terminal,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * 관리자 메뉴 아이콘.
 *
 * `entities/admin/nav.ts`에 두지 않았다. 메뉴 구조는 '무엇이 있나'이고
 * 아이콘은 '어떻게 보이나'다 — 서버가 메뉴를 내려주게 되면 아이콘은 안 온다.
 * 화면 층이 id로 붙인다.
 *
 * 상위 항목에만 붙인다. 하위까지 붙이면 24개가 60개로 보이던 문제가
 * 색과 모양으로 다시 생긴다.
 */
export const MENU_ICONS: Record<string, LucideIcon> = {
  system: Server,
  service: Activity,
  gpu: Cpu,
  trainer: LineChart,
  data: Database,
  devenv: Terminal,
  registry: Boxes,
  training: GraduationCap,
  evaluation: ClipboardCheck,
  guardrail: ShieldCheck,
  aiact: Scale,
  packstudio: Package,
  deploy: Rocket,
  agents: Bot,
  apps: LayoutGrid,
  knowledge: BookOpen,
  users: Users,
  hr: Building2,
  llmops: Brain,
  analytics: BarChart3,
  logs: ScrollText,
  content: Megaphone,
  prompts: Code,
  sysops: Settings,
}

/** 목록에 없는 메뉴가 생겨도 자리는 비지 않는다 */
export const FALLBACK_ICON = LayoutGrid

export const menuIcon = (id: string): LucideIcon => MENU_ICONS[id] ?? FALLBACK_ICON
