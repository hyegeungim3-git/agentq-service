import { AGENTS } from '@entities/agent/model'

/**
 * 사용 가이드.
 *
 * 이전 데모에는 헤더에 아이콘만 있고 내용이 없었다.
 * 내용을 만들되 **무엇을 못 하는지**를 같은 비중으로 적는다 —
 * 할 수 있는 것만 적은 가이드는 결국 사용자가 틀린 기대를 갖게 한다.
 */

const CANNOT = [
  {
    title: '올린 파일을 처리하지 못합니다',
    detail:
      '형식·용량 검사까지는 되지만 서버가 연결되어 있지 않아 전송이 실패합니다. 지금은 미리 준비된 문서로만 실행할 수 있습니다.',
  },
  {
    title: '사전에 없는 문장은 번역하지 않습니다',
    detail:
      '직접 입력한 임의 문장은 번역 엔진이 붙어야 처리됩니다. 못 한 문장은 그렇다고 표시합니다.',
  },
  {
    title: '근거가 없으면 답하지 않습니다',
    detail:
      '챗봇과 규정 조회는 사내 문서에서 근거를 찾지 못하면 지어내지 않고 모른다고 답합니다.',
  },
  {
    title: '수치는 초안입니다',
    detail:
      '보고서·분석·조회 결과는 AI가 만든 초안입니다. 결재나 대외 제출 전에 원본과 대조하십시오.',
  },
]

const HOW = [
  ['일반 탭', '사내 규정·작업표준을 근거와 함께 묻습니다. 근거를 눌러 원문을 볼 수 있습니다.'],
  ['에이전트 탭', '업무별 에이전트 13종과, 여러 에이전트를 잇는 복합 업무 릴레이가 있습니다.'],
  ['보안 탭', '지금 데이터가 어디서 처리되는지, 무엇이 아직 정해지지 않았는지 적혀 있습니다.'],
  ['워크스페이스', '대화를 업무 단위로 나눕니다. 바꾸면 그 방의 대화만 보입니다.'],
]

export function GuidePage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-xl font-black text-slate-900">사용 가이드</h1>
          <p className="mt-1 text-sm text-slate-600">
            무엇을 할 수 있고 무엇을 못 하는지 함께 적었습니다.
          </p>
        </header>

        <section aria-labelledby="g-how" className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 id="g-how" className="text-sm font-black text-slate-900">
            화면 구성
          </h2>
          <dl className="mt-3 space-y-2">
            {HOW.map(([k, v]) => (
              <div key={k}>
                <dt className="text-sm font-bold text-slate-800">{k}</dt>
                <dd className="text-sm text-slate-600">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="g-agents" className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <h2 id="g-agents" className="text-sm font-black text-slate-900">
            에이전트 {AGENTS.length}종
          </h2>
          <ul className="mt-3 space-y-1.5">
            {AGENTS.map((a) => (
              <li key={a.id} className="text-sm">
                <span className="font-bold text-slate-800">{a.name}</span>
                <span className="text-slate-600"> — {a.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 할 수 있는 것만 적은 가이드는 틀린 기대를 만든다 */}
        <section aria-labelledby="g-cannot" className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 id="g-cannot" className="text-sm font-black text-amber-900">
            지금 못 하는 것
          </h2>
          <ul className="mt-3 space-y-3">
            {CANNOT.map((c) => (
              <li key={c.title}>
                <p className="text-sm font-bold text-amber-900">{c.title}</p>
                <p className="text-sm text-amber-900">{c.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
