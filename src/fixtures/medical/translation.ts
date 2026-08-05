/**
 * 의료(새빛대학교병원) 번역 말뭉치.
 *
 * 여기서 번역하는 것은 **외국인 환자 이용 안내문**이다 — 진료 절차와 진료비 안내.
 *
 * ⚠️ 문구는 지원·안내의 말로 쓴다. 환자를 탓하거나 겁주는 표현을 넣지 않는다.
 * ⚠️ 낮은 신뢰도 문장과 역번역 불일치를 섞었다. 3번(본인부담금)과 4번(진료의뢰서)이
 * 그 자리다 — **건강보험 제도 용어는 나라마다 대응어가 없어** 직역하면 뜻이 달라지고,
 * 안내문에서 어긋나면 환자가 비용을 잘못 이해한다.
 */
import type { BackTranslationCheck, GlossaryEntry, LanguageCode } from '@entities/translation/model'
import type { SentenceEntry, TranslationCorpus } from '../translation'

type TargetLang = Exclude<LanguageCode, 'ko'>

const GLOSSARY: GlossaryEntry[] = [
  {
    source: '요양급여',
    targets: {
      en: 'Health insurance benefit coverage',
      ja: '療養給付',
      zh: '医疗保险给付',
    },
    category: 'process',
  },
  {
    source: '본인부담금',
    targets: { en: 'Patient co-payment', ja: '自己負担金', zh: '个人负担金额' },
    category: 'quality',
  },
  {
    source: '진료의뢰서',
    targets: { en: 'Referral letter', ja: '診療情報提供書', zh: '转诊单' },
    category: 'process',
  },
  {
    source: '응급의료센터',
    targets: {
      en: 'Emergency medical center',
      ja: '救急医療センター',
      zh: '急诊医疗中心',
    },
    category: 'equipment',
  },
  {
    source: '수납',
    targets: { en: 'Payment desk', ja: '会計', zh: '缴费' },
    category: 'process',
  },
]

const SENTENCES: SentenceEntry[] = [
  {
    id: 1,
    ko: '외래 진료는 예약 후 1층 접수창구에서 접수해 주십시오.',
    en: 'For outpatient care, please make a reservation and then check in at the reception desk on the first floor.',
    ja: '外来診療は予約のうえ、1階の受付窓口でお手続きください。',
    zh: '门诊就诊请先预约，然后到一楼挂号窗口办理。',
    appliedTerms: [],
    confidence: 0.95,
  },
  {
    id: 2,
    ko: '다른 병원에서 오신 경우 진료의뢰서를 함께 제출해 주시면 진료에 도움이 됩니다.',
    en: 'If you are visiting from another hospital, submitting a referral letter helps us provide better care.',
    ja: '他院からお越しの場合は、診療情報提供書をご提出いただくと診療に役立ちます。',
    zh: '若您从其他医院转来，提交转诊单有助于我们更好地为您诊治。',
    appliedTerms: ['진료의뢰서'],
    confidence: 0.88,
  },
  {
    id: 3,
    ko: '건강보험이 적용되는 항목은 요양급여 기준에 따라 본인부담금만 수납합니다.',
    en: 'For items covered by national health insurance, only the patient co-payment is collected according to the benefit coverage standards.',
    ja: '健康保険が適用される項目は、療養給付基準に基づき自己負担金のみを会計いたします。',
    zh: '属于医疗保险覆盖范围的项目，按医疗保险给付标准仅收取个人负担金额。',
    appliedTerms: ['요양급여', '본인부담금', '수납'],
    confidence: 0.83,
  },
  {
    id: 4,
    ko: '보험이 적용되지 않는 항목은 진료 전에 예상 금액을 안내해 드립니다.',
    en: 'For items not covered by insurance, we inform you of the estimated cost before treatment.',
    ja: '保険が適用されない項目については、診療前に概算金額をご案内します。',
    zh: '对于保险不覆盖的项目，我们会在诊疗前告知预估费用。',
    appliedTerms: [],
    confidence: 0.81,
  },
  {
    id: 5,
    ko: '갑작스러운 증상으로 도움이 필요하시면 24시간 운영하는 응급의료센터로 오십시오.',
    en: 'If you need help for a sudden symptom, please come to the emergency medical center, which is open 24 hours.',
    ja: '急な症状でお困りの際は、24時間対応の救急医療センターにお越しください。',
    zh: '如遇突发症状需要帮助，请前往24小时开放的急诊医疗中心。',
    appliedTerms: ['응급의료센터'],
    confidence: 0.93,
  },
]

/** 되돌려 보면 비용 안내의 뜻이 달라진 문장 — 여기가 사람이 봐야 하는 자리다 */
const BACK_TO_KO: Record<TargetLang, BackTranslationCheck[]> = {
  en: [
    {
      segmentId: 1,
      backText: '외래 진료는 예약하신 뒤 1층 접수 데스크에서 체크인해 주십시오.',
      similarity: 0.91,
    },
    {
      segmentId: 3,
      backText:
        '국민건강보험이 보장하는 항목은 급여 보장 기준에 따라 환자 본인 부담분만 징수한다.',
      similarity: 0.78,
    },
    {
      segmentId: 4,
      backText: '보험이 보장하지 않는 항목은 치료 전에 예상 비용을 알려 드린다.',
      similarity: 0.86,
    },
  ],
  ja: [
    {
      segmentId: 3,
      backText: '건강보험이 적용되는 항목은 요양급여 기준에 근거해 자기부담금만 회계합니다.',
      similarity: 0.92,
    },
    {
      segmentId: 2,
      backText: '타원에서 오신 경우는 진료정보제공서를 제출해 주시면 진료에 도움이 됩니다.',
      similarity: 0.85,
    },
  ],
  zh: [
    {
      segmentId: 3,
      backText: '속하는 의료보험 범위의 항목은 급부 기준에 따라 개인 부담 금액만 수취한다.',
      similarity: 0.74,
    },
    {
      segmentId: 2,
      backText: '다른 병원에서 옮겨 온 경우 전원 서류를 내면 진료에 도움이 된다.',
      similarity: 0.72,
    },
  ],
}

const BACK_TO_EN: BackTranslationCheck[] = [
  {
    segmentId: 3,
    backText:
      'For insured items, only the portion the patient pays is charged, following the coverage rules.',
    similarity: 0.77,
  },
]

const SUMMARY_BY_LANG: Record<LanguageCode, string> = {
  ko: '외래 진료는 예약 후 1층에서 접수하고, 타 병원에서 오신 경우 진료의뢰서를 함께 내면 진료에 도움이 된다. 건강보험 적용 항목은 요양급여 기준에 따라 본인부담금만 수납하며, 비급여 항목은 진료 전에 예상 금액을 안내한다. 갑작스러운 증상은 24시간 응급의료센터에서 도움을 받을 수 있다.',
  en: 'Outpatient visits start with a reservation and check-in on the first floor; a referral letter helps if you come from another hospital. For insured items only the patient co-payment is collected, and for uncovered items the estimated cost is explained before treatment. The emergency medical center is open 24 hours for sudden symptoms.',
  ja: '外来は予約のうえ1階で受付し、他院からの場合は診療情報提供書があると診療に役立つ。健康保険適用項目は療養給付基準により自己負担金のみを会計し、保険適用外の項目は診療前に概算金額を案内する。急な症状には24時間対応の救急医療センターが対応する。',
  zh: '门诊需先预约并在一楼挂号；如从其他医院转来，提交转诊单有助于诊治。保险覆盖项目按给付标准仅收取个人负担金额，不覆盖项目在诊疗前告知预估费用。突发症状可前往24小时开放的急诊医疗中心。',
}

export const MEDICAL_TRANSLATION: TranslationCorpus = {
  glossary: GLOSSARY,
  sentences: SENTENCES,
  backToKo: BACK_TO_KO,
  backToEn: BACK_TO_EN,
  summaryByLang: SUMMARY_BY_LANG,
}
