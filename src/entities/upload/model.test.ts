import { describe, it, expect } from 'vitest'
import {
  acceptAttr,
  validateUpload,
  AUDIO_UPLOAD,
  DATASET_UPLOAD,
  DOCUMENT_UPLOAD,
} from './model'

/* 이 검사는 서버가 붙어도 그대로 남는다 — 클라이언트가 책임지는 부분이다. */
describe('validateUpload', () => {
  const file = (name: string, size: number) => ({ name, size })

  it('허용 형식과 용량이면 통과한다', () => {
    expect(validateUpload(file('보고서.pdf', 1024), DOCUMENT_UPLOAD)).toBeNull()
    expect(validateUpload(file('회의.m4a', 1024), AUDIO_UPLOAD)).toBeNull()
    expect(validateUpload(file('실적.xlsx', 1024), DATASET_UPLOAD)).toBeNull()
  })

  it('대소문자가 달라도 확장자를 알아본다', () => {
    expect(validateUpload(file('보고서.PDF', 1024), DOCUMENT_UPLOAD)).toBeNull()
  })

  /* '업로드 실패' 한 줄이면 파일을 바꿔야 하는지 다시 시도해야 하는지 모른다 */
  it('안 되는 형식이면 무엇이 왜 안 되는지 말한다', () => {
    const msg = validateUpload(file('설치본.exe', 1024), DOCUMENT_UPLOAD)
    expect(msg).toContain('EXE')
    expect(msg).toContain('PDF')
  })

  it('에이전트마다 받는 형식이 다르다', () => {
    // 음성 에이전트에 PDF를 올릴 수는 없다
    expect(validateUpload(file('보고서.pdf', 1024), AUDIO_UPLOAD)).not.toBeNull()
    expect(validateUpload(file('회의.m4a', 1024), DOCUMENT_UPLOAD)).not.toBeNull()
  })

  it('상한을 넘으면 실제 크기와 상한을 함께 알린다', () => {
    const msg = validateUpload(file('큰문서.pdf', 80 * 1024 * 1024), DOCUMENT_UPLOAD)
    expect(msg).toContain('80.0MB')
    expect(msg).toContain('50MB')
  })

  it('빈 파일과 확장자 없는 파일을 걸러낸다', () => {
    expect(validateUpload(file('보고서.pdf', 0), DOCUMENT_UPLOAD)).toContain('빈 파일')
    expect(validateUpload(file('보고서', 1024), DOCUMENT_UPLOAD)).toContain('확장자')
  })
})

describe('acceptAttr', () => {
  it('파일 선택창이 쓰는 형태로 만든다', () => {
    expect(acceptAttr(DATASET_UPLOAD)).toBe('.csv,.xlsx')
  })
})
