import { describe, it, expect } from 'vitest'
import { DOMAIN_FIXTURES } from './domains'
import { PACKED_DOMAIN_IDS, packOf } from './packs'

/**
 * 발주처를 골랐을 때 **다른 발주처의 데이터가 나오지 않는지.**
 *
 * 이전 데모의 사고가 정확히 이것이었다 — 공공을 골라도 제조 문서
 * (`프레스_작업표준서_SOP-PR-011.pdf`)가 그대로 떴다. 플래그만 바꿨기 때문이다.
 *
 * `scripts/`가 아니라 여기 있는 이유: 저장소 파일이 아니라 **앱 데이터**를 본다.
 *
 * 그래서 두 가지를 기계로 지킨다.
 *  ① 'ready'인 발주처는 팩이 반드시 있다
 *  ② 팩 안에 다른 발주처의 말이 한 글자도 없다
 */

/**
 * 그 발주처에만 있어야 하는 말 — 넘어가면 누수다.
 *
 * ⚠️ **업무 용어는 도메인 사이에 공유된다.** 네 번째 팩을 넣을 때 '청구'가 제조의
 * 여비 정산에도, '이의신청'이 공시와 심사 양쪽에 있어 오탐이 났다.
 * 마커는 그 발주처에서만 쓰는 **좁은 말**로 고른다 — 넓게 잡으면 검사가
 * '늑대야'를 외치고, 그러면 사람이 검사를 끄게 된다.
 */
const MARKERS: Record<string, string[]> = {
  manufacturing: [
    '프레스',
    '금형',
    '침탄로',
    '한빛정밀',
    'SOP-PR-011',
    'PRS-C03',
    /* 에이전트 정의가 팩으로 들어오면서 추가한 것 — 병원 허브에 떠 있던 말들이다 */
    'MES',
    '생산기술팀',
    '설비보전팀',
  ],
  public: ['표준지', '공시지가', '한국부동산원', 'RTMS', '실거래', '괴리율'],
  civic: ['민원', '옥외광고', '행정동', '한성시', '강변동', '계고'],
  medical: ['삭감', '병상', '진료과', '요양급여', '응급의료센터', '새빛'],
}

const textOf = (id: string): string => JSON.stringify(packOf(id))

describe('발주처 팩 누수', () => {
  it("'ready'인 발주처에는 업무 데이터가 있다", () => {
    const ready = DOMAIN_FIXTURES.filter((d) => d.status === 'ready').map((d) => d.id)
    const missing = ready.filter((id) => !PACKED_DOMAIN_IDS.includes(id))
    expect(missing, '팩 없이 열려 있는 발주처 — 다른 발주처 데이터가 노출된다').toEqual([])
  })

  it('팩이 없는 발주처는 열려 있지 않다', () => {
    const opened = new Set(DOMAIN_FIXTURES.filter((d) => d.status === 'ready').map((d) => d.id))
    const dangling = PACKED_DOMAIN_IDS.filter((id) => !opened.has(id))
    expect(dangling, '팩은 있는데 못 고르는 발주처 — 만들어 두고 안 연 것이다').toEqual([])
  })

  it('한 발주처의 팩에 다른 발주처의 말이 없다', () => {
    const leaks: string[] = []
    for (const id of PACKED_DOMAIN_IDS) {
      const text = textOf(id)
      for (const [other, words] of Object.entries(MARKERS)) {
        if (other === id) continue
        for (const w of words) {
          if (text.includes(w)) leaks.push(`${id} 팩에 ${other}의 말 '${w}'`)
        }
      }
    }
    expect(leaks).toEqual([])
  })

  /**
   * 정의가 팩으로 들어온 뒤 생긴 짝 맞춤.
   *
   * 도입 안 한 에이전트의 정의가 들어 있으면 허브가 **못 쓰는 카드에 단계를**
   * 그린다. 반대로 도입했는데 정의가 없으면 카드가 이름만 남는다.
   */
  it('에이전트 정의는 그 발주처가 도입한 것만 다룬다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      const defIds = pack.agentDefs.map((d) => d.agentId)
      expect(defIds.filter((x) => !pack.agents.includes(x)), `${id}: 도입 전인데 정의가 있다`).toEqual(
        [],
      )
      expect(
        pack.agents.filter((x) => !defIds.includes(x)),
        `${id}: 도입했는데 정의가 없다 — 카드가 이름만 남는다`,
      ).toEqual([])
    }
  })

  /**
   * 도구도 팩으로 들어왔다. **정의와 도구가 같은 팩 안에서 짝이 맞아야** 한다.
   *
   * 안 맞으면 화면이 도구 이름 대신 `t-mes` 같은 날 id를 그린다 —
   * 오류는 안 나고 화면만 이상해져서 늦게 발견된다.
   */
  it('정의가 부르는 도구가 그 팩에 있다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      const have = new Set(pack.tools.map((t) => t.id))
      const dangling = pack.agentDefs.flatMap((d) =>
        d.steps.flatMap((s) => s.toolIds.filter((t) => !have.has(t))),
      )
      expect([...new Set(dangling)], `${id}: 팩에 없는 도구를 부른다`).toEqual([])
    }
  })

  it('서버가 주는 도구도 그 팩에 있다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      const have = new Set(pack.tools.map((t) => t.id))
      const dangling = pack.mcpServers.flatMap((sv) => sv.toolIds.filter((t) => !have.has(t)))
      expect([...new Set(dangling)], `${id}: 팩에 없는 도구를 주는 서버가 있다`).toEqual([])
    }
  })

  /**
   * 지식 영역도 팩으로 들어왔다. **색인 항목과 운영 실적이 같은 팩의 영역을
   * 가리켜야** 한다.
   *
   * 안 맞으면 '기대는 영역에 못 찾는 문서가 있다'는 판정이 조용히 빈 값이 되고,
   * 화면은 '빈틈 없음'이라고 말한다 — 틀린 안심을 준다.
   */
  it('색인 항목과 운영 실적이 그 팩의 지식 영역을 가리킨다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      const have = new Set(pack.knowledgeAreas.map((a) => a.id))
      expect(
        [...new Set(pack.indexEntries.map((e) => e.areaId).filter((x) => !have.has(x)))],
        `${id}: 없는 영역의 색인 항목`,
      ).toEqual([])
      expect(
        [...new Set(pack.agentOps.flatMap((o) => o.areaIds).filter((x) => !have.has(x)))],
        `${id}: 없는 영역에 기대는 에이전트`,
      ).toEqual([])
    }
  })

  /* 운영 실적도 도입한 것만 있어야 한다 — 안 산 에이전트가 돌 리 없다 */
  it('운영 실적은 도입한 에이전트만 다룬다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      const extra = pack.agentOps.map((o) => o.agentId).filter((x) => !pack.agents.includes(x))
      expect(extra, `${id}: 도입 전인데 실적이 있다`).toEqual([])
    }
  })

  /**
   * 릴레이가 **실제로 돌 수 있는가.**
   *
   * 소개(`scenario`)만 있고 실행 설정(`relay`)이 없으면 눌러도 아무 일 없는
   * 버튼이 된다. 부르는 문서·조회 소스가 그 팩에 없어도 마찬가지다 —
   * 릴레이가 중간에 실패하고, 사용자는 눌러 봐야 안다.
   */
  it('릴레이는 소개와 실행 설정이 함께 있고 그 팩의 것을 부른다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const pack = packOf(id)
      if (!pack) throw new Error(`${id} 팩이 없다`)
      expect(Boolean(pack.scenario), `${id}: 소개와 실행 설정이 짝이 아니다`).toBe(
        Boolean(pack.relay),
      )
      if (!pack.relay) continue

      const docs = pack.documents.map((d) => d.id)
      expect(docs, `${id}: 릴레이가 부르는 인식 대상 문서가 팩에 없다`).toContain(
        pack.relay.ocr.documentId,
      )
      expect(docs, `${id}: 릴레이가 부르는 보고서 대상 문서가 팩에 없다`).toContain(
        pack.relay.report.documentId,
      )
      expect(
        pack.querySources.map((s) => s.code),
        `${id}: 릴레이가 부르는 조회 소스가 팩에 없다`,
      ).toContain(pack.relay.query.source)
      expect(pack.mapping.modes, `${id}: 릴레이가 안 쓰는 처리 유형을 부른다`).toContain(
        pack.relay.mapping.mode,
      )
      /* 릴레이가 부르는 에이전트를 안 샀으면 거기서 멈춘다 */
      for (const st of pack.relay.scenario.steps) {
        expect(pack.agents, `${id}: 릴레이가 도입 안 한 ${st.agentId}를 부른다`).toContain(
          st.agentId,
        )
      }
    }
  })

  /* 표시만 있고 내용이 없으면 화면이 빈칸을 그린다 */
  it('팩마다 자기 말이 실제로 들어 있다', () => {
    for (const id of PACKED_DOMAIN_IDS) {
      const text = textOf(id)
      const own = MARKERS[id] ?? []
      expect(own.length, `${id}의 판정 기준이 없다`).toBeGreaterThan(0)
      const found = own.filter((w) => text.includes(w))
      expect(found.length, `${id} 팩이 자기 말을 안 쓴다`).toBeGreaterThan(own.length / 2)
    }
  })
})
