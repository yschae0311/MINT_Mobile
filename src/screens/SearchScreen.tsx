import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { search } from '../api/mintApi'
import { GlassHighlight, GlassSurface } from '../components/GlassSurface'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import { colors, radius, spacing } from '../theme'
import type { MoreStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<MoreStackParamList, 'Search'>

export function SearchScreen({ navigation }: Props) {
  const [input, setInput] = useState('')
  const [queryText, setQueryText] = useState('')
  const query = useQuery({
    queryKey: ['search', queryText],
    queryFn: () => search(queryText),
    enabled: queryText.length > 0,
  })

  const submit = () => {
    const normalized = input.trim()
    if (normalized) setQueryText(normalized)
  }

  return (
    <Screen eyebrow="GLOBAL SEARCH" title="통합 검색">
      <GlassSurface intensity={74} style={styles.searchGlass}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.textFaint} />
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={submit}
            returnKeyType="search"
            autoCapitalize="none"
            placeholder="궁금한 소식이나 키워드를 입력해 보세요"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
          {input ? (
            <Pressable onPress={() => setInput('')} hitSlop={8}>
              <Ionicons name="close-circle" size={19} color={colors.textFaint} />
            </Pressable>
          ) : null}
        </View>
        <GlassHighlight />
      </GlassSurface>

      {!queryText ? (
        <EmptyState
          title="궁금한 소식을 찾아보세요"
          description="기사와 AI 요약, 정보 소스까지 한 번에 찾아드려요."
        />
      ) : null}
      {query.isLoading ? <LoadingState label="검색 중…" /> : null}
      {query.isError ? (
        <EmptyState
          title="검색 결과를 가져오지 못했어요"
          description={query.error.message}
          actionLabel="다시 검색하기"
          onAction={() => query.refetch()}
        />
      ) : null}
      {query.data ? (
        <>
          <Text style={styles.resultTitle}>기사 {query.data.posts.length}건</Text>
          {query.data.posts.map((post) => (
            <Pressable
              key={post.id}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
              style={({ pressed }) => [styles.result, pressed && styles.pressed]}
            >
              <View style={styles.resultTop}>
                <Text style={styles.board}>{post.board_type === 'trusted' ? '중요 뉴스' : 'AI 탐문'}</Text>
                <Text style={styles.source}>{post.source_name || '출처 정보 없음'}</Text>
              </View>
              <Text style={styles.resultItemTitle}>{post.title}</Text>
              {post.summary ? (
                <Text numberOfLines={2} style={styles.summary}>
                  {post.summary}
                </Text>
              ) : null}
            </Pressable>
          ))}

          {query.data.sources.length ? (
            <>
              <Text style={styles.resultTitle}>정보 소스 {query.data.sources.length}건</Text>
              {query.data.sources.map((source) => (
                <View key={source.id} style={styles.sourceCard}>
                  <Ionicons name="globe-outline" size={20} color={colors.mintDark} />
                  <View style={styles.sourceBody}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text numberOfLines={1} style={styles.sourceUrl}>
                      {source.url}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {!query.data.posts.length && !query.data.sources.length ? (
            <EmptyState
              title={`“${query.data.query}”와 관련된 소식이 아직 없어요`}
              description="다른 키워드로 한 번 더 찾아볼까요?"
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  searchGlass: { borderRadius: 22 },
  searchBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 22,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  resultTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: spacing.sm },
  result: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  board: { color: colors.mintDark, fontSize: 11, fontWeight: '900' },
  source: { color: colors.textFaint, fontSize: 11 },
  resultItemTitle: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '800' },
  summary: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceBody: { flex: 1, gap: 3 },
  sourceName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  sourceUrl: { color: colors.textFaint, fontSize: 11 },
  pressed: { opacity: 0.68 },
})
