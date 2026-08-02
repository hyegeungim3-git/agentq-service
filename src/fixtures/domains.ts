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
 * status가 'ready'인 발주처는 지금 한 곳뿐이다.
 * 에이전트 13종이 쓰는 문서·용어·수치 fixture가 전부 한빛정밀(제조) 기준이기 때문이다.
 * 나머지 세 곳을 'ready'로 바꾸려면 각 발주처의 업무 데이터를 먼저 만들어야 한다 —
 * 플래그만 바꾸면 제조 데이터가 그대로 노출된다.
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
    status: 'planned',
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
    status: 'planned',
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
    status: 'planned',
    docPrefix: 'SUH',
    user: { name: '서지은', dept: '적정진료관리실', title: '대리' },
  },
]
