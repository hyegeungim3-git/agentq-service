/**
 * 보안 탭 — 데이터가 지금 어디서 처리되는지.
 *
 * 이전 데모의 보안 탭은 '보안 게이트웨이 / 구축형 LLM 전환' 설정 화면이었다.
 * 그건 아직 정해지지 않은 운영 정책이라 그대로 옮기지 않았다.
 * 대신 **지금 사실인 것만** 적는다. 정해지지 않은 것은 정해지지 않았다고 쓴다.
 *
 * 여기 적힌 문장은 전부 코드에 근거가 있다. 근거가 사라지면 문장도 지워야 한다.
 */

type Fact = {
  label: string
  value: string
  detail: string
  /** 지금 확정된 사실인가, 아직 정해지지 않은 것인가 */
  settled: boolean
}

const FACTS: Fact[] = [
  {
    label: '처리 위치',
    value: '이 브라우저 안',
    detail:
      '서버가 연결되어 있지 않습니다. 화면이 쓰는 모든 데이터는 앱에 포함된 예시 데이터이며 외부로 나가지 않습니다.',
    settled: true,
  },
  {
    label: '파일 업로드',
    value: '전송되지 않음',
    detail:
      '형식·용량 검사까지는 동작하지만 보낼 곳이 없어 실패로 끝납니다. 업로드한 파일은 어디에도 저장되지 않습니다.',
    settled: true,
  },
  {
    label: '개인정보 마스킹',
    value: '문서 인식에서 동작 (기본 켜짐)',
    detail:
      '성명·연락처를 가리고 무엇을 가렸는지 기록으로 남깁니다. 끄면 원문이 그대로 남고 화면이 그 사실을 경고합니다.',
    settled: true,
  },
  {
    label: '대화 기록',
    value: '이 브라우저에 저장',
    detail:
      '최근 대화는 이 브라우저에만 저장되며 서버로 가지 않습니다. 사이드바의 전체 지우기로 언제든 지울 수 있고, 대화 하나만 지울 수도 있습니다. 보관 기간 정책이 정해지기 전이라 지우는 방법을 함께 둡니다.',
    settled: true,
  },
  {
    label: '공지 읽음 표시',
    value: '이 브라우저에 저장',
    detail: '어떤 공지를 읽었는지만 남습니다. 내용이나 개인 정보는 저장하지 않습니다.',
    settled: true,
  },
  {
    label: '문서 접근 권한',
    value: '아직 정해지지 않음',
    detail:
      '지식 검색의 보안 등급 필터는 지금 화면에서 겁니다. 실제로는 서버가 걸러야 하며, 백엔드에 그렇게 요청해 두었습니다.',
    settled: false,
  },
  {
    label: '인증·감사 로그·보관 기간',
    value: '아직 정해지지 않음',
    detail:
      '누가 무엇을 조회했는지 남길 범위와 업로드본 보관 기간은 백엔드가 정할 사항입니다. 정해지기 전까지 이 화면은 비워 둡니다.',
    settled: false,
  },
]

export function SecurityPage() {
  const open = FACTS.filter((f) => !f.settled)

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-xl font-black text-slate-900">데이터 취급 현황</h1>
          <p className="mt-1 text-sm text-slate-600">
            지금 이 화면의 데이터가 어디서 처리되는지, 무엇이 아직 정해지지 않았는지 적습니다.
          </p>
        </header>

        {/* 정해지지 않은 것을 먼저 말한다 — 설정 화면처럼 보이면 다 정해진 줄 안다 */}
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-bold text-amber-900">
            {open.length}개 항목이 아직 정해지지 않았습니다.
          </p>
          <p className="mt-1 text-sm text-amber-900">
            보안 설정을 바꾸는 화면이 아닙니다. 서버가 연결되면 여기에 실제 정책이 들어옵니다.
          </p>
        </div>

        <ul className="space-y-3">
          {FACTS.map((f) => (
            <li key={f.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-slate-900">{f.label}</h2>
                {/* 색이 아니라 글자로 구분한다 */}
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    f.settled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {f.settled ? '확정' : '미정'}
                </span>
                <span className="ml-auto text-sm font-bold text-slate-700">{f.value}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.detail}</p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-slate-400">
          미정 항목의 배경은 API 제안서 3절(백엔드가 정해 주어야 하는 것)에 적혀 있습니다.
        </p>
      </div>
    </main>
  )
}
