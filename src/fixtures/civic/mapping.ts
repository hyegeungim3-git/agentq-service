/**
 * 행정(한성시청) 기준정보 표준화 자료.
 *
 * 여기서 표준화하는 것은 **광고물 위치**다. 신고서에 적힌 위치 표기가 제각각이라
 * 점검 대장과 대조하려면 도로명·행정동으로 맞춰야 한다 — 릴레이 시나리오의
 * 2단계가 이 일이다.
 *
 * ⚠️ **못 푸는 것을 남긴다.** 통합된 행정동, 지번만 있고 건물이 특정 안 되는 곳,
 * OCR 신뢰도가 낮은 줄. 되는 척하면 엉뚱한 위치에 계고장이 나간다.
 *
 * ⚠️ 태그 매핑 유형은 안 쓴다 — 설비 태그를 다루는 발주처가 아니다.
 */
import type { AddressCorpus } from '../address'

export const CIVIC_ADDRESS: AddressCorpus = {
  book: [
    {
      aliases: ['강변동 시장 사거리', '강변동 사거리', '한성시 강변동 대로 45'],
      roadAddress: '한성시 강변동 강변대로 45',
      jibunAddress: '한성시 강변동 112-3',
      postalCode: '18100',
      legalCode: '4111010100',
      buildingResolved: true,
      note: '옥외광고물 점검 대장 등록 위치와 일치',
    },
    {
      aliases: ['신흥동 역앞', '신흥동 상가', '한성시 신흥동 중앙로 12'],
      roadAddress: '한성시 신흥동 중앙로 12',
      jibunAddress: '한성시 신흥동 88-1',
      postalCode: '18122',
      legalCode: '4111010300',
      buildingResolved: true,
      note: '옥외광고물 점검 대장 등록 위치와 일치',
    },
    {
      aliases: ['송파동 먹자골목', '송파동 상가', '한성시 송파동'],
      roadAddress: '한성시 송파동 송파로 77',
      jibunAddress: '한성시 송파동 240',
      postalCode: '18140',
      /* 상가 건물이 여러 동이라 동·호가 없으면 특정되지 않는다 */
      buildingResolved: false,
      legalCode: '4111010500',
      note: '집합 상가 — 동·호 미기재',
    },
    {
      aliases: ['새들동 공원 입구', '새들동', '한성시 새들동 공원로'],
      roadAddress: '한성시 새들동 공원로 9',
      jibunAddress: '한성시 새들동 3-7',
      postalCode: '18155',
      legalCode: '4111010900',
      buildingResolved: false,
      note: '행정동 통합 대상 — 대장 갱신 전 표기와 섞여 있음',
    },
  ],
  ocrLines: [
    { text: '표시 위치: 한성시 강변동 강변대로 45', lineNo: 4, ocrConfidence: 0.95 },
    { text: '신고인 소재지: 한성시 신흥동 중앙로 12', lineNo: 8, ocrConfidence: 0.91 },
    /* 잘못 읽은 글자로 만든 '정상 주소'가 제일 위험하다 */
    { text: '설치 예정지: 한성시 송파동 송파로 7ㄱ', lineNo: 12, ocrConfidence: 0.58 },
  ],
  legalCodes: {
    '4111010100': {
      road: '한성시 강변동 강변대로 45',
      jibun: '한성시 강변동',
      superseded: null,
      note: '현행 코드',
    },
    '4111010300': {
      road: '한성시 신흥동 중앙로 12',
      jibun: '한성시 신흥동',
      superseded: null,
      note: '현행 코드',
    },
    '4111010500': {
      road: '한성시 송파동 송파로 77',
      jibun: '한성시 송파동',
      superseded: null,
      note: '현행 코드',
    },
    /* 조회는 되지만 그대로 쓰면 안 된다 — 행정동 통합으로 폐지됐다 */
    '4111010700': {
      road: '한성시 (구 하늘동)',
      jibun: '한성시 하늘동',
      superseded: '4111010900',
      note: '행정동 통합으로 폐지된 코드 — 새들동으로 이관',
    },
  },
  batchSample: [
    '강변동 시장 사거리',
    '신흥동 역앞',
    '송파동 먹자골목',
    '새들동 공원 입구',
    '한성시 물빛동 신설 상가 3블록',
    '1F, 21 Jurong East St 31, Singapore',
  ].join('\n'),
}
