import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { getNews, listKeywords } from '../api/mintApi'
import { ImportanceBadge } from '../components/Badge'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { BoardStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'
import { formatDate } from '../utils'

type Props = NativeStackScreenProps<BoardStackParamList, 'Board'>
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' })

export function BoardScreen({ navigation }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [queryText, setQueryText] = useState('')
  const [keywordId, setKeywordId] = useState<string | undefined>()
  const keywords = useQuery({ queryKey: ['keywords'], queryFn: listKeywords })
  const news = useQuery({
    queryKey: ['news', queryText, keywordId],
    queryFn: () => getNews({ q: queryText || undefined, keyword_ids: keywordId ? [keywordId] : undefined, size: 50 }),
  })
  const orderedKeywords = useMemo(
    () => [...(keywords.data ?? [])].sort((a, b) => Number(b.selected) - Number(a.selected)),
    [keywords.data],
  )

  return (
    <Screen
      eyebrow="MINT NEWS"
      title="뉴스"
      refreshing={news.isRefetching}
      onRefresh={() => news.refetch()}
      right={
        <Pressable onPress={() => setSearchOpen((open) => !open)} hitSlop={8}>
          <Ionicons name={searchOpen ? 'close' : 'search-outline'} size={22} color={colors.text} />
        </Pressable>
      }
    >
      {searchOpen ? (
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.textFaint} />
          <TextInput
            autoFocus
            value={queryText}
            onChangeText={setQueryText}
            placeholder="제목과 요약 검색"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />
        </View>
      ) : null}

      <View style={styles.filters}>
        <Pressable onPress={() => setKeywordId(undefined)} style={[styles.filter, !keywordId && styles.filterActive]}>
          <Text style={[styles.filterText, !keywordId && styles.filterTextActive]}>전체</Text>
        </Pressable>
        {orderedKeywords.map((keyword) => (
          <Pressable
            key={keyword.id}
            onPress={() => setKeywordId(keyword.id)}
            style={[styles.filter, keywordId === keyword.id && styles.filterActive]}
          >
            <Text style={[styles.filterText, keywordId === keyword.id && styles.filterTextActive]}>
              {keyword.selected ? '★ ' : ''}{keyword.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{keywordId ? orderedKeywords.find((item) => item.id === keywordId)?.name : '전체 뉴스'}</Text>
        <Text style={styles.sectionCount}>{news.data?.total ?? 0} STORIES</Text>
      </View>

      {news.isLoading ? <LoadingState /> : null}
      {news.data?.items.map((post) => (
        <Pressable
          key={post.id}
          onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          style={styles.article}
        >
          <View style={styles.tags}>
            {post.matched_keywords.map((item) => <Text key={item.id} style={styles.tag}>{item.name}</Text>)}
          </View>
          <Text style={styles.title}>{post.title}</Text>
          {post.summary ? <Text numberOfLines={2} style={styles.summary}>{post.summary}</Text> : null}
          <View style={styles.meta}>
            <Text style={styles.source}>{post.source_name ?? '출처 정보 없음'} · {formatDate(post.collected_at)}</Text>
            <ImportanceBadge value={post.importance} />
          </View>
        </Pressable>
      ))}
      {!news.isLoading && !news.data?.items.length ? <EmptyState title="조건에 맞는 뉴스가 없어요" /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  search: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  input: { flex: 1, minHeight: 42, color: colors.text, fontSize: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  filterActive: { backgroundColor: colors.text },
  filterText: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  filterTextActive: { color: '#fff' },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: spacing.sm, borderBottomWidth: 3, borderColor: colors.text },
  sectionTitle: { color: colors.text, fontFamily: serif, fontSize: 22, fontWeight: '900' },
  sectionCount: { color: colors.textFaint, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  article: { gap: spacing.sm, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { color: colors.mintDark, fontSize: 9, fontWeight: '900' },
  title: { color: colors.text, fontFamily: serif, fontSize: 18, lineHeight: 25, fontWeight: '900' },
  summary: { color: colors.textMuted, fontSize: 12, lineHeight: 19 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  source: { flex: 1, color: colors.textFaint, fontSize: 9 },
})
