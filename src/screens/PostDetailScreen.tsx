import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import { getPost, postAction } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { ImportanceBadge, StatusBadge } from '../components/Badge'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import { useAuthStore } from '../store/authStore'
import { colors, radius, spacing } from '../theme'
import { errorMessage, formatDate } from '../utils'

type DetailRoute = RouteProp<{ PostDetail: { postId: string } }, 'PostDetail'>

export function PostDetailScreen() {
  const route = useRoute<DetailRoute>()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canWrite = user?.role === 'admin'
  const { postId } = route.params
  const query = useQuery({ queryKey: ['post', postId], queryFn: () => getPost(postId) })
  const mutation = useMutation({
    mutationFn: (action: 'approve' | 'hide' | 'promote' | 'summarize') =>
      postAction(postId, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['post', postId] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    },
    onError: (error) => Alert.alert('요청을 마치지 못했어요', errorMessage(error)),
  })

  if (query.isLoading) {
    return (
      <Screen>
        <BackButton onPress={() => navigation.goBack()} />
        <LoadingState />
      </Screen>
    )
  }

  if (!query.data || query.isError) {
    return (
      <Screen>
        <BackButton onPress={() => navigation.goBack()} />
        <EmptyState
          title="이 소식을 불러오지 못했어요"
          description={query.error ? errorMessage(query.error) : undefined}
          actionLabel="다시 불러오기"
          onAction={() => query.refetch()}
        />
      </Screen>
    )
  }

  const post = query.data
  const ai = post.ai_outputs[0] ?? post.latest_ai
  const isDiscovery = post.board_type === 'discovery'

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{isDiscovery ? 'AI 탐문' : '중요 뉴스'}</Text>
        <View style={styles.badges}>
          <ImportanceBadge value={post.importance} />
          {isDiscovery ? <StatusBadge value={post.status} /> : null}
          <Text style={styles.trust}>신뢰도 {post.reliability_score}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {post.source_name || '출처 정보 없음'} · {formatDate(post.collected_at)}
        </Text>
        {post.original_url ? (
          <ActionButton
            label="원문 열기"
            onPress={() => {
              void Linking.openURL(post.original_url!)
            }}
          />
        ) : null}
      </View>

      <Section title="AI가 정리한 핵심">
        {ai?.summary ? (
          <Text style={styles.body}>{ai.summary}</Text>
        ) : (
          <Text style={styles.muted}>아직 AI 요약이 준비되지 않았어요.</Text>
        )}
      </Section>

      {ai?.impact ? (
        <Section title="우리에게 미칠 영향">
          <Text style={styles.body}>{ai.impact}</Text>
        </Section>
      ) : null}

      {ai?.action_items?.length ? (
        <Section title="함께 확인해 볼 일">
          {ai.action_items.map((item, index) => (
            <View key={`${item}-${index}`} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      {post.raw_content.trim() ? (
        <Section title="원문 내용">
          <Text style={styles.raw}>{post.raw_content}</Text>
        </Section>
      ) : null}

      {canWrite ? (
        <Section title="기사 관리">
          <View style={styles.actions}>
            <ActionButton
              label={ai ? 'AI 요약 새로 만들기' : 'AI 요약 만들기'}
              variant="secondary"
              loading={mutation.isPending && mutation.variables === 'summarize'}
              onPress={() => mutation.mutate('summarize')}
            />
            {isDiscovery && post.status === 'pending' ? (
              <>
                <ActionButton
                  label="검토 마치기"
                  variant="secondary"
                  loading={mutation.isPending && mutation.variables === 'approve'}
                  onPress={() => mutation.mutate('approve')}
                />
                <ActionButton
                  label="중요 뉴스로 옮기기"
                  loading={mutation.isPending && mutation.variables === 'promote'}
                  onPress={() => mutation.mutate('promote')}
                />
              </>
            ) : null}
            <ActionButton
              label="이 소식 숨기기"
              variant="danger"
              loading={mutation.isPending && mutation.variables === 'hide'}
              onPress={() =>
                Alert.alert(
                  '이 소식을 숨길까요?',
                  '숨기면 목록과 다음 리포트에서 제외돼요.',
                  [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '숨기기',
                      style: 'destructive',
                      onPress: () => mutation.mutate('hide'),
                    },
                  ],
                )
              }
            />
          </View>
        </Section>
      ) : null}
    </Screen>
  )
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.back}>
      <Ionicons name="chevron-back" size={20} color={colors.text} />
      <Text style={styles.backText}>이전으로</Text>
    </Pressable>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 2 },
  backText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  hero: {
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyebrow: { color: colors.mintDark, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  trust: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.lowSoft,
  },
  title: { color: colors.text, fontSize: 26, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7 },
  meta: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  section: {
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  body: { color: colors.text, fontSize: 15, lineHeight: 24 },
  muted: { color: colors.textMuted, fontSize: 14 },
  raw: { color: colors.textMuted, fontSize: 14, lineHeight: 23 },
  bulletRow: { flexDirection: 'row', gap: spacing.md },
  bullet: { width: 6, height: 6, marginTop: 8, borderRadius: 3, backgroundColor: colors.mint },
  bulletText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 22 },
  actions: { gap: spacing.sm },
})
