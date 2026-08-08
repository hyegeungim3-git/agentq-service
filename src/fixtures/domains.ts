/**
 * 도메인 fixture — 서버가 붙기 전까지 쓰는 예시 데이터.
 *
 * `Domain` 타입을 만족해야 하므로, 형태가 어긋나면 컴파일이 막는다.
 * 이전 데모에서는 팩 스키마 오작성(배열 자리에 문자열 등)이 런타임 크래시로만
 * 드러났다 — 그걸 타입으로 옮긴 것이 이 파일의 목적이다.
 *
 * 실제 API로 교체할 때 이 파일은 지우고 `shared/api`의 구현만 바꾼다.
 * 화면은 이 파일의 존재를 모른다.
 */
import type { Domain } from '@entities/domain/model'

/*
 * `status`는 **업무 데이터(팩)가 갖춰졌는가**를 말한다.
 * 플래그만 바꾸면 안 된다 — 팩이 없으면 다른 발주처의 문서가 그대로 노출된다.
 * 그래서 `fixtures/packs.ts`에 팩이 등록된 발주처만 'ready'다.
 * `scripts/pack-leak.test.ts`가 둘이 어긋나면 깨뜨린다.
 */
export const DOMAIN_FIXTURES: Domain[] = [
  {
    id: 'manufacturing',
    orgName: '한빛정밀',
    orgShort: 'HBP',
    sector: 'manufacturing',
    brandColor: '#0F766E',
    tagline: '스마트팩토리 생성형 AI 플랫폼',
    status: 'ready',
    statusNote: '시스템 정상 가동 중 · 로컬 LLM · 공장 OT망 분리 적용',
    features: [
      '설비 태그 데이터 표준화·AI 준비도 진단 (MES·SCADA)',
      '작업표준·검사성적서 검색과 자동 초안 작성',
      '공정조건 기반 품질 예측·최적 공정변수 도출',
      'MES 생산 데이터 자연어 조회·수출 문서 번역',
    ],
    footer: [
      '한빛정밀 스마트팩토리 AI 전환 사업 (MES·PLM 연계 데모)',
      '모든 데이터는 내부망에서만 처리되며 외부로 전송되지 않습니다.',
    ],
    docPrefix: 'HBP',
    user: { name: '박태윤', dept: '생산기술팀', title: '책임' },
  },
  {
    id: 'public',
    orgName: '한국부동산원',
    orgShort: 'REB',
    sector: 'public',
    brandColor: '#003087',
    tagline: '부동산 공시 업무 생성형 AI 플랫폼',
    status: 'ready',
    statusNote: '시스템 정상 가동 중 · 내부망 전용 · 공시 업무 데이터 연계',
    features: [
      '표준지공시지가 조사지침·업무 규정 근거 질의응답',
      '실거래 신고 이상거래 탐지와 검토 의견서 초안',
      '현장조사 기안문 사전 검토·부동산 규정 영문 번역',
      '지역별 공시가 변동률 조회와 주간 실적 보고서 작성',
    ],
    footer: [
      '한국부동산원 부동산 공시 업무 AI 전환 사업 (공시 데이터 연계 데모)',
      '모든 데이터는 내부망에서만 처리되며 외부로 전송되지 않습니다.',
    ],
    docPrefix: 'KREA',
    user: { name: '김민준', dept: '부동산공시처', title: '과장' },
  },
  {
    id: 'civic',
    orgName: '한성시청',
    orgShort: 'HSC',
    sector: 'civic',
    brandColor: '#166534',
    tagline: '스마트행정 생성형 AI 플랫폼',
    status: 'ready',
    statusNote: '시스템 정상 가동 중 · 행정망 분리 적용 · 재난 상황 연계',
    features: [
      '민원 접수 내용 요약·유사 사례 검색과 회신 초안',
      '조례·행정규칙 근거 조회와 공문 사전 검토',
      '호우·재난 상황보고 자동 작성 (NDMS 연계)',
      '행정동별 민원 추이 조회·외국인 민원 번역',
    ],
    footer: [
      '한성시청 스마트행정 AI 전환 사업 (민원·재난 시스템 연계 데모)',
      '모든 데이터는 행정망에서만 처리되며 외부로 전송되지 않습니다.',
    ],
    docPrefix: 'HSC',
    user: { name: '이서연', dept: '민원여권과', title: '주무관' },
  },
  {
    id: 'medical',
    orgName: '새빛대학교병원',
    orgShort: 'SUH',
    sector: 'medical',
    brandColor: '#7C3AED',
    tagline: '의료 업무 생성형 AI 플랫폼',
    status: 'ready',
    statusNote: '시스템 정상 가동 중 · 원내망 전용 · 환자정보 비식별 처리',
    features: [
      '청구 건 삭감 위험 사전 점검과 소명 자료 정리',
      '진료 지침·원내 규정 근거 조회와 문서 사전 검토',
      '응급의료센터 포화 상황 보고 자동 작성',
      '센터별 진료 지표 조회·의무기록 요약',
    ],
    footer: [
      '새빛대학교병원 의료 업무 AI 전환 사업 (EMR 연계 데모)',
      '모든 데이터는 원내망에서만 처리되며 외부로 전송되지 않습니다.',
    ],
    docPrefix: 'SUH',
    user: { name: '서지은', dept: '적정진료관리실', title: '대리' },
  },
]
