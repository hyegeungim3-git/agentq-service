/**
 * 행정(한성시청) 에이전트 운영 실적.
 *
 * `areaIds`는 **이 팩의 지식 영역**을 가리킨다. 그래야 '기대는 영역에 못 찾는
 * 문서가 있다'는 판정이 성립한다.
 *
 * 재난·안전 영역에 못 찾는 문서가 있어 그 영역에 기대는 에이전트의 실패율이
 * 높다 — 호우 대비가 이 팩의 세계관인데 하필 그 자료다.
 */
import type { AgentOps } from '@entities/agentops/model'

const GPT = { modelId: 'm-gpt-oss', modelName: 'GPT-OSS-120B' }
const LLAMA = { modelId: 'm-llama-kor', modelName: 'Llama-3-Kor-Instruct' }

export const CIVIC_AGENT_OPS: AgentOps[] = [
  { agentId: 'address', ...LLAMA, areaIds: ['k-hsc-civil'], runs7d: 62, failed7d: 4, owner: '이서연 팀장', exposed: true },
  { agentId: 'translate', ...LLAMA, areaIds: [], runs7d: 58, failed7d: 3, owner: '이서연 팀장', exposed: true },
  { agentId: 'summary', ...GPT, areaIds: ['k-hsc-rule'], runs7d: 142, failed7d: 4, owner: '이서연 팀장', exposed: true },
  { agentId: 'review', ...GPT, areaIds: ['k-hsc-rule'], runs7d: 174, failed7d: 6, owner: '이서연 팀장', exposed: true },
  { agentId: 'chatbot', ...GPT, areaIds: ['k-hsc-rule', 'k-hsc-civil', 'k-hsc-safety'], runs7d: 812, failed7d: 33, owner: '오현석 팀장', exposed: true },
  { agentId: 'report', ...GPT, areaIds: ['k-hsc-civil', 'k-hsc-safety'], runs7d: 108, failed7d: 7, owner: '오현석 팀장', exposed: true },
  { agentId: 'meeting', ...GPT, areaIds: [], runs7d: 38, failed7d: 1, owner: '배수진 주무관', exposed: true },
  { agentId: 'knowledge', ...GPT, areaIds: ['k-hsc-civil', 'k-hsc-ad'], runs7d: 196, failed7d: 3, owner: '이서연 팀장', exposed: true },
  { agentId: 'internalreg', ...LLAMA, areaIds: ['k-hsc-rule'], runs7d: 131, failed7d: 5, owner: '배수진 주무관', exposed: true },
  { agentId: 'ocr', ...GPT, areaIds: [], runs7d: 124, failed7d: 8, owner: '이서연 팀장', exposed: true },
  { agentId: 'dbquery', ...GPT, areaIds: ['k-hsc-civil'], runs7d: 91, failed7d: 3, owner: '장민호 주무관', exposed: true },
  { agentId: 'dataanalysis', ...GPT, areaIds: ['k-hsc-civil'], runs7d: 44, failed7d: 6, owner: '장민호 주무관', exposed: true },
  /* 재난·안전 영역에 못 찾는 문서 8건 — 실패율이 가장 높은 이유 */
  { agentId: 'safety', ...GPT, areaIds: ['k-hsc-safety'], runs7d: 26, failed7d: 7, owner: '오현석 팀장', exposed: true },
]
