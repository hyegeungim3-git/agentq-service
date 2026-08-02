import type { GlossaryEntry, TranslationRequest, TranslationResult } from '@entities/translation/model'
import { GLOSSARY, simulateTranslation } from '@fixtures/translation'
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
  text: string,
  opts: TranslationApiOptions = {},
): Promise<ApiResult<TranslationResult>> {
  if (req.from === req.to) return { ok: false, error: '원문과 번역 언어가 같습니다.' }
  if (req.source === 'text' && text.trim().length === 0) {
    return { ok: false, error: '번역할 원문을 입력해 주세요.' }
  }

  await wait(opts.delayMs ?? 1800)
  /* 방향은 문장 사전을, 용어집 토글은 적용 흔적과 신뢰도를,
     요약 옵션은 요약 절을 바꾼다. 직접 입력은 사전에 없는 문장을 그대로 드러낸다.
     TODO(api-미확정): POST /translations 로 교체. 제거 조건 = 번역 엔진·응답 형식 확정. */
  return { ok: true, data: simulateTranslation(req, text) }
}
