/**
 * 내보내는 문서 — 자가점검 · 내려받기 · 결재.
 *
 * 보고서·회의록·안전관리계획은 만들어 놓고 끝이 아니다. 사람이 점검하고, 가져가고,
 * 결재에 올려야 업무가 닫힌다. 세 화면이 각자 다른 방식으로 그걸 하면 갈라지므로
 * **문서 하나의 모양**(`OutgoingDoc`)으로 모으고, 그 위에서 셋을 같은 규칙으로 한다.
 *
 * ⚠️ **점검 결과를 데이터로 들고 있지 않는다.** 이전 데모는 항목마다 `status: 'pass'`와
 * 근거 문장을 미리 적어 두었다. 그러면 문서가 어떻든 늘 같은 답이 나오고,
 * 점검은 통과 도장이 된다. 여기서는 **실제 문서를 보고 계산한다** — 규칙을 어기면
 * 그 자리에서 걸린다.
 *
 * 그래서 '문서번호 형식'을 고치면 그 항목만 바뀌고, 절을 지우면 충실성이 걸린다.
 * 점검이 통과 도장이 아니라 검사여야 하는 이유다.
 */

export type CheckStatus = 'pass' | 'warn' | 'fail'

export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
  pass: '통과',
  warn: '확인 필요',
  fail: '고쳐야 함',
}

export type DocCheck = {
  id: string
  label: string
  status: CheckStatus
  /** 무엇을 보고 그렇게 판정했는지 — 계산한 사실만 적는다 */
  detail: string
}

export type DocSection = {
  heading: string
  body: string
  /** 이 절이 어디서 왔는가. 빈 값이면 근거가 없는 것이다 */
  source: string
}

export type OutgoingDoc = {
  docNo: string
  title: string
  department: string
  /** 기간·일시. 문서 종류에 따라 '2026-07-01 ~ 07-05' 또는 '2026-07-28 14:00' */
  period: string
  sections: DocSection[]
  /** 사람이 채워야 하는 칸 — 자동 생성이 닿지 못한 곳 */
  pendingFields: string[]
  /** 보안등급 표기. 안 정했으면 null */
  securityGrade: string | null
}

/** 최소 이만큼은 있어야 문서라고 할 수 있다 */
export const MIN_SECTIONS = 3

/** 문서번호 체계 — 기관-부서-연도-일련번호 */
const DOC_NO = /^[A-Z]{2,6}-[가-힣A-Za-z]+-\d{4}-\d{2,4}$/

/**
 * 개인정보로 보이는 것.
 *
 * 완벽한 탐지가 아니라 **눈에 띄는 것만** 잡는다. 못 잡는 것이 있다는 사실을
 * 화면이 함께 말해야 한다 — 통과가 '개인정보 없음'으로 읽히면 그게 더 위험하다.
 */
const PHONE = /01[016-9][-\s]?\d{3,4}[-\s]?\d{4}/
const RRN = /\d{6}[-\s]?[1-4]\d{6}/

export function runChecks(doc: OutgoingDoc): DocCheck[] {
  const bodies = doc.sections.map((s) => s.body).join('\n')
  const noSource = doc.sections.filter((s) => s.source.trim() === '')
  const personal: string[] = []
  if (PHONE.test(bodies)) personal.push('휴대전화 번호로 보이는 문자열')
  if (RRN.test(bodies)) personal.push('주민등록번호로 보이는 문자열')

  return [
    {
      id: 'docNo',
      label: '문서번호 형식',
      status: DOC_NO.test(doc.docNo) ? 'pass' : 'fail',
      detail: DOC_NO.test(doc.docNo)
        ? `${doc.docNo} — 기관·부서·연도·일련번호 형식에 맞습니다`
        : `${doc.docNo || '(비어 있음)'} — 기관-부서-연도-일련번호 형식이 아닙니다`,
    },
    {
      id: 'department',
      label: '담당 부서 기재',
      status: doc.department.trim() === '' ? 'fail' : 'pass',
      detail: doc.department.trim() === '' ? '부서가 비어 있습니다' : `${doc.department}`,
    },
    {
      id: 'period',
      label: '기간·일시 명시',
      status: doc.period.trim() === '' ? 'fail' : 'pass',
      detail: doc.period.trim() === '' ? '기간이나 일시가 없습니다' : `${doc.period}`,
    },
    {
      id: 'sections',
      label: '내용 충실성',
      status: doc.sections.length >= MIN_SECTIONS ? 'pass' : 'warn',
      detail:
        doc.sections.length >= MIN_SECTIONS
          ? `${doc.sections.length}개 절`
          : `${doc.sections.length}개 절 — 최소 ${MIN_SECTIONS}개를 권합니다`,
    },
    {
      id: 'source',
      label: '절마다 출처',
      status: noSource.length === 0 ? 'pass' : 'fail',
      detail:
        noSource.length === 0
          ? '모든 절에 출처가 있습니다'
          : `출처 없는 절 ${noSource.length}개 — ${noSource.map((s) => s.heading).join(' · ')}`,
    },
    {
      id: 'pending',
      label: '사람이 채울 칸',
      status: doc.pendingFields.length === 0 ? 'pass' : 'warn',
      detail:
        doc.pendingFields.length === 0
          ? '비어 있는 칸이 없습니다'
          : `${doc.pendingFields.length}칸 남음 — ${doc.pendingFields.join(' · ')}`,
    },
    {
      id: 'personal',
      label: '개인정보 흔적',
      status: personal.length === 0 ? 'pass' : 'warn',
      detail:
        personal.length === 0
          ? '눈에 띄는 것은 없습니다 — 다 걸러 냈다는 뜻은 아닙니다'
          : `${personal.join(' · ')} 발견 — 내보내기 전에 가려야 합니다`,
    },
    {
      id: 'grade',
      label: '보안등급 표기',
      status: doc.securityGrade === null ? 'warn' : 'pass',
      detail:
        doc.securityGrade === null
          ? '등급이 없습니다 — 표기가 없으면 일반문서로 다뤄집니다'
          : `${doc.securityGrade}`,
    },
  ]
}

export const failed = (checks: DocCheck[]): DocCheck[] => checks.filter((c) => c.status === 'fail')
export const warned = (checks: DocCheck[]): DocCheck[] => checks.filter((c) => c.status === 'warn')

/** 결재에 올릴 수 있는가 — 고쳐야 할 것이 남아 있으면 못 올린다 */
export const canSubmit = (checks: DocCheck[]): boolean => failed(checks).length === 0

/**
 * 가져갈 수 있는 글로 만든다.
 *
 * 답변 복사와 같은 규율이다 — **출처와 'AI 초안'이라는 사실이 본문과 함께 나간다.**
 * 여기에 더해 점검에서 걸린 것도 붙인다. 받는 사람이 그것을 모르면
 * 점검을 한 의미가 화면 안에서 끝난다.
 */
export function documentAsText(doc: OutgoingDoc, checks: DocCheck[]): string {
  const lines: string[] = [doc.title, `문서번호 ${doc.docNo}`, `${doc.department} · ${doc.period}`]
  if (doc.securityGrade !== null) lines.push(`보안등급 ${doc.securityGrade}`)
  lines.push('')

  for (const s of doc.sections) {
    lines.push(`■ ${s.heading}`)
    lines.push(s.body)
    lines.push(`  (출처 · ${s.source})`)
    lines.push('')
  }

  if (doc.pendingFields.length > 0) {
    lines.push('■ 담당자 작성이 필요한 칸')
    for (const f of doc.pendingFields) lines.push(`- ${f}`)
    lines.push('')
  }

  const notPassed = [...failed(checks), ...warned(checks)]
  if (notPassed.length > 0) {
    lines.push('■ 자가점검에서 걸린 것')
    for (const c of notPassed) lines.push(`- [${CHECK_STATUS_LABEL[c.status]}] ${c.label} — ${c.detail}`)
    lines.push('')
  }

  lines.push('※ AI가 만든 초안입니다. 결재·대외 제출 전에 원본과 대조하십시오.')
  return lines.join('\n')
}

/** 파일 이름 — 문서번호가 곧 이름이다. 경로에 못 쓰는 글자만 바꾼다 */
export const fileNameOf = (doc: OutgoingDoc): string =>
  `${doc.docNo.replace(/[\\/:*?"<>|]/g, '_')}.txt`
