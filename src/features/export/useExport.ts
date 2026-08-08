import { useCallback, useState } from 'react'

/**
 * 만든 문서를 가져간다 — 내려받기와 인쇄.
 *
 * 서버 없이도 되는 일이라 화면이 한다. 다만 **둘 다 브라우저가 거절할 수 있다** —
 * 내려받기는 차단되고, 인쇄는 팝업이 막힌다. 조용히 넘기면 사용자는 받은 줄 알고
 * 파일을 찾다가 없다는 걸 나중에 안다. 그래서 성공/실패를 그 자리에서 말한다.
 *
 * ⚠️ 여기서 만드는 것은 **글자 파일**이다. 공문서 서식(PDF·HWP)은 서버가 만들어야
 * 한다 — 화면이 흉내 낸 서식은 진짜 결재 문서처럼 보이지만 규격이 아니다.
 */

export type ExportState = { kind: 'idle' } | { kind: 'done'; what: string } | { kind: 'failed'; why: string }

export function useExport() {
  const [state, setState] = useState<ExportState>({ kind: 'idle' })

  const download = useCallback((text: string, fileName: string) => {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setState({ kind: 'done', what: fileName })
    } catch {
      setState({ kind: 'failed', why: '브라우저가 내려받기를 막았습니다. 설정에서 이 사이트의 다운로드를 허용해 주십시오.' })
    }
  }, [])

  const print = useCallback(() => {
    try {
      window.print()
      setState({ kind: 'done', what: '인쇄' })
    } catch {
      setState({ kind: 'failed', why: '브라우저가 인쇄 창을 막았습니다.' })
    }
  }, [])

  return { state, download, print }
}
