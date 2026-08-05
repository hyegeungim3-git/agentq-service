/**
 * 행정(한성시청) 번역 말뭉치.
 *
 * 여기서 번역하는 것은 **외국인 주민 대상 안내문**이다 — 민원 신청 방법과
 * 호우 시 행동 요령. 시청은 이걸 매년 다시 번역한다.
 *
 * ⚠️ 낮은 신뢰도 문장과 역번역 불일치를 섞었다. 3번(계고)과 4번(과태료)이
 * 그 자리다 — **행정 처분 용어는 나라마다 제도가 달라** 직역하면 강도가 바뀐다.
 * 안내문에서 이게 어긋나면 주민이 기한을 놓친다.
 */
import type { BackTranslationCheck, GlossaryEntry, LanguageCode } from '@entities/translation/model'
import type { SentenceEntry, TranslationCorpus } from '../translation'

type TargetLang = Exclude<LanguageCode, 'ko'>

const GLOSSARY: GlossaryEntry[] = [
  {
    source: '민원',
    targets: { en: 'Civil complaint (public request)', ja: '民願(行政申請)', zh: '民愿(行政申请)' },
    category: 'process',
  },
  {
    source: '옥외광고물',
    targets: { en: 'Outdoor advertisement', ja: '屋外広告物', zh: '户外广告物' },
    category: 'process',
  },
  {
    source: '표시 신고',
    targets: { en: 'Display report', ja: '表示申告', zh: '标示申报' },
    category: 'process',
  },
  {
    source: '계고',
    targets: {
      en: 'Advance notice before enforcement',
      ja: '戒告(事前通告)',
      zh: '事先告诫',
    },
    category: 'quality',
  },
  {
    source: '과태료',
    targets: { en: 'Administrative fine', ja: '過料', zh: '罚款(行政)' },
    category: 'quality',
  },
  {
    source: '행정동',
    targets: {
      en: 'Administrative dong (district unit)',
      ja: '行政洞',
      zh: '行政洞',
    },
    category: 'material',
  },
]

const SENTENCES: SentenceEntry[] = [
  {
    id: 1,
    ko: '민원은 행정복지센터 방문 또는 온라인으로 신청할 수 있습니다.',
    en: 'Civil complaints can be filed in person at a community service center or online.',
    ja: '民願は行政福祉センターの窓口またはオンラインで申請できます。',
    zh: '民愿可到行政福祉中心现场办理或在线申请。',
    appliedTerms: ['민원'],
    confidence: 0.94,
  },
  {
    id: 2,
    ko: '거주하는 행정동에 따라 담당 부서가 달라집니다.',
    en: 'The responsible department differs depending on the administrative dong where you live.',
    ja: 'お住まいの行政洞によって担当部署が異なります。',
    zh: '根据居住的行政洞不同，负责部门也不同。',
    appliedTerms: ['행정동'],
    confidence: 0.92,
  },
  {
    id: 3,
    ko: '옥외광고물을 표시하려면 미리 표시 신고를 해야 하며, 신고 없이 표시하면 계고 후 정비 대상이 됩니다.',
    en: 'A display report must be filed before installing an outdoor advertisement; unreported displays receive an advance notice and are then subject to removal.',
    ja: '屋外広告物を表示するには事前に表示申告が必要であり、申告なく表示した場合は戒告のうえ整備の対象となります。',
    zh: '设置户外广告物须事先进行标示申报；未申报设置的，将在事先告诫后列入整治对象。',
    appliedTerms: ['옥외광고물', '표시 신고', '계고'],
    confidence: 0.84,
  },
  {
    id: 4,
    ko: '기한까지 자진 정비하지 않으면 과태료가 부과될 수 있습니다.',
    en: 'If voluntary removal is not completed by the deadline, an administrative fine may be imposed.',
    ja: '期限までに自主的に整備しない場合、過料が課されることがあります。',
    zh: '未在期限内自行整治的，可能被处以罚款。',
    appliedTerms: ['과태료'],
    confidence: 0.8,
  },
  {
    id: 5,
    ko: '호우경보가 발령되면 하천 산책로와 지하차도 이용을 삼가 주십시오.',
    en: 'When a heavy rain warning is issued, please avoid riverside walkways and underpasses.',
    ja: '大雨警報が発表された場合は、河川の遊歩道と地下車道の利用をお控えください。',
    zh: '发布暴雨警报时，请勿使用河边步道和地下车道。',
    appliedTerms: [],
    confidence: 0.9,
  },
]

/** 되돌려 보면 강도가 달라진 문장 — 행정 처분 용어가 그렇다 */
const BACK_TO_KO: Record<TargetLang, BackTranslationCheck[]> = {
  en: [
    {
      segmentId: 1,
      backText: '민원은 지역 주민센터를 직접 방문하거나 온라인으로 제출할 수 있다.',
      similarity: 0.9,
    },
    {
      segmentId: 3,
      backText:
        '옥외 광고를 설치하기 전에 표시 보고서를 제출해야 하며, 보고되지 않은 표시는 사전 통지를 받은 뒤 철거 대상이 된다.',
      similarity: 0.76,
    },
    {
      segmentId: 4,
      backText: '기한까지 자발적 철거가 완료되지 않으면 행정 벌금이 부과될 수 있다.',
      similarity: 0.79,
    },
  ],
  ja: [
    {
      segmentId: 3,
      backText:
        '옥외광고물을 표시하려면 사전에 표시 신고가 필요하며, 신고 없이 표시한 경우는 계고 후 정비 대상이 됩니다.',
      similarity: 0.93,
    },
    {
      segmentId: 4,
      backText: '기한까지 자주적으로 정비하지 않는 경우, 과료가 부과되는 일이 있습니다.',
      similarity: 0.83,
    },
  ],
  zh: [
    {
      segmentId: 3,
      backText:
        '설치 호외 광고물은 사전에 표시 신고를 해야 하며, 미신고 설치는 사전 고지 후 정비 대상에 편입된다.',
      similarity: 0.81,
    },
    {
      segmentId: 4,
      backText: '기한 내에 스스로 정비하지 않으면 벌금을 부과할 수 있다.',
      similarity: 0.73,
    },
  ],
}

const BACK_TO_EN: BackTranslationCheck[] = [
  {
    segmentId: 4,
    backText: 'If the site is not cleaned up voluntarily by the due date, a penalty may be charged.',
    similarity: 0.75,
  },
]

const SUMMARY_BY_LANG: Record<LanguageCode, string> = {
  ko: '민원은 행정복지센터 또는 온라인으로 신청하며 담당 부서는 거주 행정동에 따라 다르다. 옥외광고물은 표시 신고가 먼저이고, 신고 없이 표시하면 계고 후 정비 대상이 되며 기한까지 자진 정비하지 않으면 과태료가 부과될 수 있다. 호우경보 시에는 하천 산책로와 지하차도를 피해야 한다.',
  en: 'Civil complaints can be filed in person or online, and the responsible department depends on your administrative dong. Outdoor advertisements require a prior display report; unreported displays receive an advance notice, and failure to remove them by the deadline may result in an administrative fine. During heavy rain warnings, avoid riverside walkways and underpasses.',
  ja: '民願は行政福祉センターまたはオンラインで申請でき、担当部署は居住する行政洞によって異なる。屋外広告物は表示申告が先で、申告なく表示すると戒告のうえ整備対象となり、期限までに自主整備しなければ過料が課されることがある。大雨警報時は河川の遊歩道と地下車道を避けること。',
  zh: '民愿可现场或在线申请，负责部门依居住行政洞而定。户外广告物须先行标示申报，未申报设置将在事先告诫后列入整治对象，逾期未自行整治可能被处以罚款。暴雨警报期间请避开河边步道与地下车道。',
}

export const CIVIC_TRANSLATION: TranslationCorpus = {
  glossary: GLOSSARY,
  sentences: SENTENCES,
  backToKo: BACK_TO_KO,
  backToEn: BACK_TO_EN,
  summaryByLang: SUMMARY_BY_LANG,
}
