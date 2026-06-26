import { api } from './client'
import type {
  AIOutput,
  BackgroundJob,
  BoardType,
  ChatResponse,
  DailyReport,
  DailyReportDetail,
  DashboardStats,
  Importance,
  Inquiry,
  InquiryDetail,
  Keyword,
  PaginatedPosts,
  Post,
  PostDetail,
  PostStatus,
  PersonalReport,
  PersonalizedNewsPage,
  SearchResponse,
  TokenResponse,
  User,
  UserAdmin,
} from '../types'

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/api/v1/auth/login', { email, password })
  return data
}

export async function register(payload: {
  name: string
  email: string
  password: string
}): Promise<{ message: string; status: string }> {
  const { data } = await api.post('/api/v1/auth/register', payload)
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/api/v1/auth/me')
  return data
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/api/v1/stats/dashboard')
  return data
}

export async function listPosts(params: {
  board_type: BoardType
  status?: PostStatus
  importance?: Importance
  keyword?: string
  page?: number
  size?: number
}): Promise<PaginatedPosts> {
  const { data } = await api.get<PaginatedPosts>('/api/v1/posts', { params })
  return data
}

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await api.get<PostDetail>(`/api/v1/posts/${id}`)
  return data
}

export async function postAction(
  id: string,
  action: 'approve' | 'hide' | 'promote' | 'summarize',
): Promise<Post | AIOutput> {
  const { data } = await api.post<Post | AIOutput>(`/api/v1/posts/${id}/${action}`)
  return data
}

export async function listReports(): Promise<DailyReport[]> {
  const { data } = await api.get<DailyReport[]>('/api/v1/reports')
  return data
}

export async function getReport(id: string): Promise<DailyReportDetail> {
  const { data } = await api.get<DailyReportDetail>(`/api/v1/reports/${id}`)
  return data
}

export async function search(q: string): Promise<SearchResponse> {
  const { data } = await api.get<SearchResponse>('/api/v1/search', { params: { q, limit: 20 } })
  return data
}

export async function askChat(message: string, allowGeneral = false): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/api/v1/chat/ask', {
    message,
    allow_general: allowGeneral,
  })
  return data
}

export async function listMyInquiries(): Promise<Inquiry[]> {
  const { data } = await api.get<Inquiry[]>('/api/v1/inquiries/mine')
  return data
}

export async function listInquiries(): Promise<Inquiry[]> {
  const { data } = await api.get<Inquiry[]>('/api/v1/inquiries')
  return data
}

export async function getInquiry(id: string): Promise<InquiryDetail> {
  const { data } = await api.get<InquiryDetail>(`/api/v1/inquiries/${id}`)
  return data
}

export async function createInquiry(title: string, body: string): Promise<InquiryDetail> {
  const { data } = await api.post<InquiryDetail>('/api/v1/inquiries', { title, body })
  return data
}

export async function addInquiryMessage(id: string, body: string): Promise<InquiryDetail> {
  const { data } = await api.post<InquiryDetail>(`/api/v1/inquiries/${id}/messages`, { body })
  return data
}

export async function closeInquiry(id: string): Promise<InquiryDetail> {
  const { data } = await api.patch<InquiryDetail>(`/api/v1/inquiries/${id}/close`)
  return data
}

export async function listPendingUsers(): Promise<UserAdmin[]> {
  const { data } = await api.get<UserAdmin[]>('/api/v1/users', {
    params: { approval_status: 'pending' },
  })
  return data
}

export async function reviewUser(id: string, action: 'approve' | 'reject'): Promise<UserAdmin> {
  const { data } = await api.patch<UserAdmin>(`/api/v1/users/${id}/${action}`)
  return data
}

export async function listJobs(): Promise<BackgroundJob[]> {
  const { data } = await api.get<BackgroundJob[]>('/api/v1/jobs', { params: { limit: 10 } })
  return data
}

export async function listKeywords(): Promise<Keyword[]> {
  const { data } = await api.get<Keyword[]>('/api/v1/keywords')
  return data
}

export async function updateMyKeywords(keywordIds: string[]): Promise<Keyword[]> {
  const { data } = await api.put<Keyword[]>('/api/v1/users/me/keywords', {
    keyword_ids: keywordIds,
  })
  return data
}

export async function createCustomKeyword(name: string): Promise<Keyword> {
  const { data } = await api.post<Keyword>('/api/v1/users/me/keywords/custom', { name })
  return data
}

export async function getPersonalFeed(page = 1, size = 30): Promise<PersonalizedNewsPage> {
  const { data } = await api.get<PersonalizedNewsPage>('/api/v1/feed', {
    params: { page, size },
  })
  return data
}

export async function getNews(params: {
  q?: string
  keyword_ids?: string[]
  importance?: Importance
  category?: string
  page?: number
  size?: number
}): Promise<PersonalizedNewsPage> {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  params.keyword_ids?.forEach((id) => search.append('keyword_ids', id))
  if (params.importance) search.set('importance', params.importance)
  if (params.category) search.set('category', params.category)
  search.set('page', String(params.page ?? 1))
  search.set('size', String(params.size ?? 30))
  const { data } = await api.get<PersonalizedNewsPage>(`/api/v1/news?${search.toString()}`)
  return data
}

export async function listPersonalReports(): Promise<PersonalReport[]> {
  const { data } = await api.get<PersonalReport[]>('/api/v1/personal-reports')
  return data
}

export async function getLatestPersonalReport(): Promise<PersonalReport | null> {
  const { data } = await api.get<PersonalReport | null>('/api/v1/personal-reports/latest')
  return data
}

export async function getPersonalReport(id: string): Promise<PersonalReport> {
  const { data } = await api.get<PersonalReport>(`/api/v1/personal-reports/${id}`)
  return data
}

export async function markPersonalReportViewed(id: string, opened = false): Promise<void> {
  await api.post(`/api/v1/personal-reports/${id}/view`, {
    popup_seen: true,
    opened,
  })
}
