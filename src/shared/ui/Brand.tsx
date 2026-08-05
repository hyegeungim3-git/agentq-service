/**
 * 브랜드 표식 — OCUBE의 AgentQ.
 *
 * 이전 데모의 심볼을 **그대로** 옮겼다. 다시 그리지 않은 이유가 있다.
 * 문구를 옮기면서 새로 쓴 적이 있는데('사이드바 열기'를 '사이드바 펼치기'로 바꿨다),
 * 그 한 단어 때문에 모바일 진입점 20곳이 한꺼번에 깨졌다.
 * 검증된 자산은 재창작하지 않고 옮긴다.
 *
 * 색은 발주처 브랜드 색을 따른다 — `--color-brand`를 셸이 꽂아 준다.
 */

/**
 * OCUBE 심볼 — 브랜드 철학 'OPEN + CUBE'를 아이소메트릭 큐브로.
 * 윗면·왼면은 채우고 오른면만 선으로 비워 '열린 큐브'를 만든다.
 * AgentQ의 Q는 우하단 점으로 암시.
 */
export function OcubeMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'size-9 rounded-lg' : 'size-11 rounded-xl'
  const glyph = size === 'sm' ? 'size-[22px]' : 'size-[26px]'
  return (
    <span className={`flex shrink-0 items-center justify-center bg-brand shadow-md ${box}`}>
      <svg viewBox="0 0 32 32" fill="none" className={glyph} aria-hidden="true">
        <path d="M16 4.2 L26.6 10.3 L16 16.4 L5.4 10.3 Z" fill="#fff" />
        <path d="M5.4 10.3 L16 16.4 L16 28.2 L5.4 22.1 Z" fill="#fff" opacity="0.62" />
        <path
          d="M26.6 10.3 L26.6 22.1 L16 28.2 L16 16.4 Z"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
        <circle cx="23.2" cy="21.4" r="2.1" fill="#fff" />
      </svg>
    </span>
  )
}

/**
 * 심볼 + 워드마크.
 *
 * 회사(OCUBE) 위, 제품(AgentQ) 아래 — 'OCUBE의 AgentQ' 위계다.
 * 옆의 `context`가 지금 보고 있는 곳(분야명·'관리자')을 가리킨다.
 */
export function BrandLock({
  context,
  size = 'md',
  /** 이 자리가 화면의 제목이면 워드마크 자체를 h1으로 낸다 — 안 보이는 제목을 따로 두지 않는다 */
  heading = false,
  className = '',
}: {
  context?: string
  size?: 'sm' | 'md'
  heading?: boolean
  className?: string
}) {
  const Word = heading ? 'h1' : 'span'
  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <OcubeMark size={size} />
      <span className="min-w-0">
        <span className="block text-[9px] leading-none font-black tracking-[0.22em] text-slate-400">
          OCUBE
        </span>
        <span className="mt-1 flex items-baseline gap-1.5">
          <Word className="text-brand text-[19px] leading-none font-black tracking-[0.01em]">
            AgentQ
          </Word>
          {context && (
            /* 분야명·'관리자'는 번역하지 않는 한국어다 — 화면 틀이 English여도 원문이다 */
            <span
              lang="ko"
              className="truncate text-[12px] leading-none font-bold tracking-tight text-slate-500"
            >
              {context}
            </span>
          )}
        </span>
      </span>
    </span>
  )
}
