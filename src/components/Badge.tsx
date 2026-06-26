import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../theme'
import type { Importance, PostStatus } from '../types'
import { importanceLabel, statusLabel } from '../utils'

export function ImportanceBadge({ value }: { value: Importance }) {
  const tone = {
    high: { bg: colors.highSoft, fg: colors.high },
    medium: { bg: colors.mediumSoft, fg: colors.medium },
    low: { bg: colors.lowSoft, fg: colors.low },
    unknown: { bg: colors.lowSoft, fg: colors.textMuted },
  }[value]
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.text, { color: tone.fg }]}>{importanceLabel(value)}</Text>
    </View>
  )
}

export function StatusBadge({ value }: { value: PostStatus }) {
  const highlighted = value === 'pending'
  return (
    <View style={[styles.badge, { backgroundColor: highlighted ? colors.infoSoft : colors.lowSoft }]}>
      <Text style={[styles.text, { color: highlighted ? colors.info : colors.low }]}>
        {statusLabel(value)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '800' },
})
