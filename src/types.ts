export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'
export type BoardType = 'trusted' | 'discovery'
export type PostStatus = 'pending' | 'published' | 'hidden' | 'deleted' | 'promoted'
export type Importance = 'high' | 'medium' | 'low' | 'unknown'
export type TrustLevel = 'high' | 'medium' | 'low'

export interface User {
  id: string
  organization_id: string
  email: string
  name: string
  role: UserRole
  approval_status: 'pending' | 'approved' | 'rejected'
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterResponse {
  message: string
  status: string
}

export interface AIOutput {
  id: string
  summary: string
  impact: string | null
  action_items: string[] | null
  importance: Importance
  confidence: number | null
  model: string
  prompt_version: string
  created_at: string
}

export interface Post {
  id: string
  organization_id: string
  source_id: string | null
  source_name: string | null
  board_type: BoardType
  title: string
  original_url: string | null
  published_at: string | null
  collected_at: string
  raw_content: string
  category: string | null
  status: PostStatus
  trust_level: TrustLevel
  reliability_score: number
  importance: Importance
  created_by: string
  created_at: string
  updated_at: string
  latest_ai?: AIOutput | null
}

export interface PostDetail extends Post {
  keywords: unknown
  ai_outputs: AIOutput[]
}

export interface PaginatedPosts {
  items: Post[]
  total: number
  page: number
  size: number
  pages: number
}

export interface DashboardPostPreview {
  id: string
  title: string
  source_name: string | null
  source_type?: string | null
  board_type: BoardType
  status: PostStatus
  importance: Importance
  collected_at: string
  original_url: string | null
  ai_summary: string | null
}

export interface DashboardStats {
  new_today: number
  trusted_count: number
  pending_discovery: number
  high_importance: number
  active_sources: number
  total_sources: number
  discovery_pending_retention_days: number
  latest_report: {
    id: string
    title: string
    report_date: string
    summary: string
    slack_sent: boolean
    illustration_url: string | null
    highlights: {
      title: string
      description: string | null
      importance: Importance | null
    }[]
  } | null
  trusted_preview: DashboardPostPreview[]
  discovery_preview: DashboardPostPreview[]
  community_voices_preview?: DashboardPostPreview[]
}

export interface KeyChange {
  title: string
  description: string
  related_post_ids?: string[]
  importance?: Importance
}

export interface DailyReport {
  id: string
  organization_id: string
  report_date: string
  title: string
  summary: string
  key_changes: KeyChange[] | null
  risks: string[] | null
  action_items: string[] | null
  model: string
  slack_sent: boolean
  illustration_url: string | null
  created_at: string
  updated_at: string
}

export interface DailyReportDetail extends DailyReport {
  items: {
    id: string
    post_id: string
    reason: string | null
    importance: Importance
    post?: Post | null
  }[]
}

export interface SearchResponse {
  query: string
  posts: {
    id: string
    title: string
    board_type: BoardType
    source_name: string | null
    summary: string | null
    original_url: string | null
  }[]
  sources: {
    id: string
    name: string
    url: string
    category: string | null
  }[]
}

export interface ChatCitation {
  post_id: string
  title: string
  url: string | null
  summary: string | null
}

export interface ChatResponse {
  reply: string
  citations: ChatCitation[]
  needs_general_confirm: boolean
  source: 'mint' | 'general' | null
}

export type InquiryStatus = 'open' | 'answered' | 'closed'

export interface InquiryAuthor {
  id: string
  name: string
  email: string
  role: string
}

export interface Inquiry {
  id: string
  organization_id: string
  user_id: string
  title: string
  status: InquiryStatus
  created_at: string
  updated_at: string
  user: InquiryAuthor
}

export interface InquiryDetail extends Inquiry {
  messages: {
    id: string
    inquiry_id: string
    author_id: string
    body: string
    created_at: string
    author: InquiryAuthor
  }[]
}

export interface UserAdmin extends User {
  created_at: string
}

export type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export interface BackgroundJob {
  id: string
  status: JobStatus
  label: string
  progress_current: number
  progress_total: number
  progress_message: string | null
  result_message: string | null
  error: string | null
  created_at: string
}

export interface Keyword {
  id: string
  category_id: string | null
  owner_user_id: string | null
  name: string
  normalized_name: string
  aliases: string[] | null
  scope: 'organization' | 'personal'
  status: 'active' | 'candidate' | 'archived'
  usage_count: number
  selected: boolean
}

export interface PersonalizedNews {
  id: string
  title: string
  source_name: string | null
  category: string | null
  collected_at: string
  original_url: string | null
  importance: Importance
  summary: string | null
  matched_keywords: { id: string; name: string; confidence: number }[]
  personalization_score: number
}

export interface PersonalizedNewsPage {
  items: PersonalizedNews[]
  total: number
  page: number
  size: number
  pages: number
}

export interface PersonalReport {
  id: string
  report_date: string
  title: string
  summary: string
  item_count: number
  popup_seen: boolean
  items: {
    post: PersonalizedNews
    rank: number
    score: number
    matched_keyword_names: string[]
  }[]
}
