import type { Importance, PostStatus } from './types'

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function importanceLabel(value: Importance): string {
  return { high: '높음', medium: '보통', low: '낮음', unknown: '미분류' }[value]
}

export function statusLabel(value: PostStatus): string {
  return {
    pending: '검토 대기',
    published: '검토됨',
    hidden: '숨김',
    deleted: '삭제',
    promoted: '승격됨',
  }[value]
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : '잠시 문제가 생겼어요. 조금 뒤에 다시 시도해 주세요.'
}
