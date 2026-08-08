/**
 * 보안 아키텍처 fixture.
 *
 * 세계관은 한빛정밀이다. 흐름은 다른 화면과 이어진다 — 문서 RAG 검색, OCR 처리,
 * 플래그십 모델 질의(보안 게이트웨이 경유), 외부 공개자료 수집.
 *
 * **경계를 안 넘는 흐름도 넣었다.** 전부 넘으면 '넘는 것만 센다'가 의미를 잃는다.
 *
 * **만료됐는데 아직 목록에 있는 외부 접근을 넣었다.** 이것이 이 화면에서 실제로
 * 위험한 것이다 — 목록에 있으니 살아 있다고 믿는데, 기준일로 재면 이미 지났다.
 * 2단계 인증이 없는 것도 하나 뒀다.
 */
import type { BoundaryRule, DataFlow, ExternalAccess } from '@entities/secarch/model'

export const DATA_FLOWS: DataFlow[] = [
  {
    id: 'df-1',
    name: '사내 문서 근거 검색(RAG)',
    from: '업무망 파일서버',
    processedAt: '내부 GPU 서버',
    to: '내부망 사용자',
    crossesBoundary: false,
    grade: 'internal',
    volume: '일 12,400건',
    protection: '전송 TLS 1.3 · 저장 AES-256',
  },
  {
    id: 'df-2',
    name: '검사성적서 문서 인식(OCR)',
    from: '스캔 문서 업로드',
    processedAt: '내부 OCR 엔진',
    to: '내부 스토리지',
    crossesBoundary: false,
    grade: 'internal',
    volume: '일 286건',
    protection: '전송 TLS 1.3 · 저장 AES-256',
  },
  {
    id: 'df-3',
    name: '플래그십 모델 질의(게이트웨이 경유)',
    from: '사용자 질의',
    processedAt: '외부 상용 LLM',
    to: '내부망 사용자',
    crossesBoundary: true,
    grade: 'public',
    volume: '일 840건',
    protection: '전송 TLS 1.3 · 민감정보 마스킹 후 전송',
  },
  {
    id: 'df-4',
    name: '외부 공개자료 수집',
    from: '인터넷 공개 사이트',
    processedAt: 'DMZ 수집 서버',
    to: '내부 지식베이스',
    crossesBoundary: true,
    grade: 'public',
    volume: '주 1회 배치',
    protection: '단방향 반입(내부에서 외부로 요청하지 않음)',
  },
  {
    /* 정책상 게이트웨이 경유가 차단인 등급인데 실제로 넘고 있다 — 화면이 이것을 찾아낸다 */
    id: 'df-5',
    name: '작업표준 번역 의뢰(수출 대응)',
    from: '작업표준 문서',
    processedAt: '외부 번역 모델',
    to: '내부망 사용자',
    crossesBoundary: true,
    grade: 'restricted',
    volume: '주 12건',
    protection: '전송 TLS 1.3 · 마스킹 없음',
  },
]

/**
 * 등급별 경계 정책.
 *
 * ⚠️ 정책이지 실제 통제가 아니다. 화면은 '이렇게 막기로 돼 있다'까지만 말한다.
 */
export const BOUNDARY_RULES: BoundaryRule[] = [
  { grade: 'confidential', internal: 'allow', gateway: 'block', external: 'block', note: '내부 GPU에서만 처리합니다. 외부 모델 경유 자체를 막기로 돼 있습니다' },
  { grade: 'restricted', internal: 'allow', gateway: 'block', external: 'block', note: '마스킹과 승인 이력이 갖춰지기 전까지는 경유를 막기로 돼 있습니다' },
  { grade: 'internal', internal: 'allow', gateway: 'conditional', external: 'block', note: '마스킹 후에만 경유하고, 외부 직접 전송은 막기로 돼 있습니다' },
  { grade: 'public', internal: 'allow', gateway: 'allow', external: 'allow', note: '제한이 없습니다' },
]

export const EXTERNAL_ACCESS: ExternalAccess[] = [
  { id: 'ex-1', org: '협력사 대성정공', scope: '납품 이력 조회', grade: 'internal', expiresOn: '2026-12-31', mfa: true, lastAccessAt: '2026-07-31 10:22' },
  { id: 'ex-2', org: '협력사 한울금속', scope: '검사성적서 제출', grade: 'internal', expiresOn: '2026-10-31', mfa: true, lastAccessAt: '2026-07-30 16:40' },
  { id: 'ex-3', org: '외부 품질 컨설팅', scope: '집계 통계 열람(원본 불가)', grade: 'public', expiresOn: '2026-09-30', mfa: false, lastAccessAt: '2026-07-28 09:12' },
  { id: 'ex-4', org: '협력사 명진테크', scope: '납품 이력 조회', grade: 'internal', expiresOn: '2026-06-30', mfa: true, lastAccessAt: '2026-06-27 14:05' },
]
