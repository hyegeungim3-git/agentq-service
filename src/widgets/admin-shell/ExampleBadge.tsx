/**
 * '서버 미연결 — 예시 값' 배지.
 *
 * 인프라 수치는 로직이 없다. 숫자 자체가 전부다. 그래서 지어낸 값을 실측처럼
 * 그리면 **거짓 계기판**이 된다 — 이 저장소가 없애려는 바로 그것이다.
 *
 * 값보다 먼저 보이는 자리에 둔다. 서버가 붙으면 이 배지가 사라지는 것으로
 * 연결 여부를 눈으로 확인할 수 있다(SCOPE-PLAN §3-7).
 */
export function ExampleBadge({ note }: { note?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
      서버 미연결 — 예시 값{note ? ` · ${note}` : ''}
    </span>
  )
}
