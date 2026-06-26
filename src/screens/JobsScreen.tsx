import { useQuery } from '@tanstack/react-query'
import { StyleSheet, Text, View } from 'react-native'

import { listJobs } from '../api/mintApi'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import { colors, radius, spacing } from '../theme'
import { formatDate } from '../utils'

const labels = { pending: '준비 중', running: '진행 중', success: '완료', failed: '실패', cancelled: '취소됨' } as const

export function JobsScreen() {
  const query = useQuery({ queryKey: ['jobs'], queryFn: listJobs, refetchInterval: 5000 })
  return (
    <Screen eyebrow="BACKGROUND JOBS" title="작업 상태" refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Text style={styles.lead}>수집과 AI 리포트 작업이 어디까지 진행됐는지 확인할 수 있어요.</Text>
      {query.isLoading ? <LoadingState /> : null}
      {query.data?.map((job) => {
        const progress = job.progress_total ? Math.round((job.progress_current / job.progress_total) * 100) : 0
        return (
          <View key={job.id} style={styles.card}>
            <View style={styles.top}><Text style={styles.label}>{job.label}</Text><Text style={styles.status}>{labels[job.status]}</Text></View>
            {job.progress_message ? <Text style={styles.message}>{job.progress_message}</Text> : null}
            {(job.status === 'running' || job.status === 'pending') && job.progress_total > 0 ? <View style={styles.bar}><View style={[styles.fill, { width: `${progress}%` }]} /></View> : null}
            {job.error ? <Text style={styles.error}>{job.error}</Text> : null}
            <Text style={styles.date}>{formatDate(job.created_at)}</Text>
          </View>
        )
      })}
      {query.data?.length === 0 ? <EmptyState title="최근 작업 내역이 없어요" /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  lead: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: -spacing.sm },
  card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  label: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '800' },
  status: { color: colors.mintDark, fontSize: 11, fontWeight: '900' },
  message: { color: colors.textMuted, fontSize: 12 },
  bar: { height: 6, overflow: 'hidden', borderRadius: 3, backgroundColor: colors.surfaceMuted },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.mint },
  error: { color: colors.danger, fontSize: 12 },
  date: { color: colors.textFaint, fontSize: 10 },
})
