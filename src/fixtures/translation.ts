/**
 * 문서 번역 — **제조(한빛정밀) 대역과 공장 함수.**
 *
 * 세계관은 요약 fixture와 같은 제조다 — 같은 문서를 다른 에이전트로
 * 처리할 수 있어야 시연에서 이야기가 이어진다.
 *
 * ⚠️ 계산은 여기 두고 **말뭉치는 팩이 준다**(`makeTranslationSimulator`).
 * 발주처마다 번역하는 문서도, 용어집도, 역번역이 흔들리는 문장도 다르다.
 *
 * 일부러 낮은 신뢰도 문장과 역번역 불일치를 섞었다. 전부 완벽하면
 * '사람이 봐야 하는 지점'을 보여주는 화면이 죽은 코드가 된다.
 *
 * ⚠️ `simulateTranslation`은 **번역 엔진이 할 일의 대역**이다.
 * 엔진이 붙으면 이 파일은 사라지고 `shared/api/translation`이 엔드포인트를 부른다.
 *
 * 문장 사전을 언어별로 갖는다. 예전에는 목표 언어를 바꿔도 영어가 그대로 나왔다 —
 * 고른 것이 결과를 바꾸지 않는 화면이었다.
 */
import type {
  BackTranslationCheck,
  GlossaryEntry,
  LanguageCode,
  TranslationRequest,
  TranslationResult,
  TranslationSegment,
} from '@entities/translation/model'

type TargetLang = Exclude<LanguageCode, 'ko'>

export const GLOSSARY: GlossaryEntry[] = [
  {
    source: '침탄 열처리',
    targets: { en: 'Carburizing heat treatment', ja: '浸炭熱処理', zh: '渗碳热处理' },
    category: 'process',
  },
  {
    source: '금형 교체',
    targets: { en: 'Die change', ja: '金型交換', zh: '模具更换' },
    category: 'process',
  },
  {
    source: '초품 검사',
    targets: { en: 'First article inspection', ja: '初品検査', zh: '首件检验' },
    category: 'quality',
  },
  { source: '경도', targets: { en: 'Hardness (HRC)', ja: '硬度', zh: '硬度' }, category: 'quality' },
  { source: '버', targets: { en: 'Burr', ja: 'バリ', zh: '毛刺' }, category: 'quality' },
  {
    source: '서보 프레스',
    targets: { en: 'Servo press', ja: 'サーボプレス', zh: '伺服压力机' },
    category: 'equipment',
  },
  {
    source: '냉간압연강판',
    targets: { en: 'Cold rolled steel sheet (SPCC)', ja: '冷間圧延鋼板', zh: '冷轧钢板' },
    category: 'material',
  },
]

/** 문장 사전 — 성적서 5문장 */
export type SentenceEntry = {
  id: number
  ko: string
  en: string
  ja: string
  zh: string
  appliedTerms: string[]
  confidence: number
}

const SENTENCES: SentenceEntry[] = [
  {
    id: 1,
    ko: '본 검사성적서는 냉간압연강판 SPCC 2.0T 코일에 대한 수입검사 결과를 기록한 것이다.',
    en: 'This inspection certificate records the incoming inspection results for cold rolled steel sheet (SPCC) 2.0T coils.',
    ja: '本検査成績書は、冷間圧延鋼板SPCC 2.0Tコイルの受入検査結果を記録したものである。',
    zh: '本检验报告记录了冷轧钢板SPCC 2.0T卷材的进货检验结果。',
    appliedTerms: ['냉간압연강판'],
    confidence: 0.96,
  },
  {
    id: 2,
    ko: '시험편 경도는 58.4 HRC로 규격 하한 58.0 HRC에 근접하였다.',
    en: 'The specimen hardness was 58.4 HRC, close to the lower specification limit of 58.0 HRC.',
    ja: '試験片の硬度は58.4 HRCで、規格下限58.0 HRCに近い値であった。',
    zh: '试样硬度为58.4 HRC，接近规格下限58.0 HRC。',
    appliedTerms: ['경도'],
    confidence: 0.94,
  },
  {
    id: 3,
    ko: '침탄 열처리 후단존 온도 편차가 관리 한계를 초과하여 조건부 합격으로 판정하였다.',
    en: 'The rear zone temperature deviation after carburizing heat treatment exceeded the control limit, so the lot was judged as conditionally accepted.',
    ja: '浸炭熱処理の後段ゾーン温度偏差が管理限界を超えたため、条件付合格と判定した。',
    zh: '渗碳热处理后段区温度偏差超过管理界限，判定为有条件合格。',
    appliedTerms: ['침탄 열처리'],
    confidence: 0.88,
  },
  {
    id: 4,
    ko: '버 발생은 관리 기준 이내이나 금형 교체 주기 도래가 임박하였다.',
    en: 'Burr occurrence is within the control criteria, but the die change interval is approaching.',
    ja: 'バリの発生は管理基準内であるが、金型交換時期が迫っている。',
    zh: '毛刺发生量在管理标准内，但模具更换周期临近。',
    appliedTerms: ['버', '금형 교체'],
    confidence: 0.81,
  },
  {
    id: 5,
    ko: '초품 검사는 2인 1조로 실시하며 결과는 설비 대장에 기록한다.',
    en: 'First article inspection is performed by a two-person team and the results are recorded in the equipment ledger.',
    ja: '初品検査は2名1組で実施し、結果は設備台帳に記録する。',
    zh: '首件检验由两人一组实施，结果记录在设备台账中。',
    appliedTerms: ['초품 검사'],
    confidence: 0.92,
  },
]

/**
 * 역번역 검증 — 번역문을 원문 언어로 되돌린 결과.
 * 목표 언어마다 되돌아오는 문장이 다르므로 언어별로 갖는다.
 * 4번 문장의 불일치는 의도적이다: '주기 도래가 임박'이 '간격이 다가온다'로 약해졌다.
 */
const BACK_TO_KO: Record<TargetLang, BackTranslationCheck[]> = {
  en: [
    {
      segmentId: 1,
      backText: '본 검사성적서는 냉간압연강판(SPCC) 2.0T 코일의 입고 검사 결과를 기록한다.',
      similarity: 0.95,
    },
    {
      segmentId: 3,
      backText: '침탄 열처리 후 후방 구역 온도 편차가 제어 한계를 초과하여 로트는 조건부 승인으로 판정되었다.',
      similarity: 0.9,
    },
    {
      segmentId: 4,
      backText: '버 발생은 관리 기준 이내이지만 금형 교체 간격이 다가오고 있다.',
      similarity: 0.78,
    },
  ],
  ja: [
    {
      segmentId: 3,
      backText: '침탄 열처리의 후단 구역 온도 편차가 관리 한계를 넘어 조건부 합격으로 판정했다.',
      similarity: 0.92,
    },
    {
      segmentId: 4,
      backText: '버 발생은 관리 기준 안이지만 금형 교환 시기가 다가오고 있다.',
      similarity: 0.8,
    },
  ],
  zh: [
    {
      segmentId: 3,
      backText: '침탄 열처리 후단 구역 온도 편차가 관리 한계를 초과해 조건부 합격으로 판정했다.',
      similarity: 0.89,
    },
    {
      segmentId: 4,
      backText: '버 발생량은 관리 기준 안이지만 금형 교체 주기가 가까워졌다.',
      similarity: 0.76,
    },
  ],
}

/** 영→한일 때의 역번역 — 한국어 번역문을 다시 영어로 되돌린다 */
const BACK_TO_EN: BackTranslationCheck[] = [
  {
    segmentId: 4,
    backText: 'Burr generation is within the control standard, but the die replacement cycle is near.',
    similarity: 0.79,
  },
]

/** 직접 입력에 넣어 볼 수 있는 예시 원문 */
export const SAMPLE_SOURCE: Record<'ko' | 'en', string> = {
  ko: SENTENCES.slice(0, 3)
    .map((s) => s.ko)
    .join('\n'),
  en: SENTENCES.slice(0, 3)
    .map((s) => s.en)
    .join('\n'),
}

const norm = (s: string): string => s.replace(/\s+/g, '').replace(/[.。]$/, '')

const pick = (e: SentenceEntry, lang: LanguageCode): string =>
  lang === 'ko' ? e.ko : lang === 'en' ? e.en : lang === 'ja' ? e.ja : e.zh

/** 문서 전체(성적서 5문장)를 번역한다 */
function documentSegments(corpus: TranslationCorpus, req: TranslationRequest): TranslationSegment[] {
  return corpus.sentences.map((s) => ({
    id: s.id,
    source: pick(s, req.from),
    target: pick(s, req.to),
    appliedTerms: req.useGlossary ? s.appliedTerms : [],
    confidence: req.useGlossary ? s.confidence : Math.round((s.confidence - 0.08) * 100) / 100,
    translated: true,
  }))
}

/**
 * 직접 입력한 문장을 번역한다.
 *
 * 사전에 없는 문장은 번역하지 않고 그렇다고 표시한다 — 임의 문장은 엔진 없이
 * 번역할 수 없고, 그럴듯한 결과를 만들면 그게 제일 위험하다.
 */
function textSegments(
  corpus: TranslationCorpus,
  req: TranslationRequest,
  text: string,
): TranslationSegment[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line, i) => {
      const hit = corpus.sentences.find((s) => norm(pick(s, req.from)) === norm(line))
      if (!hit) {
        return { id: i + 1, source: line, target: '', appliedTerms: [], confidence: 0, translated: false }
      }
      return {
        id: i + 1,
        source: line,
        target: pick(hit, req.to),
        appliedTerms: req.useGlossary ? hit.appliedTerms : [],
        confidence: req.useGlossary
          ? hit.confidence
          : Math.round((hit.confidence - 0.08) * 100) / 100,
        translated: true,
      }
    })
}

/** 번역+요약을 켰을 때만 나온다 */
const SUMMARY_BY_LANG: Record<LanguageCode, string> = {
  ko: '냉간압연강판 SPCC 2.0T 수입검사 결과로, 경도는 규격 하한에 근접했고 침탄 열처리 온도 편차가 관리 한계를 넘어 조건부 합격으로 판정했다. 버는 기준 이내이나 금형 교체 시기가 임박했다.',
  en: 'Incoming inspection of SPCC 2.0T: hardness is close to the lower limit and the carburizing temperature deviation exceeded the control limit, so the lot was conditionally accepted. Burr is within limits but a die change is due soon.',
  ja: 'SPCC 2.0Tの受入検査結果。硬度は規格下限に近く、浸炭熱処理の温度偏差が管理限界を超えたため条件付合格と判定した。バリは基準内だが金型交換時期が近い。',
  zh: 'SPCC 2.0T进货检验结果：硬度接近规格下限，渗碳热处理温度偏差超出管理界限，判定为有条件合格。毛刺在标准内，但模具更换时期临近。',
}

/**
 * 한 발주처의 번역 말뭉치.
 *
 * 문장은 **네 언어를 모두** 갖는다. 목표 언어를 바꿔도 영어가 나오면
 * 고른 것이 결과를 안 바꾸는 화면이 된다 — 이 저장소가 이미 밟은 함정이다.
 */
export type TranslationCorpus = {
  glossary: GlossaryEntry[]
  sentences: SentenceEntry[]
  /** 한→외 번역문을 한국어로 되돌린 결과. 언어마다 되돌아오는 문장이 다르다 */
  backToKo: Record<TargetLang, BackTranslationCheck[]>
  /** 영→한일 때의 역번역 */
  backToEn: BackTranslationCheck[]
  summaryByLang: Record<LanguageCode, string>
}

export const MANUFACTURING_TRANSLATION: TranslationCorpus = {
  glossary: GLOSSARY,
  sentences: SENTENCES,
  backToKo: BACK_TO_KO,
  backToEn: BACK_TO_EN,
  summaryByLang: SUMMARY_BY_LANG,
}

/** 말뭉치를 받아 번역기를 만든다 — 팩이 자기 말뭉치를 넣는다 */
export function makeTranslationSimulator(
  corpus: TranslationCorpus,
): (req: TranslationRequest, text: string) => TranslationResult {
  return (req, text) => simulateWith(corpus, req, text)
}

/** 예시 원문도 말뭉치에서 뽑는다 — 발주처를 바꾸면 입력창도 바뀐다 */
export function sampleSourceOf(corpus: TranslationCorpus): Record<'ko' | 'en', string> {
  return {
    ko: corpus.sentences
      .slice(0, 3)
      .map((s) => s.ko)
      .join('\n'),
    en: corpus.sentences
      .slice(0, 3)
      .map((s) => s.en)
      .join('\n'),
  }
}

/** 설정을 반영한 번역 — 엔진이 붙으면 이 함수가 사라진다 */
export function simulateTranslation(req: TranslationRequest, text: string): TranslationResult {
  return simulateWith(MANUFACTURING_TRANSLATION, req, text)
}

function simulateWith(
  corpus: TranslationCorpus,
  req: TranslationRequest,
  text: string,
): TranslationResult {
  const segments =
    req.source === 'document' ? documentSegments(corpus, req) : textSegments(corpus, req, text)
  const translated = segments.filter((s) => s.translated)

  const usedTerms = new Set(translated.flatMap((s) => s.appliedTerms))
  const ids = new Set(translated.map((s) => s.id))
  const backSource = req.from === 'ko' ? corpus.backToKo[req.to as TargetLang] : corpus.backToEn

  return {
    documentId: req.documentId,
    source: req.source,
    from: req.from,
    to: req.to,
    segments,
    untranslated: segments.length - translated.length,
    glossaryUsed: req.useGlossary ? corpus.glossary.filter((g) => usedTerms.has(g.source)) : [],
    // 직접 입력이면 번역된 문장에 대해서만 역번역을 붙인다
    backChecks: backSource.filter((c) => ids.has(c.segmentId)),
    summary: req.withSummary ? corpus.summaryByLang[req.to] : null,
    elapsedSeconds: Math.round((segments.length * 1.6 + (req.withSummary ? 2.4 : 0)) * 10) / 10,
  }
}
