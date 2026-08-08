/**
 * 업무 문서 접근 경계. 문서를 입력으로 받는 에이전트는 전부 여기를 통과한다.
 */
import type { BusinessDocument, DocumentKind } from '@entities/document/model'
import type { ApiResult } from './domains'
import { withPack } from './pack'

/** kinds를 주면 그 종류만 걸러 준다 — 번역은 성적서를, 요약은 전부 받는 식이다. */
export function fetchDocuments(kinds?: DocumentKind[]): Promise<ApiResult<BusinessDocument[]>> {
  // TODO(api-미확정): GET /documents 로 교체. 제거 조건 = 백엔드가 제안서를 확정.
  return withPack((p) => (kinds?.length ? p.documents.filter((d) => kinds.includes(d.kind)) : p.documents))
}

/**
 * 파일을 올려 서버가 파싱한 문서를 돌려받는다.
 *
 * ⚠️ **지금은 실패를 반환한다. 이건 미구현이 아니라 사실을 말하는 것이다.**
 *
 * 업로드는 파일을 목록에 얹는 일이 아니라 **서버가 본문을 뽑아내는 일**이다.
 * PDF·HWP·음성은 브라우저가 열 수 없다. 서버 없이 성공한 척하면 다음 둘 중
 * 하나가 된다 — 본문 없는 껍데기를 목록에 넣거나, 사용자가 올린 파일에 대해
 * 남의 문서 분석 결과를 보여 주거나. 둘 다 이 저장소가 없애려는 것이다.
 *
 * 형식·용량 검사(`@entities/upload/model`)는 화면에서 이미 끝난 뒤 여기로 온다.
 * 그 검사는 서버가 붙어도 그대로 남는다. 바뀌는 건 이 함수 하나다.
 *
 * TODO(api-미확정): POST /documents (multipart) 로 교체.
 *   제거 조건 = 업로드 엔드포인트·최대 크기·파싱 응답 형식 확정.
 */
export function uploadDocument(file: File): Promise<ApiResult<BusinessDocument>> {
  void file
  return Promise.resolve({
    ok: false,
    error:
      '문서 업로드는 서버에 연결된 뒤에 동작합니다. 지금은 파일을 보낼 곳이 없어 처리할 수 없습니다.',
  })
}
