import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, StyleSheet, Text, View } from 'react-native'

import { listPendingUsers, reviewUser } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { MoreStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import { errorMessage, formatDate } from '../utils'

type Props = NativeStackScreenProps<MoreStackParamList, 'UserApprovals'>

export function UserApprovalsScreen(_: Props) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['users', 'pending'], queryFn: listPendingUsers })
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) => reviewUser(id, action),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['users', 'pending'] }),
    onError: (error) => Alert.alert('처리하지 못했어요', errorMessage(error)),
  })

  return (
    <Screen eyebrow="ADMIN" title="가입 승인" refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Text style={styles.lead}>새로운 팀원의 가입 신청을 확인해 주세요.</Text>
      {query.isLoading ? <LoadingState /> : null}
      {query.data?.map((user) => (
        <View key={user.id} style={styles.card}>
          <View><Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text></View>
          <Text style={styles.date}>신청일 {formatDate(user.created_at)}</Text>
          <View style={styles.actions}>
            <View style={styles.action}><ActionButton label="승인하기" loading={mutation.isPending && mutation.variables?.id === user.id && mutation.variables.action === 'approve'} onPress={() => mutation.mutate({ id: user.id, action: 'approve' })} /></View>
            <View style={styles.action}><ActionButton label="거절" variant="secondary" loading={mutation.isPending && mutation.variables?.id === user.id && mutation.variables.action === 'reject'} onPress={() => mutation.mutate({ id: user.id, action: 'reject' })} /></View>
          </View>
        </View>
      ))}
      {query.data?.length === 0 ? <EmptyState title="기다리는 가입 신청이 없어요" description="새로운 신청이 오면 이곳에 알려드릴게요." /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  lead: { color: colors.textMuted, fontSize: 14, marginTop: -spacing.sm },
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontSize: 17, fontWeight: '900' },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  date: { color: colors.textFaint, fontSize: 11 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
})
