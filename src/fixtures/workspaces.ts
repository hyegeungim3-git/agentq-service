/**
 * 워크스페이스 fixture — 한빛정밀의 진행 중인 업무 단위.
 * 이전 데모 사이드바에 있던 세 개를 그대로 쓰되 목적 설명을 붙였다.
 */
import type { Workspace } from '@entities/workspace/model'

export const WORKSPACES: Workspace[] = [
  {
    id: 'ws-max',
    name: '스마트팩토리 M.AX 추진 TF',
    purpose: '발굴 과제 27건의 우선순위와 추진 계획',
  },
  {
    id: 'ws-tag',
    name: '설비 데이터 표준화 작업반',
    purpose: '포스프레임 태그 4,820개 표준화와 미매칭 정비',
  },
  {
    id: 'ws-sec',
    name: 'AI 데이터 보안 아키텍처 TF',
    purpose: '도면·공정조건 반출 기준과 내부망 처리 범위',
  },
]
