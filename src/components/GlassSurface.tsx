import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import type { PropsWithChildren } from 'react'
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

interface GlassSurfaceProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>
  tint?: 'light' | 'dark'
  tintColor?: string
  interactive?: boolean
  intensity?: number
  nativeGlass?: boolean
}

export function GlassSurface({
  children,
  style,
  tint = 'light',
  tintColor,
  interactive = false,
  intensity = 82,
  nativeGlass = true,
}: GlassSurfaceProps) {
  const resolvedTintColor =
    tintColor ?? (tint === 'dark' ? 'rgba(24,72,55,0.22)' : 'rgba(255,255,255,0.16)')

  if (nativeGlass && Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView
        glassEffectStyle="clear"
        colorScheme={tint}
        tintColor={resolvedTintColor}
        isInteractive={interactive}
        style={[styles.surface, style]}
      >
        {children}
      </GlassView>
    )
  }

  return (
    <BlurView
      tint={tint === 'dark' ? 'dark' : 'extraLight'}
      intensity={intensity}
      blurMethod="dimezisBlurViewSdk31Plus"
      style={[
        styles.surface,
        tint === 'dark' ? styles.darkFallback : styles.lightFallback,
        { backgroundColor: resolvedTintColor },
        style,
      ]}
    >
      {children}
    </BlurView>
  )
}

export function GlassHighlight() {
  return <View pointerEvents="none" style={styles.highlight} />
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  lightFallback: { backgroundColor: 'rgba(255,255,255,0.30)' },
  darkFallback: {
    backgroundColor: 'rgba(16,42,34,0.38)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
})
