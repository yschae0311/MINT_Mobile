import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'

import { addInquiryMessage, closeInquiry, getInquiry } from '../api/mintApi'
import { ActionButton } from '../components/ActionButton'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { MoreStackParamList } from '../navigation/types'
import { useAuthStore } from '../store/authStore'
import { colors, radius, spacing } from '../theme'
import { errorMessage, formatDate } from '../utils'

type Props = NativeStackScreenProps<MoreStackParamList, 'InquiryDetail'>

export function InquiryDetailScreen({ route }: Props) {
  const { inquiryId } = route.params
  const isAdmin = useAuthStore((state) => state.user?.role === 'admin')
  const queryClient = useQueryClient()
  const [reply, setReply] = useState('')
  const query = useQuery({ queryKey: ['inquiry', inquiryId], queryFn: () => getInquiry(inquiryId) })
  const send = useMutation({
    mutationFn: () => addInquiryMessage(inquiryId, reply.trim()),
    onSuccess: () => { setReply(''); void queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] }); void queryClient.invalidateQueries({ queryKey: ['inquiries'] }) },
    onError: (error) => Alert.alert('메시지를 보내지 못했어요', errorMessage(error)),
  })
  const close = useMutation({
    mutationFn: () => closeInquiry(inquiryId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['inquiry', inquiryId] }); void queryClient.invalidateQueries({ queryKey: ['inquiries'] }) },
    onError: (error) => Alert.alert('문의를 마무리하지 못했어요', errorMessage(error)),
  })

  return (
    <Screen eyebrow="CONVERSATION" title={query.data?.title || '문의 내용'} refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? <EmptyState title="문의 내용을 불러오지 못했어요" actionLabel="다시 불러오기" onAction={() => query.refetch()} /> : null}
      {query.data ? (
        <>
          <Text style={styles.meta}>{query.data.user.name} · {formatDate(query.data.created_at)}</Text>
          {query.data.messages.map((message) => {
            const adminMessage = message.author.role === 'admin'
            return (
              <View key={message.id} style={[styles.message, adminMessage ? styles.adminMessage : styles.userMessage]}>
                <Text style={styles.author}>{adminMessage ? 'MINT 편집장' : message.author.name}</Text>
                <Text style={styles.body}>{message.body}</Text>
                <Text style={styles.date}>{formatDate(message.created_at)}</Text>
              </View>
            )
          })}
          {query.data.status !== 'closed' ? (
            <View style={styles.reply}>
              <TextInput value={reply} onChangeText={setReply} multiline placeholder={isAdmin ? '따뜻한 답변을 남겨주세요' : '추가로 궁금한 점을 남겨주세요'} placeholderTextColor={colors.textFaint} style={styles.input} />
              <ActionButton label={isAdmin ? '답변 보내기' : '메시지 보내기'} loading={send.isPending} disabled={!reply.trim()} onPress={() => send.mutate()} />
              {isAdmin ? <ActionButton label="문의 마무리하기" variant="secondary" loading={close.isPending} onPress={() => close.mutate()} /> : null}
            </View>
          ) : <Text style={styles.closed}>이 문의는 잘 마무리되었어요.</Text>}
        </>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  meta: { color: colors.textMuted, fontSize: 12, marginTop: -spacing.sm },
  message: { maxWidth: '90%', padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg },
  adminMessage: { alignSelf: 'flex-start', backgroundColor: colors.mintSoft },
  userMessage: { alignSelf: 'flex-end', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  author: { color: colors.mintDark, fontSize: 11, fontWeight: '900' },
  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
  date: { color: colors.textFaint, fontSize: 10 },
  reply: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { minHeight: 100, padding: spacing.md, textAlignVertical: 'top', borderRadius: radius.md, backgroundColor: colors.background, color: colors.text },
  closed: { color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
})
