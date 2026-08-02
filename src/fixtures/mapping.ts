/**
 * 기준정보 표준화 fixture.
 *
 * 수치는 데이터 조회·분석 fixture와 같은 세계관이다 —
 * 로트 키 미발행 때문에 분석 적용률이 71%였던 그 문제가 여기서는
 * '표준화 불가' 사유로 나타난다.
 *
 * status가 none인 후보를 반드시 남겼다. 전부 auto/review로 채우면
 * '검토만 하면 다 된다'는 착각을 만들고, 실제로는 설비를 바꿔야 하는 건이 있다.
 */
import type { MappingResult } from '@entities/mapping/model'

export const MAPPING_RESULT: MappingResult = {
  totalTags: 4_820,
  standardized: 2_988,
  elapsedSeconds: 6.8,
  // AI 처리 가능 사유 합계(512+386+274) — 미매칭 사유 표와 일치한다
  autoConfirmable: 1_172,
  namingPattern: '<사업장>-<설비>-<계측>-<지표>',
  namingExample: 'CWN-PRS03-VIB-RMS',
  candidates: [
    {
      id: 'm-1',
      source: 'P1_PRS3_VIB',
      sourceSystem: '포스프레임',
      suggested: 'CWN-PRS03-VIB-RMS',
      standardName: '창원 3번 프레스 진동 RMS',
      confidence: 0.96,
      status: 'auto',
      basis: [
        { label: '명명규칙 매칭', detail: 'P1=창원(CWN), PRS3=PRS03으로 4개 세그먼트가 모두 대응됩니다.' },
        { label: '단위 일치', detail: '수집 단위 mm/s가 표준 지표 RMS와 일치합니다.' },
      ],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-2',
      source: 'PRESS3_VIBRATION',
      sourceSystem: 'SCADA',
      suggested: 'CWN-PRS03-VIB-RMS',
      standardName: '창원 3번 프레스 진동 RMS',
      confidence: 0.93,
      status: 'auto',
      basis: [
        { label: '중복 통합', detail: 'm-1과 같은 계측점입니다. 두 시스템이 각각 수집하던 것을 하나로 묶습니다.' },
      ],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-3',
      source: 'FUR3_TEMP_REAR',
      sourceSystem: 'SCADA',
      suggested: 'CWN-FUR03-TMP-REAR',
      standardName: '창원 침탄로 3호기 후단존 온도',
      confidence: 0.91,
      status: 'auto',
      basis: [{ label: '존 속성 분리', detail: 'REAR를 존 속성으로 분리해 표준 4세그먼트에 맞췄습니다.' }],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-4',
      source: 'VIB_02',
      sourceSystem: '포스프레임',
      suggested: 'CWN-PRS02-VIB-RMS',
      standardName: '창원 2번 프레스 진동 RMS',
      confidence: 0.64,
      status: 'review',
      basis: [
        { label: '사업장 불명', detail: '태그에 사업장 코드가 없습니다. 수집 서버 위치로 창원을 추정했습니다.' },
        { label: '단위 환산 필요', detail: '수집 단위가 μm이라 mm/s로 환산해야 표준과 맞습니다.' },
      ],
      alternatives: [
        { code: 'ASN-PRS02-VIB-RMS', name: '아산 2번 프레스 진동 RMS', confidence: 0.31, reason: '아산에도 2번 프레스가 있습니다.' },
      ],
      blocker: null,
    },
    {
      id: 'm-5',
      source: '프레스3_진동(수기)',
      sourceSystem: '수기 입력',
      suggested: 'CWN-PRS03-VIB-RMS',
      standardName: '창원 3번 프레스 진동 RMS',
      confidence: 0.58,
      status: 'review',
      basis: [
        { label: '한글 표기', detail: '수기 태그라 표기가 매번 다릅니다. 표준 코드 후보는 하나로 좁혀집니다.' },
        { label: '확인 필요', detail: '측정 주기가 불규칙해 자동 수집분과 합칠지 판단이 필요합니다.' },
      ],
      alternatives: [],
      blocker: null,
    },
    {
      id: 'm-6',
      source: 'LOT_KEY',
      sourceSystem: 'MES',
      suggested: '-',
      standardName: '표준 코드 없음',
      confidence: 0,
      status: 'none',
      basis: [
        { label: '매핑 불가', detail: '설비가 로트 키를 발행하지 않아 값 자체가 비어 있습니다. 이름을 바꾼다고 해결되지 않습니다.' },
      ],
      alternatives: [],
      blocker: '설비 제어기 펌웨어 업데이트로 로트 키 발행 기능을 켜야 합니다. AI로는 해결할 수 없습니다.',
    },
    {
      id: 'm-7',
      source: 'OLD_PRS01_VIB',
      sourceSystem: '포스프레임',
      suggested: '-',
      standardName: '표준 코드 없음',
      confidence: 0,
      status: 'none',
      basis: [{ label: '폐기 설비', detail: '2024년 폐기된 설비의 태그가 수집 목록에 남아 있습니다.' }],
      alternatives: [],
      blocker: '수집 대상에서 제외해야 합니다. 표준화 대상이 아닙니다.',
    },
  ],
  reasons: [
    { label: '약어·비표준 표기', count: 512, aiSolvable: true, action: '별칭 사전 확장 후 재매핑' },
    { label: '사업장 코드 누락', count: 386, aiSolvable: true, action: '수집 서버 위치로 추정 후 확인' },
    { label: '단위 미환산', count: 274, aiSolvable: true, action: '단위 규칙 적용 후 환산' },
    { label: '로트 키 미발행', count: 452, aiSolvable: false, action: '설비 제어기 펌웨어 업데이트 (현장 조치)' },
    { label: '폐기 설비 잔존', count: 208, aiSolvable: false, action: '수집 목록에서 제외 (시스템 조치)' },
  ],
}
