import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing } from '../theme'
import type { BoardType, Importance, PostStatus } from '../types'
import { formatDate } from '../utils'
import { ImportanceBadge, StatusBadge } from './Badge'

interface PostCardProps {
  post: {
    title: string
    source_name: string | null
    collected_at: string
    importance: Importance
    board_type: BoardType
    status: PostStatus
    category?: string | null
    ai_summary?: string | null
    latest_ai?: { summary: string } | null
  }
  onPress: () => void
}

export function PostCard({ post, onPress }: PostCardProps) {
  const summary = post.ai_summary ?? post.latest_ai?.summary
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.badges}>
        <ImportanceBadge value={post.importance} />
        {post.board_type === 'discovery' ? <StatusBadge value={post.status} /> : null}
        {post.category ? <Text style={styles.category}>{post.category}</Text> : null}
      </View>
      <Text style={styles.title}>{post.title}</Text>
      {summary ? (
        <Text numberOfLines={3} style={styles.summary}>
          {summary}
        </Text>
      ) : null}
      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.meta}>
          {post.source_name || '출처 정보 없음'} · {formatDate(post.collected_at)}
        </Text>
        <Ionicons name="chevron-forward" size={17} color={colors.textFaint} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.995 }] },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  category: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  title: { color: colors.text, fontSize: 17, lineHeight: 24, fontWeight: '800', letterSpacing: -0.2 },
  summary: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flex: 1, color: colors.textFaint, fontSize: 12, fontWeight: '600' },
})
