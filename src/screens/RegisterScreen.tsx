import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native'

import { register } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { Screen } from '../components/Screen'
import type { AuthStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import { errorMessage } from '../utils'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    mutationFn: () => register({ name: name.trim(), email: email.trim(), password }),
    onSuccess: () =>
      Alert.alert('가입 신청을 보냈어요', '관리자 승인 후 로그인할 수 있어요.', [
        { text: '로그인으로', onPress: () => navigation.goBack() },
      ]),
  })

  const submit = () => {
    if (password.length < 6) return Alert.alert('비밀번호를 확인해 주세요', '6자 이상 입력해 주세요.')
    if (password !== confirm) return Alert.alert('비밀번호가 달라요', '두 비밀번호를 다시 확인해 주세요.')
    mutation.mutate()
  }

  return (
    <Screen eyebrow="WELCOME TO MINT" title="가입 신청">
      <Text style={styles.lead}>사내 이메일로 신청해 주세요. 승인 소식이 오면 바로 시작할 수 있어요.</Text>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <Field label="이름" value={name} onChangeText={setName} placeholder="이름을 입력해 주세요" />
        <Field
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="name@motrexev.com"
          keyboardType="email-address"
        />
        <Field label="비밀번호" value={password} onChangeText={setPassword} placeholder="6자 이상" secure />
        <Field label="비밀번호 확인" value={confirm} onChangeText={setConfirm} placeholder="한 번 더 입력해 주세요" secure />
        {mutation.isError ? <Text style={styles.error}>{errorMessage(mutation.error)}</Text> : null}
        <ActionButton
          label="가입 신청 보내기"
          loading={mutation.isPending}
          disabled={!name.trim() || !email.trim() || !password || !confirm}
          onPress={submit}
        />
        <ActionButton label="로그인으로 돌아가기" variant="secondary" onPress={() => navigation.goBack()} />
      </KeyboardAvoidingView>
    </Screen>
  )
}

function Field({
  label,
  secure,
  ...props
}: {
  label: string
  secure?: boolean
  value: string
  onChangeText: (value: string) => void
  placeholder: string
  keyboardType?: 'email-address'
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        secureTextEntry={secure}
        autoCapitalize="none"
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  lead: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginTop: -spacing.sm },
  form: {
    padding: spacing.xl,
    gap: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldWrap: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 13, fontWeight: '800' },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.background,
  },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19 },
})
