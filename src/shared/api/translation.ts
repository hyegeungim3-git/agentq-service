import type { TranslationRequest, TranslationResult } from '@entities/translation/model'
import { currentPack } from './pack'
import type { ApiResult } from './domains'

export type TranslationApiOptions = { delayMs?: number | undefined }

const wait = (ms: number): Promise<void> =>
  ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms))

/*
 * 용어집 단독 조회는 두지 않는다.
 *
 * 만들어 뒀지만 **아무 화면도 부르지 않았다**(사용처 지도가 잡았다).
 * 번역 결과에 적용된 용어(`glossaryUsed`)가 이미 실려 오기 때문이다.
 * 안 쓰는 주소를 제안서에 남기면 백엔드가 안 만들어도 될 것을 만든다.
 */

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
  const pack = currentPack()
  if (!pack) return { ok: false, error: '이 발주처의 업무 데이터가 아직 없습니다.' }
  const sim = pack.simulate.translate
  if (!sim) return { ok: false, error: '이 발주처는 이 에이전트를 아직 도입하지 않았습니다.' }
  return { ok: true, data: sim(req, text) }
}
