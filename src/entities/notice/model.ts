/**
 * 공지사항.
 *
 * 이전 데모에는 사이드바 항목만 있고 목록이 없었다. 목록을 만들되
 * **읽지 않은 것이 몇 건인지**를 사이드바가 말하게 한다 — 그게 공지의 값어치다.
 */
export type NoticeLevel = 'notice' | 'important'

export type Notice = {
  id: string
  level: NoticeLevel
  title: string
  /** 'YYYY-MM-DD' */
  postedOn: string
  body: string
}

const LEVEL_LABEL: Record<NoticeLevel, string> = { notice: '공지', important: '필독' }
export const noticeLevelLabel = (l: NoticeLevel): string => LEVEL_LABEL[l]

/** 아직 안 읽은 공지 — 사이드바 배지가 이 수를 쓴다 */
export function unreadNotices(notices: Notice[], readIds: string[]): Notice[] {
  return notices.filter((n) => !readIds.includes(n.id))
}
