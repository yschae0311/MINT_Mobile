import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { fetchMe, login } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { useAuthStore } from '../store/authStore'
import { colors, radius, spacing } from '../theme'
import { errorMessage } from '../utils'
import type { AuthStackParamList } from '../navigation/types'

function loginErrorMessage(error: unknown): string {
  const message = errorMessage(error)
  if (message === 'Invalid email or password') {
    return '이메일이나 비밀번호를 다시 확인해 주세요.'
  }
  if (message === 'Account pending approval') {
    return '계정 승인을 기다리고 있어요. 승인 후 다시 로그인해 주세요.'
  }
  if (message === 'Account registration rejected') {
    return '사용할 수 없는 계정이에요. 관리자에게 문의해 주세요.'
  }
  if (message === 'Account is inactive') {
    return '현재 비활성화된 계정이에요. 관리자에게 문의해 주세요.'
  }
  return message
}

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props) {
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secure, setSecure] = useState(true)

  const mutation = useMutation({
    mutationFn: async () => {
      const credentials = await login(email.trim(), password)
      useAuthStore.setState({ token: credentials.access_token })
      try {
        const user = await fetchMe()
        await setSession(credentials.access_token, user)
      } catch (error) {
        await useAuthStore.getState().clearSession()
        throw error
      }
    },
  })

  const disabled = !email.trim() || !password

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.product}>MINT</Text>
          <Text style={styles.title}>오늘의 EV 소식을{'\n'}가볍게 살펴보세요</Text>
          <Text style={styles.description}>
            꼭 알아야 할 업계 소식과 AI 인사이트를 한곳에서 편하게 만나볼 수 있어요.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>MINT에 로그인해 주세요</Text>
          <View style={styles.field}>
            <Ionicons name="mail-outline" size={19} color={colors.textFaint} />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="이메일"
              placeholderTextColor={colors.textFaint}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.textFaint} />
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              placeholder="비밀번호"
              placeholderTextColor={colors.textFaint}
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={() => !disabled && mutation.mutate()}
              style={styles.input}
            />
            <Pressable onPress={() => setSecure((value) => !value)} hitSlop={10}>
              <Ionicons
                name={secure ? 'eye-outline' : 'eye-off-outline'}
                size={19}
                color={colors.textFaint}
              />
            </Pressable>
          </View>
          {mutation.isError ? (
            <Text style={styles.error}>{loginErrorMessage(mutation.error)}</Text>
          ) : null}
          <ActionButton
            label="로그인"
            disabled={disabled}
            loading={mutation.isPending}
            onPress={() => mutation.mutate()}
          />
          <Text style={styles.notice}>승인된 사내 계정으로 이용할 수 있어요.</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>처음이신가요? 가입 신청하기</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xxl },
  hero: { gap: spacing.md },
  logo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.mintDark,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  product: { color: colors.mintDark, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 32, lineHeight: 41, fontWeight: '900', letterSpacing: -1 },
  description: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  form: {
    padding: spacing.xl,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: spacing.xs },
  field: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
  notice: { color: colors.textFaint, fontSize: 12, textAlign: 'center' },
  registerLink: { color: colors.mintDark, fontSize: 13, fontWeight: '800', textAlign: 'center' },
})
