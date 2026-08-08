import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 음성 입력.
 *
 * 현장은 장갑을 끼고 소음이 크다. 타이핑이 사실상 안 되는 자리에서 음성이 유일한
 * 실용 입력이다.
 *
 * ⚠️ **인식한 문장을 바로 보내지 않는다.** 입력창에 채워 두고 사람이 확인한 뒤 보낸다.
 * 소음 환경에서 오인식은 흔하고, 잘못 들은 문장이 그대로 질의가 되면 답도 틀린다.
 *
 * ⚠️ **브라우저 내장 인식기는 음성을 밖으로 보낼 수 있다.** 엔진에 따라 오디오가
 * 제조사 서버로 간다. 망분리 사업장에서는 온프레미스 STT로 바꿔야 하며, 그때
 * 고치는 곳은 **이 파일 하나**다 — 화면은 그대로 둔다.
 *
 * 라이브러리를 더하지 않았다. 브라우저가 이미 갖고 있는 것을 쓴다.
 */

/** 표준 이름과 크롬 계열의 접두사 이름이 다르다 */
type RecognitionCtor = new () => SpeechRecognitionLike

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechEventLike) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechEventLike = {
  resultIndex: number
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } }
}

function ctorOf(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/** 왜 안 되는지를 사람 말로 — `not-allowed` 같은 코드를 그대로 보여 주지 않는다 */
function reasonOf(code: string): string {
  if (code === 'not-allowed' || code === 'service-not-allowed')
    return '마이크 권한이 거부되어 듣지 못했습니다.'
  if (code === 'no-speech') return '소리가 들어오지 않았습니다.'
  if (code === 'audio-capture') return '마이크를 찾지 못했습니다.'
  if (code === 'network') return '인식 서버에 닿지 못했습니다.'
  return `음성 인식이 멈췄습니다 (${code}).`
}

export function useVoice(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  /* 콜백이 매 렌더 새로 와도 인식기를 다시 만들지 않는다 */
  const sink = useRef(onText)
  useEffect(() => {
    sink.current = onText
  }, [onText])

  const supported = ctorOf() !== null

  const stop = useCallback(() => {
    recRef.current?.stop()
    recRef.current = null
    setListening(false)
  }, [])

  /* 화면을 떠날 때 마이크를 놔준다 — 안 그러면 다른 화면에서도 계속 듣는다 */
  useEffect(() => () => recRef.current?.stop(), [])

  const start = useCallback(() => {
    const Ctor = ctorOf()
    if (Ctor === null) {
      setError('이 브라우저는 음성 입력을 지원하지 않습니다.')
      return
    }
    setError(null)
    const rec = new Ctor()
    rec.lang = 'ko-KR'
    /* 현장 발화는 자주 끊긴다 — 한 문장에서 끝내지 않는다 */
    rec.continuous = true
    /* 말하는 도중에도 보여야 사용자가 듣고 있다는 것을 안다 */
    rec.interimResults = true

    let settled = ''
    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r === undefined) continue
        const t = r[0]?.transcript ?? ''
        if (r.isFinal) settled += t
        else interim += t
      }
      sink.current(`${settled}${interim}`.trim())
    }
    rec.onerror = (e) => {
      setError(reasonOf(e.error))
      setListening(false)
      recRef.current = null
    }
    rec.onend = () => {
      setListening(false)
      recRef.current = null
    }

    try {
      rec.start()
      recRef.current = rec
      setListening(true)
    } catch {
      setError('음성 인식을 시작하지 못했습니다.')
    }
  }, [])

  return { supported, listening, error, start, stop }
}
