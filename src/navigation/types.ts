import type { NavigatorScreenParams } from '@react-navigation/native'

export type HomeStackParamList = {
  Dashboard: undefined
  PostDetail: { postId: string }
  ReportDetail: { reportId: string }
  KeywordSettings: undefined
}

export type BoardStackParamList = {
  Board: undefined
  PostDetail: { postId: string }
}

export type ChatStackParamList = {
  Chat: undefined
  PostDetail: { postId: string }
}

export type ReportsStackParamList = {
  Reports: undefined
  ReportDetail: { reportId: string }
  PostDetail: { postId: string }
}

export type MoreStackParamList = {
  More: undefined
  Search: undefined
  Inquiries: undefined
  InquiryDetail: { inquiryId: string }
  UserApprovals: undefined
  Jobs: undefined
  Help: undefined
  KeywordSettings: undefined
  PostDetail: { postId: string }
}

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>
  NewsTab: NavigatorScreenParams<BoardStackParamList>
  ChatTab: NavigatorScreenParams<ChatStackParamList>
  ReportsTab: NavigatorScreenParams<ReportsStackParamList>
  MoreTab: NavigatorScreenParams<MoreStackParamList>
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}
