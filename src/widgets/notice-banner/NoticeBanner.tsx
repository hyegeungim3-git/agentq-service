import { Bell, X } from 'lucide-react'
import { noticeLevelLabel, type Notice } from '@entities/notice/model'

/**
 * 안 읽은 공지 하나를 업무 화면 위에 띄운다.
 *
 * 원본에도 같은 자리에 띠가 있었다(D-014). 공지 탭에만 두면 **아무도 안 본다** —
 * 기준이 바뀐 것을 모른 채 옛 기준으로 답을 받아 간다.
 *
 * 규율 둘.
 *  ① **하나만 띄운다.** 여러 개를 쌓으면 업무 화면이 공지판이 되고, 그러면 또 안 본다
 *  ② **닫으면 읽은 것으로 친다.** 닫았는데 다음에 또 뜨면 사용자는 X만 누르게 된다
 */
export function NoticeBanner({
  notices,
  onRead,
  onOpen,
}: {
  notices: Notice[]
  onRead: (ids: string[]) => void
  onOpen: () => void
}) {
  /* 필독을 먼저, 그다음 최신 — 무엇을 먼저 봐야 하는지는 화면이 정한다 */
  const next =
    notices.find((n) => n.level === 'important') ??
    [...notices].sort((a, b) => b.postedOn.localeCompare(a.postedOn))[0]
  if (next === undefined) return null

  return (
    /* 공지 제목·분류는 그 조직의 한국어 원문이다 — 화면 틀이 English여도 원문은
       그대로 두므로, 영어 음성이 한국어를 읽어 뭉개지 않게 여기서 표시한다 */
    <div lang="ko" className="bg-brand-soft flex items-center gap-2 border-b border-slate-200 px-4 py-2">
      <Bell className="text-brand size-4 shrink-0" aria-hidden="true" />
      {/* 브랜드 색은 **면**에 쓴다. 작은 글자에 쓰면 다크에서 명암비가 무너진다
          (같은 실수를 첫 화면에서 한 번 했다) */}
      <span className="bg-brand text-brand-fg shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black">
        {noticeLevelLabel(next.level)}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 truncate text-left text-xs font-bold text-slate-800 hover:underline"
      >
        {next.title}
      </button>
      <span className="hidden shrink-0 text-[11px] text-slate-500 sm:block">{next.postedOn}</span>
      <button
        type="button"
        onClick={() => onRead([next.id])}
        aria-label="이 공지 닫기, 읽음으로 표시합니다"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
