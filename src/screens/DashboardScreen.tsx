import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import {
  getLatestPersonalReport,
  getPersonalFeed,
  listKeywords,
  markPersonalReportViewed,
} from '../api/mintApi'
import { ImportanceBadge } from '../components/Badge'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { HomeStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import { formatDate } from '../utils'

type Props = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })

export function DashboardScreen({ navigation }: Props) {
  const qc = useQueryClient()
  const keywords = useQuery({ queryKey: ['keywords'], queryFn: listKeywords })
  const selected = keywords.data?.filter((item) => item.selected) ?? []
  const enabled = selected.length >= 3
  const feed = useQuery({
    queryKey: ['personal-feed'],
    queryFn: () => getPersonalFeed(1, 30),
    enabled,
  })
  const report = useQuery({
    queryKey: ['personal-reports', 'latest'],
    queryFn: getLatestPersonalReport,
    enabled,
  })
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    setPopupOpen(Boolean(report.data && !report.data.popup_seen))
  }, [report.data])

  const closePopup = async () => {
    if (report.data) await markPersonalReportViewed(report.data.id)
    setPopupOpen(false)
    await qc.invalidateQueries({ queryKey: ['personal-reports', 'latest'] })
  }

  if (keywords.isLoading) return <Screen><LoadingState /></Screen>
  if (!enabled) {
    return (
      <Screen eyebrow="MY MINT" title="내 관심 뉴스">
        <View style={styles.onboarding}>
          <Text style={styles.onboardingTitle}>관심 키워드를 골라주세요</Text>
          <Text style={styles.onboardingBody}>세 개 이상 선택하면 내 1면과 데일리 리포트가 시작돼요.</Text>
          <Pressable onPress={() => navigation.navigate('KeywordSettings')} style={styles.primaryButton}>
            <Text style={styles.primaryText}>키워드 선택하기</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </Pressable>
        </View>
      </Screen>
    )
  }

  return (
    <Screen
      eyebrow="MY MINT DAILY"
      title="내 관심 뉴스"
      refreshing={feed.isRefetching}
      onRefresh={() => Promise.all([feed.refetch(), report.refetch()]).then(() => undefined)}
      right={
        <Pressable onPress={() => navigation.navigate('KeywordSettings')} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={colors.text} />
        </Pressable>
      }
    >
      <View style={styles.keywordRow}>
        {selected.map((keyword) => <Text key={keyword.id} style={styles.keyword}>{keyword.name}</Text>)}
      </View>

      {report.data ? (
        <Pressable onPress={() => navigation.navigate('ReportDetail', { reportId: report.data!.id })} style={styles.brief}>
          <View style={styles.briefTop}>
            <Text style={styles.briefLabel}>오늘의 개인 브리핑</Text>
            <Text style={styles.briefCount}>{report.data.item_count}건</Text>
          </View>
          <Text numberOfLines={3} style={styles.briefSummary}>{report.data.summary}</Text>
          <Text style={styles.briefLink}>리포트 읽기 →</Text>
        </Pressable>
      ) : null}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>키워드 뉴스</Text>
        <Text style={styles.sectionCount}>{feed.data?.total ?? 0} STORIES</Text>
      </View>

      {feed.isLoading ? <LoadingState /> : null}
      {feed.data?.items.map((post) => (
        <Pressable
          key={post.id}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          style={styles.article}
        >
          <View style={styles.tags}>
            {post.matched_keywords.map((item) => <Text key={item.id} style={styles.tag}>{item.name}</Text>)}
          </View>
          <Text style={styles.articleTitle}>{post.title}</Text>
          {post.summary ? <Text numberOfLines={3} style={styles.summary}>{post.summary}</Text> : null}
          <View style={styles.articleMeta}>
            <Text style={styles.source}>{post.source_name ?? '출처 정보 없음'} · {formatDate(post.collected_at)}</Text>
            <ImportanceBadge value={post.importance} />
          </View>
        </Pressable>
      ))}
      {!feed.isLoading && !feed.data?.items.length ? <EmptyState title="관심 키워드에 맞는 새 소식이 없어요" /> : null}

      <Modal transparent animationType="fade" visible={popupOpen} onRequestClose={() => void closePopup()}>
        <View style={styles.modalRoot}>
          <Pressable onPress={() => void closePopup()} style={StyleSheet.absoluteFill} />
          {report.data ? (
            <View style={styles.popup}>
              <Text style={styles.popupLabel}>NEW DAILY REPORT</Text>
              <Text style={styles.popupTitle}>오늘의 개인 리포트가 도착했어요</Text>
              <Text style={styles.popupSummary}>{report.data.summary}</Text>
              <Text style={styles.popupCount}>관심 뉴스 {report.data.item_count}건</Text>
              <Pressable
                onPress={async () => {
                  await markPersonalReportViewed(report.data!.id, true)
                  setPopupOpen(false)
                  navigation.navigate('ReportDetail', { reportId: report.data!.id })
                }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryText}>지금 읽기</Text>
                <Ionicons name="arrow-forward" size={17} color="#fff" />
              </Pressable>
              <Pressable onPress={() => void closePopup()} style={styles.laterButton}>
                <Text style={styles.laterText}>나중에 볼게요</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  onboarding: { gap: spacing.lg, paddingVertical: spacing.xxl, borderTopWidth: 4, borderBottomWidth: 1, borderColor: colors.text },
  onboardingTitle: { color: colors.text, fontFamily: serif, fontSize: 27, fontWeight: '900' },
  onboardingBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  primaryButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.text },
  primaryText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  keyword: { overflow: 'hidden', paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill, color: colors.mintDark, backgroundColor: colors.mintSoft, fontSize: 11, fontWeight: '800' },
  brief: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  briefTop: { flexDirection: 'row', justifyContent: 'space-between' },
  briefLabel: { color: colors.mintDark, fontSize: 10, fontWeight: '900' },
  briefCount: { color: colors.textFaint, fontSize: 10, fontWeight: '800' },
  briefSummary: { color: colors.text, fontFamily: serif, fontSize: 18, lineHeight: 26, fontWeight: '800' },
  briefLink: { color: colors.mintDark, fontSize: 11, fontWeight: '900' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: spacing.sm, borderBottomWidth: 3, borderColor: colors.text },
  sectionTitle: { color: colors.text, fontFamily: serif, fontSize: 22, fontWeight: '900' },
  sectionCount: { color: colors.textFaint, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  article: { gap: spacing.sm, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { color: colors.mintDark, fontSize: 9, fontWeight: '900' },
  articleTitle: { color: colors.text, fontFamily: serif, fontSize: 18, lineHeight: 25, fontWeight: '900' },
  summary: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  source: { flex: 1, color: colors.textFaint, fontSize: 9 },
  modalRoot: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: 'rgba(18,29,25,0.45)' },
  popup: { gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.surface },
  popupLabel: { color: colors.mintDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  popupTitle: { color: colors.text, fontFamily: serif, fontSize: 25, lineHeight: 32, fontWeight: '900' },
  popupSummary: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  popupCount: { color: colors.textFaint, fontSize: 11, fontWeight: '800' },
  laterButton: { alignItems: 'center', paddingVertical: spacing.sm },
  laterText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
})
