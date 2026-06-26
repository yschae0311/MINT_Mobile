import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { askChat } from '../api/mintApi'
import { GlassHighlight, GlassSurface } from '../components/GlassSurface'
import type { ChatStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import type { ChatCitation } from '../types'
import { errorMessage } from '../utils'
import { Screen } from '../components/Screen'

type Props = NativeStackScreenProps<ChatStackParamList, 'Chat'>
type Message = { id: string; role: 'user' | 'assistant'; body: string; citations?: ChatCitation[]; confirmQuestion?: string }

const suggestions = ['최근 충전 인프라 이슈를 요약해 줘', '중요 뉴스의 최근 흐름이 궁금해', '새로운 EV 정책 변화가 있었어?']

export function ChatScreen({ navigation }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    body: '안녕하세요. MINT에 모인 EV·충전 자료를 바탕으로 함께 찾아볼게요.',
  }])
  const listRef = useRef<FlatList<Message>>(null)
  const mutation = useMutation({
    mutationFn: ({ message, allowGeneral }: { message: string; allowGeneral: boolean }) => askChat(message, allowGeneral),
    onSuccess: (result, variables) => {
      setMessages((prev) => [...prev, {
        id: `${Date.now()}-answer`,
        role: 'assistant',
        body: result.reply,
        citations: result.citations,
        confirmQuestion: result.needs_general_confirm ? variables.message : undefined,
      }])
    },
    onError: (error) => setMessages((prev) => [...prev, { id: `${Date.now()}-error`, role: 'assistant', body: errorMessage(error) }]),
  })

  const submit = (text = input, allowGeneral = false) => {
    const question = text.trim()
    if (!question || mutation.isPending) return
    if (!allowGeneral) {
      setMessages((prev) => [...prev, { id: `${Date.now()}-question`, role: 'user', body: question }])
      setInput('')
    }
    mutation.mutate({ message: question, allowGeneral })
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }

  return (
    <Screen scroll={false} eyebrow="MINT AI" title="무엇이 궁금하세요?">
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={16}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.body, item.role === 'user' && styles.userBody]}>{item.body}</Text>
              {item.citations?.length ? (
                <CitationAccordion
                  citations={item.citations}
                  onPress={(postId) => navigation.navigate('PostDetail', { postId })}
                />
              ) : null}
              {item.confirmQuestion ? (
                <View style={styles.confirm}>
                  <Pressable onPress={() => submit(item.confirmQuestion!, true)} style={styles.confirmButton}>
                    <Text style={styles.confirmText}>일반 지식으로도 찾아보기</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
          ListFooterComponent={mutation.isPending ? <Text style={styles.thinking}>MINT AI가 자료를 살펴보고 있어요…</Text> : null}
        />
        {messages.length === 1 ? (
          <View style={styles.suggestions}>{suggestions.map((item) => (
            <Pressable key={item} onPress={() => submit(item)} style={styles.suggestion}><Text style={styles.suggestionText}>{item}</Text></Pressable>
          ))}</View>
        ) : null}
        <GlassSurface intensity={78} style={styles.composerGlass}>
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="EV·충전 관련 질문을 남겨보세요"
              placeholderTextColor={colors.textFaint}
              multiline
              maxLength={2000}
              style={styles.input}
            />
            <Pressable disabled={!input.trim() || mutation.isPending} onPress={() => submit()} style={styles.send}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </Pressable>
          </View>
          <GlassHighlight />
        </GlassSurface>
      </KeyboardAvoidingView>
    </Screen>
  )
}

function CitationAccordion({
  citations,
  onPress,
}: {
  citations: ChatCitation[]
  onPress: (postId: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.citations}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.citationToggle, pressed && styles.togglePressed]}
      >
        <View style={styles.citationToggleLabel}>
          <Ionicons name="newspaper-outline" size={15} color={colors.mintDark} />
          <Text style={styles.citationToggleText}>참고한 기사 {citations.length}건</Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.mintDark}
        />
      </Pressable>
      {open ? (
        <View style={styles.citationList}>
          {citations.map((citation, index) => (
            <Pressable
              key={citation.post_id}
              onPress={() => onPress(citation.post_id)}
              style={({ pressed }) => [styles.citation, pressed && styles.togglePressed]}
            >
              <Text style={styles.citationNumber}>{index + 1}</Text>
              <View style={styles.citationBody}>
                <Text numberOfLines={2} style={styles.citationText}>{citation.title}</Text>
                {citation.summary ? (
                  <Text numberOfLines={2} style={styles.citationSummary}>{citation.summary}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.sm },
  list: { flexGrow: 1, gap: spacing.md, paddingBottom: spacing.md },
  bubble: { maxWidth: '88%', padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.mintDark },
  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
  userBody: { color: '#fff' },
  citations: { overflow: 'hidden', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  citationToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.mintSoft },
  citationToggleLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  citationToggleText: { color: colors.mintDark, fontSize: 12, fontWeight: '900' },
  citationList: { backgroundColor: colors.surface },
  citation: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  citationNumber: { width: 21, height: 21, textAlign: 'center', textAlignVertical: 'center', borderRadius: 11, overflow: 'hidden', color: colors.mintDark, backgroundColor: colors.mintSoft, fontSize: 10, fontWeight: '900' },
  citationBody: { flex: 1, gap: 3 },
  citationText: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  citationSummary: { color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  togglePressed: { opacity: 0.65 },
  confirm: { marginTop: spacing.xs },
  confirmButton: { padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.mintSoft },
  confirmText: { color: colors.mintDark, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  thinking: { color: colors.textMuted, fontSize: 12, marginVertical: spacing.sm },
  suggestions: { gap: spacing.sm },
  suggestion: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.mintSoft },
  suggestionText: { color: colors.mintDark, fontSize: 12, fontWeight: '700' },
  composerGlass: { borderRadius: 24 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, padding: spacing.sm, borderRadius: 24 },
  input: { flex: 1, maxHeight: 100, minHeight: 42, padding: spacing.sm, color: colors.text, fontSize: 14 },
  send: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.mintDark },
})
