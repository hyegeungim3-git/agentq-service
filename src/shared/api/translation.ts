import type { GlossaryEntry, TranslationRequest, TranslationResult } from '@entities/translation/model'
import { GLOSSARY, TRANSLATION_RESULTS } from '@fixtures/translation'
import type { ApiResult } from './domains'

export type TranslationApiOptions = { delayMs?: number | undefined }

const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

export function fetchGlossary(): Promise<ApiResult<GlossaryEntry[]>> {
  // TODO(api-미확정): GET /glossary 로 교체. 제거 조건 = API 명세 확정.
  return Promise.resolve({ ok: true, data: GLOSSARY })
}

export async function createTranslation(
  req: TranslationRequest,
  opts: TranslationApiOptions = {},
): Promise<ApiResult<TranslationResult>> {
  await wait(opts.delayMs ?? 1800)

  const base = TRANSLATION_RESULTS[req.documentId]
  if (!base) return { ok: false, error: `번역할 문서를 찾지 못했습니다: ${req.documentId}` }
  if (req.from === req.to) return { ok: false, error: '원문과 번역 언어가 같습니다.' }

  /* 용어집을 끄면 적용 흔적이 사라지고 신뢰도가 떨어져야 한다 —
     토글이 결과를 바꾸지 않으면 그 스위치는 장식이다. */
  if (!req.useGlossary) {
    return {
      ok: true,
      data: {
        ...base,
        to: req.to,
        glossaryUsed: [],
        segments: base.segments.map((s) => ({
          ...s,
          appliedTerms: [],
          confidence: Math.max(0, Math.round((s.confidence - 0.08) * 100) / 100),
        })),
      },
    }
  }

  return { ok: true, data: { ...base, to: req.to } }
}
