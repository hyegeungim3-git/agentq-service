/**
 * 공공(한국부동산원) 번역 말뭉치.
 *
 * 무엇을 번역하는가가 발주처마다 다르다. 여기는 **외국인 대상 공시제도 안내문**이다 —
 * 실제로 영어·중국어·일본어 수요가 있는 문서다.
 *
 * ⚠️ 일부러 낮은 신뢰도 문장과 역번역 불일치를 섞었다. 전부 완벽하면
 * '사람이 봐야 하는 지점'을 보여 주는 화면이 죽은 코드가 된다.
 * 3번(이의신청 기한)과 4번(과세표준 활용)이 그 자리다 — **제도 용어는
 * 나라마다 대응어가 없어서** 직역하면 뜻이 달라진다.
 */
import type { BackTranslationCheck, GlossaryEntry, LanguageCode } from '@entities/translation/model'
import type { SentenceEntry, TranslationCorpus } from '../translation'

type TargetLang = Exclude<LanguageCode, 'ko'>

const GLOSSARY: GlossaryEntry[] = [
  {
    source: '표준지공시지가',
    targets: {
      en: 'Officially Announced Land Price (standard land)',
      ja: '標準地公示地価',
      zh: '标准地公示地价',
    },
    category: 'process',
  },
  {
    source: '개별공시지가',
    targets: {
      en: 'Individually Announced Land Price',
      ja: '個別公示地価',
      zh: '个别公示地价',
    },
    category: 'process',
  },
  {
    source: '실거래 신고',
    targets: { en: 'Real transaction report', ja: '実取引申告', zh: '实际交易申报' },
    category: 'process',
  },
  {
    source: '이의신청',
    targets: { en: 'Objection', ja: '異議申立て', zh: '异议申请' },
    category: 'quality',
  },
  {
    source: '과세표준',
    targets: { en: 'Tax base', ja: '課税標準', zh: '计税依据' },
    category: 'quality',
  },
  {
    source: '필지',
    targets: { en: 'Parcel (lot)', ja: '筆地', zh: '地块' },
    category: 'material',
  },
]

const SENTENCES: SentenceEntry[] = [
  {
    id: 1,
    ko: '표준지공시지가는 매년 1월 1일을 기준일로 하여 조사·산정합니다.',
    en: 'The Officially Announced Land Price for standard land is surveyed and assessed with January 1 of each year as the reference date.',
    ja: '標準地公示地価は、毎年1月1日を基準日として調査・算定します。',
    zh: '标准地公示地价以每年1月1日为基准日进行调查和评估。',
    appliedTerms: ['표준지공시지가'],
    confidence: 0.95,
  },
  {
    id: 2,
    ko: '조사 대상 필지의 소재지와 이용 상황은 현장조사로 확인합니다.',
    en: 'The location and land use of each surveyed parcel are verified through a field survey.',
    ja: '調査対象となる筆地の所在地と利用状況は、現地調査で確認します。',
    zh: '调查对象地块的所在地和利用状况通过现场调查确认。',
    appliedTerms: ['필지'],
    confidence: 0.93,
  },
  {
    id: 3,
    ko: '공시된 가격에 이의가 있으면 공시일부터 30일 이내에 이의신청할 수 있습니다.',
    en: 'If you disagree with the announced price, you may file an objection within 30 days from the announcement date.',
    ja: '公示された価格に異議がある場合、公示日から30日以内に異議申立てができます。',
    zh: '对公示价格有异议的，可自公示之日起30日内提出异议申请。',
    appliedTerms: ['이의신청'],
    confidence: 0.87,
  },
  {
    id: 4,
    ko: '공시지가는 재산세 등의 과세표준 산정에 활용됩니다.',
    en: 'The announced land price is used as the tax base for property tax and other levies.',
    ja: '公示地価は、財産税などの課税標準の算定に活用されます。',
    zh: '公示地价用于房产税等计税依据的核定。',
    appliedTerms: ['과세표준'],
    confidence: 0.82,
  },
  {
    id: 5,
    ko: '부동산 거래를 하면 계약일부터 30일 이내에 실거래 신고를 해야 합니다.',
    en: 'After a real estate transaction, a real transaction report must be filed within 30 days from the contract date.',
    ja: '不動産取引を行った場合、契約日から30日以内に実取引申告をしなければなりません。',
    zh: '进行房地产交易后，须自签约之日起30日内进行实际交易申报。',
    appliedTerms: ['실거래 신고'],
    confidence: 0.91,
  },
]

/** 되돌려 보면 뜻이 달라진 문장 — 여기가 사람이 봐야 하는 자리다 */
const BACK_TO_KO: Record<TargetLang, BackTranslationCheck[]> = {
  en: [
    {
      segmentId: 1,
      backText: '표준 토지에 대한 공식 발표 지가는 매년 1월 1일을 기준일로 조사·평가된다.',
      similarity: 0.92,
    },
    {
      segmentId: 3,
      backText: '공표된 가격에 동의하지 않으면 공표일로부터 30일 이내에 이의를 제기할 수 있다.',
      similarity: 0.79,
    },
    {
      segmentId: 4,
      backText: '공표 지가는 재산세와 기타 부과금의 세금 기준으로 사용된다.',
      similarity: 0.74,
    },
  ],
  ja: [
    {
      segmentId: 3,
      backText: '공시된 가격에 이의가 있는 경우, 공시일부터 30일 이내에 이의 신청이 가능합니다.',
      similarity: 0.9,
    },
    {
      segmentId: 4,
      backText: '공시지가는 재산세 등의 과세 표준 산정에 활용됩니다.',
      similarity: 0.88,
    },
  ],
  zh: [
    {
      segmentId: 3,
      backText: '대상 공시 가격에 이의가 있으면 공시일로부터 30일 내에 이의 신청을 제출할 수 있다.',
      similarity: 0.85,
    },
    {
      segmentId: 4,
      backText: '공시지가는 부동산세 등 세금 계산 근거로 쓰인다.',
      similarity: 0.71,
    },
  ],
}

const BACK_TO_EN: BackTranslationCheck[] = [
  {
    segmentId: 4,
    backText: 'The announced land price is used to calculate the basis for property tax and similar charges.',
    similarity: 0.77,
  },
]

const SUMMARY_BY_LANG: Record<LanguageCode, string> = {
  ko: '표준지공시지가는 매년 1월 1일 기준으로 조사·산정하며, 현장조사로 필지의 소재지와 이용 상황을 확인한다. 공시가격에 이의가 있으면 30일 이내에 이의신청할 수 있고, 공시지가는 재산세 등 과세표준에 쓰인다. 거래 후에는 30일 이내 실거래 신고가 필요하다.',
  en: 'Standard land prices are assessed as of January 1 each year, with parcel location and land use verified by field survey. Objections may be filed within 30 days, and the announced price serves as the tax base for property tax. Transactions must be reported within 30 days.',
  ja: '標準地公示地価は毎年1月1日を基準に調査・算定し、現地調査で筆地の所在地と利用状況を確認する。公示価格に異議がある場合は30日以内に申立てができ、公示地価は財産税などの課税標準に用いられる。取引後は30日以内の実取引申告が必要である。',
  zh: '标准地公示地价以每年1月1日为基准进行调查评估，并通过现场调查确认地块所在地与利用状况。对公示价格有异议的可在30日内申请异议，公示地价用作房产税等计税依据。交易后须在30日内完成实际交易申报。',
}

export const PUBLIC_TRANSLATION: TranslationCorpus = {
  glossary: GLOSSARY,
  sentences: SENTENCES,
  backToKo: BACK_TO_KO,
  backToEn: BACK_TO_EN,
  summaryByLang: SUMMARY_BY_LANG,
}
