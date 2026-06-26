import type { PropsWithChildren, ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, spacing } from '../theme'

interface ScreenProps extends PropsWithChildren {
  title?: string
  eyebrow?: string
  right?: ReactNode
  refreshing?: boolean
  onRefresh?: () => void
  scroll?: boolean
}

export function Screen({
  children,
  title,
  eyebrow,
  right,
  refreshing = false,
  onRefresh,
  scroll = true,
}: ScreenProps) {
  const header = title ? (
    <View style={styles.header}>
      <View style={styles.heading}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  ) : null

  if (!scroll) {
    return (
      <View style={styles.root}>
        <AmbientBackground />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.content}>
            {header}
            {children}
          </View>
        </SafeAreaView>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.mint} />
            ) : undefined
          }
        >
          {header}
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

function AmbientBackground() {
  return <View pointerEvents="none" style={styles.cleanBackground} />
}

export function LoadingState({ label = '소식을 불러오고 있어요…' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.mint} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7FAF9' },
  safe: { flex: 1, backgroundColor: 'transparent' },
  content: { flexGrow: 1, padding: spacing.lg, paddingBottom: 112, gap: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  heading: { flex: 1, gap: 3 },
  eyebrow: {
    color: colors.mintDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 },
  state: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  stateText: { color: colors.textMuted, fontSize: 14 },
  empty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.mintDark,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700' },
  cleanBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#F7FAF9',
  },
})
