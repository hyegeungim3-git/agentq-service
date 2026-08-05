/**
 * 공공(한국부동산원) 문서 요약.
 *
 * 제조 팩과 같은 규칙이다 — **방식을 바꾸면 결과가 달라져야 한다.**
 * 무엇을 골라도 같은 결과가 나오면 시연에서 바로 들킨다.
 *
 * 제조 팩이 4종 문서 중 2종만 다루는 것과 같은 범위로 뒀다. 나머지는 경계가
 * '요약할 문서를 찾지 못했습니다'로 정직하게 답한다 — 없는 것을 지어내지 않는다.
 */
import type { SummaryResult, SummaryStyle } from '@entities/summary/model'

export const PUBLIC_SUMMARIES: Record<string, Record<SummaryStyle, SummaryResult>> = {
  'doc-reb-guide': {
    brief: {
      documentId: 'doc-reb-guide',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '전국 표준지 56만 필지의 조사·평가 절차를 규정한 지침이다. 현장조사에서 이용상황 변동 사유를 반드시 기재하도록 한 것과, 이의신청을 접수일부터 30일 이내에 처리하도록 정한 것이 핵심 통제점이다.',
        },
      ],
      keywords: [
        { word: '이용상황 변동 사유', weight: 0.95 },
        { word: '이의신청 30일', weight: 0.89 },
        { word: '가격 균형 협의', weight: 0.81 },
        { word: '검증·심의', weight: 0.7 },
        { word: '표준지 56만 필지', weight: 0.62 },
      ],
      stats: { sourceChars: 704, summaryChars: 122, sectionCount: 1, elapsedSeconds: 6.8 },
    },
    detailed: {
      documentId: 'doc-reb-guide',
      style: 'detailed',
      sections: [
        { heading: '적용 범위', body: '부동산 가격공시에 관한 법률 제3조에 따른 표준지 공시지가 조사·평가 업무. 전국 56만 필지가 대상이며 조사자와 검증자의 업무 범위를 구분한다.' },
        { heading: '현장조사 절차', body: '이용상황·도로조건·형상·지세를 현장에서 확인해 조사표에 기록한다. 직전 연도와 이용상황이 달라졌으면 변동 사유를 반드시 적으며, 사유가 없으면 검증에서 반려한다.' },
        { heading: '가격 균형 협의', body: '경계로부터 500미터 이내 표준지가 협의 대상이다. 변동률 차이가 3%포인트를 넘으면 협의 조서를 작성한다.' },
        { heading: '검증 및 심의', body: '검증자가 지역 분석 자료와 대조하고, 시·군·구 부동산가격공시위원회 심의를 거쳐 확정한다. 결과는 조사자에게 회신한다.' },
        { heading: '이의신청 처리', body: '공시 후 30일 이내 접수, 접수일부터 30일 이내 처리·서면 통지. 가격 조정이 필요하면 재조사 후 위원회 재심의를 거친다.' },
      ],
      keywords: [
        { word: '이용상황 변동 사유', weight: 0.95 },
        { word: '이의신청 30일', weight: 0.89 },
        { word: '가격 균형 협의', weight: 0.81 },
        { word: '위원회 심의', weight: 0.73 },
        { word: '조사자·검증자', weight: 0.66 },
      ],
      stats: { sourceChars: 704, summaryChars: 421, sectionCount: 5, elapsedSeconds: 8.4 },
    },
    bullet: {
      documentId: 'doc-reb-guide',
      style: 'bullet',
      sections: [
        { heading: '대상', body: '전국 표준지 56만 필지 · 조사자와 검증자 업무 분리' },
        { heading: '현장조사', body: '이용상황·도로조건·형상·지세 확인 → 조사표 기록' },
        { heading: '반려 사유', body: '이용상황이 바뀌었는데 변동 사유가 없으면 검증에서 반려' },
        { heading: '협의 기준', body: '경계 500m 이내 · 변동률 차이 3%p 초과 시 협의 조서' },
        { heading: '이의신청', body: '공시 후 30일 접수 · 접수일부터 30일 처리 · 서면 통지' },
      ],
      keywords: [
        { word: '조사표', weight: 0.9 },
        { word: '반려', weight: 0.84 },
        { word: '협의 조서', weight: 0.76 },
        { word: '재심의', weight: 0.64 },
      ],
      stats: { sourceChars: 704, summaryChars: 198, sectionCount: 5, elapsedSeconds: 7.1 },
    },
    table: {
      documentId: 'doc-reb-guide',
      style: 'table',
      sections: [
        { heading: '단계 | 하는 일 | 기한·기준', body: '현장조사 | 이용상황·도로조건 확인, 조사표 기록 | 조사표 제출 4월 5일' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '가격 균형 협의 | 경계 표준지 협의 조서 작성 | 경계 500m·차이 3%p' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '검증·심의 | 지역 분석 대조 후 위원회 심의 | 심의 결과 조사자 회신' },
        { heading: '단계 | 하는 일 | 기한·기준', body: '이의신청 | 접수·재조사·재심의 | 접수일부터 30일' },
      ],
      keywords: [
        { word: '기한', weight: 0.92 },
        { word: '조사표', weight: 0.85 },
        { word: '협의', weight: 0.74 },
      ],
      stats: { sourceChars: 704, summaryChars: 236, sectionCount: 4, elapsedSeconds: 7.6 },
    },
  },

  'doc-reb-market': {
    brief: {
      documentId: 'doc-reb-market',
      style: 'brief',
      sections: [
        {
          heading: '핵심',
          body: '2026년 1분기 전국 표준지 공시지가 변동률은 3.24%로 전년 대비 0.41%포인트 올랐다. 실거래 신고 1,842건 중 8건이 정밀조사 대상이며, 직전 공시분 이의신청 342건 중 18건이 미처리 상태다.',
        },
      ],
      keywords: [
        { word: '변동률 3.24%', weight: 0.94 },
        { word: '의심 거래 8건', weight: 0.87 },
        { word: '미처리 18건', weight: 0.82 },
        { word: '세종 5.12%', weight: 0.68 },
      ],
      stats: { sourceChars: 468, summaryChars: 124, sectionCount: 1, elapsedSeconds: 5.9 },
    },
    detailed: {
      documentId: 'doc-reb-market',
      style: 'detailed',
      sections: [
        { heading: '개요', body: '전국 17개 시·도의 주택 매매·전세 가격과 실거래 신고 동향을 조사했다.' },
        { heading: '주요 지표', body: '표준지 공시지가 변동률 3.24%(전년 대비 +0.41%p). 최고 세종 5.12%, 최저 제주 1.08%.' },
        { heading: '실거래 신고', body: '1분기 신고 1,842건 중 시세 괴리가 큰 8건을 거래신고법 제6조에 따른 정밀조사 대상으로 분류했다.' },
        { heading: '이의신청', body: '직전 공시분 이의신청 342건 접수, 324건 처리. 미처리 18건은 재조사 중이며 기한은 4월 12일이다.' },
      ],
      keywords: [
        { word: '변동률 3.24%', weight: 0.94 },
        { word: '의심 거래 8건', weight: 0.87 },
        { word: '미처리 18건', weight: 0.82 },
        { word: '정밀조사', weight: 0.71 },
        { word: '제주 1.08%', weight: 0.6 },
      ],
      stats: { sourceChars: 468, summaryChars: 312, sectionCount: 4, elapsedSeconds: 7.3 },
    },
    bullet: {
      documentId: 'doc-reb-market',
      style: 'bullet',
      sections: [
        { heading: '변동률', body: '전국 3.24% (+0.41%p) · 세종 5.12% 최고 · 제주 1.08% 최저' },
        { heading: '실거래', body: '신고 1,842건 · 의심 8건 정밀조사 분류' },
        { heading: '이의신청', body: '접수 342 · 처리 324 · 미처리 18 (기한 4월 12일)' },
      ],
      keywords: [
        { word: '3.24%', weight: 0.9 },
        { word: '8건', weight: 0.83 },
        { word: '18건', weight: 0.78 },
      ],
      stats: { sourceChars: 468, summaryChars: 142, sectionCount: 3, elapsedSeconds: 6.2 },
    },
    table: {
      documentId: 'doc-reb-market',
      style: 'table',
      sections: [
        { heading: '항목 | 값 | 비고', body: '표준지 변동률 | 3.24% | 전년 대비 +0.41%p' },
        { heading: '항목 | 값 | 비고', body: '최고·최저 | 세종 5.12% / 제주 1.08% | 시·도 기준' },
        { heading: '항목 | 값 | 비고', body: '실거래 신고 | 1,842건 | 의심 8건 정밀조사' },
        { heading: '항목 | 값 | 비고', body: '이의신청 | 342건 접수 | 미처리 18건, 기한 4월 12일' },
      ],
      keywords: [
        { word: '집계', weight: 0.88 },
        { word: '의심 거래', weight: 0.8 },
        { word: '기한', weight: 0.72 },
      ],
      stats: { sourceChars: 468, summaryChars: 208, sectionCount: 4, elapsedSeconds: 6.8 },
    },
  },
}
