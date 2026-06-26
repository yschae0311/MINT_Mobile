import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { getLatestPersonalReport, listPersonalReports } from '../api/mintApi'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { ReportsStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import { formatReportDate } from '../utils'

type Props = NativeStackScreenProps<ReportsStackParamList, 'Reports'>
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })

export function ReportsScreen({ navigation }: Props) {
  const latest = useQuery({ queryKey: ['personal-reports', 'latest'], queryFn: getLatestPersonalReport })
  const archive = useQuery({ queryKey: ['personal-reports'], queryFn: listPersonalReports })

  return (
    <Screen eyebrow="MY DAILY REPORT" title="데일리 리포트">
      {latest.isLoading ? <LoadingState /> : null}
      {latest.data ? (
        <Pressable onPress={() => navigation.navigate('ReportDetail', { reportId: latest.data!.id })} style={styles.latest}>
          <View style={styles.rule} />
          <Text style={styles.label}>LATEST ISSUE · {formatReportDate(latest.data.report_date)}</Text>
          <Text style={styles.title}>{latest.data.title}</Text>
          <Text style={styles.summary}>{latest.data.summary}</Text>
          <View style={styles.footer}>
            <Text style={styles.count}>핵심 뉴스 {latest.data.item_count}건</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.text} />
          </View>
        </Pressable>
      ) : !latest.isLoading ? <EmptyState title="오늘 관심 키워드에 맞는 새 소식이 없어요" /> : null}

      <View style={styles.archiveHead}>
        <Text style={styles.archiveTitle}>지난 리포트</Text>
        <Text style={styles.archiveCount}>{Math.max((archive.data?.length ?? 0) - 1, 0)} ISSUES</Text>
      </View>
      {(archive.data ?? []).slice(1).map((report) => (
        <Pressable key={report.id} onPress={() => navigation.navigate('ReportDetail', { reportId: report.id })} style={styles.row}>
          <Text style={styles.date}>{formatReportDate(report.report_date)}</Text>
          <Text numberOfLines={1} style={styles.rowTitle}>{report.title}</Text>
          <Text style={styles.rowCount}>{report.item_count}건</Text>
        </Pressable>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  latest: { gap: spacing.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  rule: { height: 4, backgroundColor: colors.text },
  label: { color: colors.mintDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontFamily: serif, fontSize: 25, lineHeight: 33, fontWeight: '900' },
  summary: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: colors.textFaint, fontSize: 10, fontWeight: '800' },
  archiveHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: spacing.sm, borderBottomWidth: 2, borderColor: colors.text },
  archiveTitle: { color: colors.text, fontFamily: serif, fontSize: 21, fontWeight: '900' },
  archiveCount: { color: colors.textFaint, fontSize: 8, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  date: { width: 82, color: colors.textFaint, fontSize: 9 },
  rowTitle: { flex: 1, color: colors.text, fontFamily: serif, fontSize: 14, fontWeight: '800' },
  rowCount: { color: colors.mintDark, fontSize: 9, fontWeight: '900' },
})
