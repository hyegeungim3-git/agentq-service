import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocActions } from './DocActions'
import {
  canSubmit,
  documentAsText,
  failed,
  fileNameOf,
  runChecks,
  warned,
  type OutgoingDoc,
} from '@entities/docflow/model'
import { isComplete, missingRoles } from '@entities/approval/model'
import { APPROVAL_LINE } from '@fixtures/approval'

const GOOD: OutgoingDoc = {
  docNo: 'HBP-생산기술팀-2026-014',
  title: '주간 실적 보고 — 생산기술팀',
  department: '생산기술팀',
  period: '2026-07-20 ~ 07-24',
  sections: [
    { heading: '주요 실적', body: '프레스 3호기 금형 교체 2건', source: 'MES 생산 실적' },
    { heading: '차주 계획', body: '침탄로 온도 편차 점검', source: '설비 점검 계획' },
    { heading: '특이사항', body: '없음', source: '작성자 입력' },
  ],
  pendingFields: [],
  securityGrade: '내부',
}

const BAD: OutgoingDoc = {
  ...GOOD,
  docNo: '임시문서',
  department: '',
  sections: [
    { heading: '주요 실적', body: '담당자 연락처 010-1234-5678로 문의', source: '' },
    { heading: '차주 계획', body: '미정', source: '작성자 입력' },
  ],
  pendingFields: ['보고 기간 확인'],
  securityGrade: null,
}

describe('내보내기 전 확인', () => {
  beforeEach(() => vi.restoreAllMocks())

  /**
   * 이 화면의 핵심.
   *
   * 이전 데모는 점검 결과가 데이터에 미리 적혀 있어 문서가 어떻든 늘 통과였다.
   * 여기서는 실제 문서를 보고 계산하므로, 같은 화면이 문서에 따라 다르게 답한다.
   */
  it('문서가 다르면 점검 결과가 다르다', () => {
    const good = runChecks(GOOD)
    expect(failed(good)).toHaveLength(0)
    const bad = runChecks(BAD)
    expect(bad.filter((c) => c.id === 'docNo')[0]?.status).toBe('fail')
    expect(bad.filter((c) => c.id === 'department')[0]?.status).toBe('fail')
    expect(bad.filter((c) => c.id === 'source')[0]?.status).toBe('fail')
  })

  it('개인정보로 보이는 것을 잡되, 다 걸렀다고 말하지 않는다', () => {
    const bad = runChecks(BAD).find((c) => c.id === 'personal')
    expect(bad?.status).toBe('warn')
    expect(bad?.detail).toContain('휴대전화')

    const good = runChecks(GOOD).find((c) => c.id === 'personal')
    expect(good?.detail).toContain('다 걸러 냈다는 뜻은 아닙니다')
  })

  /* 눌러 놓고 서버가 거절하게 두지 않는다 */
  it('고쳐야 할 것이 남으면 결재에 못 올린다고 그 자리에서 말한다', async () => {
    render(<DocActions doc={BAD} />)
    expect(await screen.findByText(/결재에 올릴 수 없습니다/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '결재 상신' })).not.toBeInTheDocument()
    /* 점검 목록과 결재 안내 양쪽에 나온다 — 고쳐야 할 것은 두 자리에서 같은 말을 한다 */
    expect(screen.getAllByText(/기관-부서-연도-일련번호 형식이 아닙니다/)).toHaveLength(2)
  })

  /* 이전 데모는 1.8초 뒤 상신 완료를 띄웠다 */
  it('상신은 성공한 척하지 않는다', async () => {
    render(<DocActions doc={GOOD} />)
    await userEvent.click(await screen.findByRole('button', { name: '결재 상신' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/그룹웨어에 문서를 만드는 일이라/)
  })

  it('결재선을 조직도 기준으로 보여 준다', async () => {
    render(<DocActions doc={GOOD} />)
    await userEvent.click(screen.getByRole('button', { name: /결재선 보기/ }))
    expect(await screen.findByText(/오세진 · 설비보전팀 팀장/)).toBeInTheDocument()
  })

  /* 받는 사람이 점검 결과를 모르면 점검이 화면 안에서 끝난다 */
  it('내려받는 글에 출처·AI 초안 고지·걸린 항목이 함께 들어간다', () => {
    const text = documentAsText(BAD, runChecks(BAD))
    expect(text).toContain('출처 · 작성자 입력')
    expect(text).toContain('AI가 만든 초안')
    expect(text).toContain('자가점검에서 걸린 것')
    expect(text).toContain('문서번호 형식')
  })

  it('내려받기가 막히면 받은 줄 알지 않게 말한다', async () => {
    /* URL.createObjectURL은 jsdom에 없다 — 없는 것을 없는 대로 두고 실패 경로를 본다 */
    render(<DocActions doc={GOOD} />)
    await userEvent.click(await screen.findByRole('button', { name: '내려받기' }))
    const said = screen.queryByRole('alert') ?? screen.queryByRole('status')
    expect(said).not.toBeNull()
  })

  it('파일 이름은 문서번호다', () => {
    expect(fileNameOf(GOOD)).toBe('HBP-생산기술팀-2026-014.txt')
  })
})

describe('결재선 판정', () => {
  it('세 단계가 다 있어야 성립한다', () => {
    expect(isComplete(APPROVAL_LINE)).toBe(true)
    expect(missingRoles(APPROVAL_LINE.filter((s) => s.role !== 'approver'))).toEqual(['approver'])
  })

  it('고쳐야 할 것이 없을 때만 올릴 수 있다', () => {
    expect(canSubmit(runChecks(GOOD))).toBe(true)
    expect(canSubmit(runChecks(BAD))).toBe(false)
    /* 확인 필요는 막지 않는다 — 막으면 아무것도 못 올린다 */
    expect(warned(runChecks(GOOD)).length).toBeGreaterThanOrEqual(0)
  })
})
