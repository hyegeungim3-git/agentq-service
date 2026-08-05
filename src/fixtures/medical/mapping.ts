/**
 * 의료(새빛대학교병원) 기준정보 표준화 자료.
 *
 * 병원이 표준화하는 것은 주소가 아니라 **청구 항목 코드**다. 진료과가 쓰는
 * 항목명이 제각각이라 급여 기준 코드로 맞춰야 심사에서 조정되지 않는다.
 * 그래서 주소 관련 처리 유형은 아예 쓰지 않는다 — 안 쓰는 유형을 라디오에 두면
 * 고를 수 있는데 아무 일도 안 하는 칸이 된다.
 *
 * ⚠️ **AI로 안 되는 건을 남긴다.** 항목명만으로는 급여·비급여가 갈리지 않는
 * 것들이 있고, 그건 진료과 확인이 필요하다. 자동으로 붙이면 잘못된 코드로
 * 청구되고, 그건 삭감으로 돌아온다.
 */
import type { TagMappingResult } from '@entities/mapping/model'

export const MEDICAL_CODE_MAPPING: TagMappingResult = {
  mode: 'tags',
  totalTags: 1_840,
  standardized: 1_412,
  elapsedSeconds: 5.2,
  /* AI 처리 가능 사유 합계(168+94+62) — 미매칭 사유 표와 일치한다 */
  autoConfirmable: 324,
  namingPattern: '<분류>-<항목>-<세부>',
  namingExample: 'PRC-ENDO-BIOP',
  candidates: [
    {
      id: 'm-suh-1',
      source: '내시경생검',
      sourceSystem: '진료과 오더 명칭',
      suggested: 'PRC-ENDO-BIOP',
      standardName: '내시경적 조직검사',
      confidence: 0.96,
      status: 'auto',
      basis: [
        { label: '매칭 근거', detail: '급여 기준 고시 항목명과 표기만 다름' },
        { label: '적용 기준', detail: '요양급여 항목 분류 제3장' },
      ],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-suh-2',
      source: '초음파(복부)',
      sourceSystem: '진료과 오더 명칭',
      suggested: 'DGN-USG-ABD',
      standardName: '복부 초음파검사',
      confidence: 0.93,
      status: 'auto',
      basis: [
        { label: '매칭 근거', detail: '부위 표기가 괄호로 들어간 형태' },
        { label: '적용 기준', detail: '요양급여 항목 분류 제2장' },
      ],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-suh-3',
      source: '수액처치',
      sourceSystem: '간호 기록 명칭',
      suggested: 'TRT-IVF-STD',
      standardName: '정맥 수액 요법',
      confidence: 0.71,
      status: 'review',
      basis: [
        { label: '매칭 근거', detail: '유사 명칭이 셋 있어 하나로 못 좁힘' },
        { label: '확인 필요', detail: '수액 종류에 따라 산정 항목이 갈림' },
      ],
      alternatives: [
        {
          code: 'TRT-IVF-NUT',
          name: '영양 수액 요법',
          confidence: 0.64,
          reason: '기록에 수액 종류가 없어 구분되지 않습니다',
        },
      ],
      blocker: null,
    },
    {
      id: 'm-suh-4',
      source: '상처소독',
      sourceSystem: '간호 기록 명칭',
      suggested: '',
      standardName: '',
      confidence: 0,
      status: 'none',
      basis: [{ label: '판정', detail: '처치 범위가 기록에 없어 급여 항목을 특정할 수 없음' }],
      alternatives: [],
      blocker:
        '드레싱 범위와 재료가 기록에 없어 자동으로 코드를 붙일 수 없습니다. 진료과 확인이 필요합니다.',
    },
  ],
  reasons: [
    {
      label: '항목명이 급여 기준 표기와 다름',
      count: 168,
      aiSolvable: true,
      action: '표기 규칙을 학습해 자동 대응 — 확정은 사람이 승인',
    },
    {
      label: '부위·범위 표기가 빠져 후보가 둘 이상',
      count: 94,
      aiSolvable: true,
      action: '후보를 제시하고 진료과가 고르게 함',
    },
    {
      label: '진료과 자체 명칭이라 대응 항목을 못 찾음',
      count: 62,
      aiSolvable: true,
      action: '자체 명칭 사전을 만들어 매핑',
    },
    {
      /* AI로 안 되는 것을 되는 것처럼 세면 계획이 어긋난다 */
      label: '기록에 처치 범위가 없어 급여 여부 자체가 안 갈림',
      count: 104,
      aiSolvable: false,
      action: '진료과 확인 후 기록 보완 — AI로는 해결되지 않음',
    },
  ],
}
