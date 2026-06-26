import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type ParamListBase,
  type RouteProp,
} from '@react-navigation/native'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { getPersonalReport, markPersonalReportViewed } from '../api/mintApi'
import { ImportanceBadge } from '../components/Badge'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import { colors, spacing } from '../theme'
import { errorMessage, formatReportDate } from '../utils'

type DetailRoute = RouteProp<{ ReportDetail: { reportId: string } }, 'ReportDetail'>
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })

export function ReportDetailScreen() {
  const route = useRoute<DetailRoute>()
  const navigation = useNavigation<NavigationProp<ParamListBase>>()
  const query = useQuery({
    queryKey: ['personal-report', route.params.reportId],
    queryFn: async () => {
      const report = await getPersonalReport(route.params.reportId)
      await markPersonalReportViewed(route.params.reportId, true)
      return report
    },
  })

  if (query.isLoading) return <Screen><Back onPress={() => navigation.goBack()} /><LoadingState /></Screen>
  if (!query.data || query.isError) {
    return (
      <Screen>
        <Back onPress={() => navigation.goBack()} />
        <EmptyState title="리포트를 불러오지 못했어요" description={query.error ? errorMessage(query.error) : undefined} />
      </Screen>
    )
  }

  const report = query.data
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Back onPress={() => navigation.goBack()} />
      <View style={styles.cover}>
        <View style={styles.rule} />
        <Text style={styles.label}>MY DAILY REPORT · {formatReportDate(report.report_date)}</Text>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.summary}>{report.summary}</Text>
        <Text style={styles.count}>관심 키워드 뉴스 {report.item_count}건</Text>
      </View>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>오늘의 뉴스</Text>
        <Text style={styles.sectionCount}>{report.item_count} STORIES</Text>
      </View>
      {report.items.map((item) => (
        <Pressable
          key={item.post.id}
          onPress={() => navigation.navigate('PostDetail', { postId: item.post.id })}
          style={styles.article}
        >
          <Text style={styles.rank}>{String(item.rank).padStart(2, '0')}</Text>
          <View style={styles.body}>
            <View style={styles.tags}>
              {item.matched_keyword_names.map((name) => <Text key={name} style={styles.tag}>{name}</Text>)}
            </View>
            <Text style={styles.articleTitle}>{item.post.title}</Text>
            {item.post.summary ? <Text numberOfLines={3} style={styles.articleSummary}>{item.post.summary}</Text> : null}
          </View>
          <ImportanceBadge value={item.post.importance} />
        </Pressable>
      ))}
    </Screen>
  )
}

function Back({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back}>
      <Ionicons name="chevron-back" size={20} color={colors.text} />
      <Text style={styles.backText}>리포트</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  cover: { gap: spacing.lg, paddingVertical: spacing.md },
  rule: { height: 4, backgroundColor: colors.text },
  label: { color: colors.mintDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontFamily: serif, fontSize: 29, lineHeight: 38, fontWeight: '900' },
  summary: { color: colors.text, fontSize: 15, lineHeight: 25 },
  count: { color: colors.textFaint, fontSize: 10, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: spacing.sm, borderBottomWidth: 2, borderColor: colors.text },
  sectionTitle: { color: colors.text, fontFamily: serif, fontSize: 21, fontWeight: '900' },
  sectionCount: { color: colors.textFaint, fontSize: 8, fontWeight: '900' },
  article: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rank: { width: 24, color: colors.textFaint, fontFamily: serif, fontSize: 14, fontWeight: '900' },
  body: { flex: 1, gap: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { color: colors.mintDark, fontSize: 9, fontWeight: '900' },
  articleTitle: { color: colors.text, fontFamily: serif, fontSize: 17, lineHeight: 24, fontWeight: '900' },
  articleSummary: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
})
