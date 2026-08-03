import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Database,
  FileSearch,
  FileText,
  HardHat,
  Languages,
  MapPin,
  MessageSquare,
  Mic,
  ScanText,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { AgentId } from '@entities/agent/model'

/**
 * 에이전트 아이콘.
 *
 * 카탈로그(`entities/agent/model.ts`)에 넣지 않았다. 목록은 '무엇이 있나'이고
 * 아이콘은 '어떻게 보이나'다 — 서버가 카탈로그를 내려주게 되면 아이콘은 안 온다.
 *
 * **색은 넣지 않는다.** 이전 데모는 에이전트마다 다른 색을 썼는데, 그러면
 * 발주처 색과 무관한 색이 13개 생기고 다크 스킨에서 뒤집히지 않는 색이 섞인다.
 * 여기서는 모두 브랜드 색을 쓰고 **모양으로만 구분**한다.
 */
export const AGENT_ICONS: Record<AgentId, LucideIcon> = {
  summary: FileText,
  translate: Languages,
  review: FileSearch,
  chatbot: MessageSquare,
  report: ClipboardList,
  meeting: Mic,
  knowledge: Search,
  internalreg: BookOpen,
  ocr: ScanText,
  dbquery: Database,
  address: MapPin,
  dataanalysis: BarChart3,
  safety: HardHat,
}

/** 목록에 없는 에이전트가 생겨도 자리는 비지 않는다 */
export const FALLBACK_AGENT_ICON = Sparkles
