/**
 * 분석 데이터셋 접근 경계.
 */
import type { Dataset } from '@entities/dataset/model'
import type { ApiResult } from './domains'
import { withPack } from './pack'

export function fetchDatasets(): Promise<ApiResult<Dataset[]>> {
  /* 학습·평가 데이터셋(`shared/api/mlops`)과 **다른 자원**이다. 이름이 같아 한때
     같은 주소를 제안했는데, 응답 형태가 서로 달라 명세를 만들 때 충돌했다. */
  // TODO(api-미확정): GET /analysis/datasets 로 교체. 제거 조건 = API 명세 확정.
  return withPack((p) => p.datasets)
}

/**
 * 데이터 파일을 올려 서버가 읽어 낸 데이터셋을 돌려받는다.
 *
 * ⚠️ 문서 업로드와 같은 이유로 지금은 실패를 반환한다(`shared/api/documents` 참조).
 * CSV는 브라우저도 읽을 수 있지만, 행·열 수와 결측 비율은 서버가 집계해야 하고
 * 그것을 지어내면 화면에 표시되는 적용률이 거짓이 된다.
 *
 * TODO(api-미확정): POST /analysis/datasets (multipart) 로 교체.
 *   제거 조건 = 업로드 엔드포인트·집계 응답 형식 확정.
 */
export function uploadDataset(file: File): Promise<ApiResult<Dataset>> {
  void file
  return Promise.resolve({
    ok: false,
    error:
      '데이터 업로드는 서버에 연결된 뒤에 동작합니다. 지금은 파일을 보낼 곳이 없어 처리할 수 없습니다.',
  })
}
