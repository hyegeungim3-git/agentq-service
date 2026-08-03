import { describe, it, expect } from 'vitest'
import { hasFinalConsonant, objectParticle, subjectParticle, topicParticle, withSubject } from './korean'

describe('조사 선택', () => {
  it('받침이 있으면 이/은/을', () => {
    expect(subjectParticle('업무 문서')).toBe('가')
    expect(subjectParticle('사업장 지표')).toBe('가')
    expect(subjectParticle('알림')).toBe('이')
    expect(topicParticle('알림')).toBe('은')
    expect(objectParticle('알림')).toBe('을')
  })

  it('받침이 없으면 가/는/를', () => {
    expect(subjectParticle('시나리오')).toBe('가')
    expect(topicParticle('시나리오')).toBe('는')
    expect(objectParticle('시나리오')).toBe('를')
  })

  /* 잘못 붙이느니 무난한 쪽을 택한다 */
  it('한글이 아니면 판정하지 않고 기본형을 쓴다', () => {
    expect(hasFinalConsonant('RAG')).toBeNull()
    expect(subjectParticle('RAG')).toBe('가')
    expect(hasFinalConsonant('')).toBeNull()
  })

  it('붙여서 돌려준다', () => {
    expect(withSubject('업무 문서')).toBe('업무 문서가')
    expect(withSubject('조직 정보')).toBe('조직 정보가')
    expect(withSubject('알림')).toBe('알림이')
  })
})

/* 실제로 화면이 부르는 이름들 — 새 화면에서 같은 실수를 반복하지 않게 */
describe('화면에서 쓰는 이름', () => {
  it('에이전트 이름에 조사를 맞춘다', () => {
    expect(withSubject('데이터 분석')).toBe('데이터 분석이')
    expect(withSubject('안전관리계획 수립')).toBe('안전관리계획 수립이')
    expect(withSubject('업무 챗봇')).toBe('업무 챗봇이')
    expect(withSubject('문서 요약')).toBe('문서 요약이')
  })
})
