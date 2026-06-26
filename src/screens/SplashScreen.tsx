import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, spacing } from '../theme'

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>M</Text>
      </View>
      <Text style={styles.name}>MINT</Text>
      <Text style={styles.tagline}>EV Intelligence & News Tracker</Text>
      <ActivityIndicator style={styles.loader} color={colors.mint} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.mintDark,
  },
  logoText: { color: '#fff', fontSize: 34, fontWeight: '900' },
  name: { marginTop: spacing.lg, color: colors.text, fontSize: 28, fontWeight: '900' },
  tagline: { marginTop: spacing.xs, color: colors.textMuted, fontSize: 12 },
  loader: { marginTop: spacing.xxl },
})
