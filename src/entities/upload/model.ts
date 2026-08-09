/**
 * 업로드 제약 모델.
 *
 * 에이전트마다 받을 수 있는 파일이 다르다. 회의록은 음성을, OCR은 스캔본을,
 * 분석은 데이터 파일을 받는다. 아무거나 받아 놓고 서버에서 거절하면
 * 사용자는 큰 파일을 다 올린 뒤에야 안 된다는 걸 안다.
 *
 * **여기 있는 검사는 서버가 붙어도 그대로 남는다.** 클라이언트가 책임지는 부분이고,
 * 서버 검증을 대신하는 것이 아니라 먼저 걸러 주는 것이다.
 */

export type UploadConstraint = {
  /** 허용 확장자 — 점 없이 소문자 */
  extensions: string[]
  maxBytes: number
  /** 사용자에게 보여 줄 설명 */
  hint: string
}

const MB = 1024 * 1024

export const DOCUMENT_UPLOAD: UploadConstraint = {
  extensions: ['pdf', 'docx', 'hwp', 'pptx', 'txt'],
  maxBytes: 50 * MB,
  hint: 'PDF · DOCX · HWP · PPTX · TXT · 최대 50MB',
}

export const AUDIO_UPLOAD: UploadConstraint = {
  extensions: ['mp3', 'wav', 'm4a', 'ogg'],
  maxBytes: 200 * MB,
  hint: 'MP3 · WAV · M4A · OGG · 최대 200MB',
}

export const SCAN_UPLOAD: UploadConstraint = {
  extensions: ['pdf', 'jpg', 'jpeg', 'png', 'tiff'],
  maxBytes: 50 * MB,
  hint: 'PDF · JPG · PNG · TIFF · 최대 50MB',
}

export const DATASET_UPLOAD: UploadConstraint = {
  extensions: ['csv', 'xlsx'],
  maxBytes: 100 * MB,
  hint: 'CSV · XLSX · 최대 100MB',
}

/** `<input accept>` 값 */
export function acceptAttr(c: UploadConstraint): string {
  return c.extensions.map((e) => `.${e}`).join(',')
}

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf('.')
  return i < 0 ? '' : fileName.slice(i + 1).toLowerCase()
}

/**
 * 통과하면 null, 아니면 **무엇이 왜 안 되는지** 알려 주는 문구.
 * '업로드 실패' 한 줄로 끝내면 사용자는 파일을 바꿔야 하는지 다시 시도해야 하는지 모른다.
 */
export function validateUpload(
  file: { name: string; size: number },
  c: UploadConstraint,
): string | null {
  const ext = extensionOf(file.name)
  if (!ext) return '확장자가 없는 파일은 형식을 확인할 수 없습니다.'
  if (!c.extensions.includes(ext)) {
    /* 에이전트 화면뿐 아니라 일반 채팅에서도 쓴다 — 화면 종류를 문구에 박지 않는다 */
    return `${ext.toUpperCase()} 형식은 여기서 받지 않습니다. ${c.hint}`
  }
  if (file.size === 0) return '빈 파일입니다.'
  if (file.size > c.maxBytes) {
    const limitMb = Math.round(c.maxBytes / MB)
    const sizeMb = (file.size / MB).toFixed(1)
    return `${sizeMb}MB로 상한 ${limitMb}MB를 넘습니다.`
  }
  return null
}

/**
 * 올리는 자리 하나.
 *
 * 에이전트 화면과 대화 우측 패널이 같은 자리를 쓴다. 처음에는 에이전트 훅 안에만
 * 있었는데, 대화 쪽에도 같은 것이 필요해지자 **모양을 다시 적을 뻔했다** —
 * 그러면 한쪽만 오류를 안 지우는 식으로 갈라진다.
 */
export type UploadSlot = {
  constraint: UploadConstraint
  busy: boolean
  error: string | null
  select: (file: File) => void
  clearError: () => void
}
