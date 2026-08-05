/**
 * 공공(한국부동산원) 기준정보 표준화 자료.
 *
 * 여기서 표준화하는 것은 **필지 소재지**다. 이의신청서에 적힌 소재지 표기가
 * 제각각이라 조사 대장과 대조하려면 지번·법정동코드로 맞춰야 한다 —
 * 릴레이 시나리오의 2단계가 이 일이다.
 *
 * ⚠️ **못 푸는 것을 남긴다.** 대장에 없는 필지, 행정구역 개편으로 폐지된 코드,
 * OCR 신뢰도가 낮은 줄. 되는 척하면 잘못된 소재지가 대장에 들어가고
 * 그건 나중에 사람이 못 찾는다.
 *
 * ⚠️ 태그 매핑 유형은 안 쓴다 — 설비 태그를 다루는 발주처가 아니다.
 */
import type { AddressCorpus } from '../address'

export const PUBLIC_ADDRESS: AddressCorpus = {
  book: [
    {
      aliases: ['강남구 역삼동 737', '역삼동 737', '서울 강남 역삼 737'],
      roadAddress: '서울특별시 강남구 테헤란로 152',
      jibunAddress: '서울특별시 강남구 역삼동 737',
      postalCode: '06236',
      legalCode: '1168010100',
      buildingResolved: true,
      note: '표준지 조사 대장 등록 필지와 일치',
    },
    {
      aliases: ['서초구 서초동 1303', '서초동 1303', '서울 서초 1303'],
      roadAddress: '서울특별시 서초구 서초대로 396',
      jibunAddress: '서울특별시 서초구 서초동 1303-22',
      postalCode: '06619',
      legalCode: '1165010800',
      buildingResolved: true,
      note: '표준지 조사 대장 등록 필지와 일치',
    },
    {
      aliases: ['해운대구 우동', '부산 해운대 우동', '우동 1500'],
      roadAddress: '부산광역시 해운대구 센텀중앙로 90',
      jibunAddress: '부산광역시 해운대구 우동 1500',
      /* 같은 지번에 집합건물이 여러 동이라 동·호가 없으면 특정되지 않는다 */
      buildingResolved: false,
      postalCode: '48058',
      legalCode: '2635010300',
      note: '집합건물 — 동·호 미기재',
    },
    {
      aliases: ['수성구 범어동', '대구 수성 범어', '범어동 177'],
      roadAddress: '대구광역시 수성구 동대구로 333',
      jibunAddress: '대구광역시 수성구 범어동 177-1',
      postalCode: '42169',
      legalCode: '2726010100',
      buildingResolved: false,
      note: '이의신청 접수 필지 — 지번 가지번호 확인 필요',
    },
  ],
  ocrLines: [
    { text: '소재지: 서울특별시 강남구 역삼동 737', lineNo: 3, ocrConfidence: 0.96 },
    { text: '신청인 주소: 서울 서초구 서초동 1303-22', lineNo: 7, ocrConfidence: 0.93 },
    /* 잘못 읽은 글자로 만든 '정상 주소'가 제일 위험하다 */
    { text: '대상 필지: 부산 해운대구 우동 15OO', lineNo: 11, ocrConfidence: 0.61 },
  ],
  legalCodes: {
    '1168010100': {
      road: '서울특별시 강남구 테헤란로 152',
      jibun: '서울특별시 강남구 역삼동',
      superseded: null,
      note: '현행 코드',
    },
    '1165010800': {
      road: '서울특별시 서초구 서초대로 396',
      jibun: '서울특별시 서초구 서초동',
      superseded: null,
      note: '현행 코드',
    },
    '2635010300': {
      road: '부산광역시 해운대구 센텀중앙로 90',
      jibun: '부산광역시 해운대구 우동',
      superseded: null,
      note: '현행 코드',
    },
    /* 조회는 되지만 그대로 쓰면 안 된다 — 실제 대장에는 반드시 있다 */
    '4812110100': {
      road: '경상남도 창원시 의창구 (구 창원시 중앙동)',
      jibun: '경상남도 창원시 의창구 중앙동',
      superseded: '4812110200',
      note: '행정구역 개편으로 폐지된 코드',
    },
  },
  batchSample: [
    '강남구 역삼동 737',
    '서초구 서초동 1303',
    '부산 해운대구 우동',
    '대구 수성구 범어동 177',
    '전남 무안군 삼향읍 오룡지구 3-2블록',
    '1F, 21 Jurong East St 31, Singapore',
  ].join('\n'),
}
