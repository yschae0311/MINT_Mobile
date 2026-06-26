import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { createInquiry, listInquiries, listMyInquiries } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { MoreStackParamList } from '../navigation/types'
import { useAuthStore } from '../store/authStore'
import { colors, radius, spacing } from '../theme'
import { errorMessage, formatDate } from '../utils'

type Props = NativeStackScreenProps<MoreStackParamList, 'Inquiries'>
const statusLabel = { open: '답변 기다리는 중', answered: '답변이 왔어요', closed: '마무리됨' } as const

export function InquiriesScreen({ navigation }: Props) {
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin')
  const queryClient = useQueryClient()
  const [writing, setWriting] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const query = useQuery({ queryKey: ['inquiries', isAdmin ? 'admin' : 'mine'], queryFn: isAdmin ? listInquiries : listMyInquiries })
  const create = useMutation({
    mutationFn: () => createInquiry(title.trim(), body.trim()),
    onSuccess: (result) => {
      setWriting(false); setTitle(''); setBody('')
      void queryClient.invalidateQueries({ queryKey: ['inquiries'] })
      navigation.navigate('InquiryDetail', { inquiryId: result.id })
    },
    onError: (error) => Alert.alert('문의를 보내지 못했어요', errorMessage(error)),
  })

  return (
    <Screen
      eyebrow={isAdmin ? 'ADMIN SUPPORT' : 'MINT SUPPORT'}
      title={isAdmin ? '문의 관리' : '문의하기'}
      refreshing={query.isRefetching}
      onRefresh={() => query.refetch()}
      right={!isAdmin ? <Pressable onPress={() => setWriting((value) => !value)} style={styles.newButton}><Text style={styles.newButtonText}>{writing ? '닫기' : '새 문의'}</Text></Pressable> : undefined}
    >
      {!isAdmin ? <Text style={styles.lead}>불편한 점이나 바라는 기능이 있다면 편하게 이야기해 주세요.</Text> : null}
      {writing ? (
        <View style={styles.form}>
          <TextInput value={title} onChangeText={setTitle} placeholder="어떤 내용인가요?" placeholderTextColor={colors.textFaint} style={styles.input} />
          <TextInput value={body} onChangeText={setBody} placeholder="자세한 내용을 남겨주세요" placeholderTextColor={colors.textFaint} multiline style={[styles.input, styles.textarea]} />
          <ActionButton label="문의 보내기" loading={create.isPending} disabled={!title.trim() || !body.trim()} onPress={() => create.mutate()} />
        </View>
      ) : null}
      {query.isLoading ? <LoadingState /> : null}
      {query.data?.map((item) => (
        <Pressable key={item.id} onPress={() => navigation.navigate('InquiryDetail', { inquiryId: item.id })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.cardTop}><Text style={styles.status}>{statusLabel[item.status]}</Text><Text style={styles.date}>{formatDate(item.updated_at)}</Text></View>
          <Text style={styles.title}>{item.title}</Text>
          {isAdmin ? <Text style={styles.author}>{item.user.name} · {item.user.email}</Text> : null}
        </Pressable>
      ))}
      {query.data?.length === 0 ? <EmptyState title={isAdmin ? '새로 들어온 문의가 없어요' : '아직 남긴 문의가 없어요'} description={isAdmin ? '새 문의가 오면 이곳에서 확인할 수 있어요.' : '궁금한 점이 생기면 언제든 편하게 남겨주세요.'} /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  lead: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: -spacing.sm },
  newButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.mintSoft },
  newButtonText: { color: colors.mintDark, fontSize: 12, fontWeight: '900' },
  form: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { minHeight: 46, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { color: colors.mintDark, fontSize: 11, fontWeight: '900' },
  date: { color: colors.textFaint, fontSize: 11 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  author: { color: colors.textMuted, fontSize: 12 },
  pressed: { opacity: 0.7 },
})
