import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { createCustomKeyword, listKeywords, updateMyKeywords } from '../api/mintApi'
import { EmptyState, LoadingState, Screen } from '../components/Screen'
import type { HomeStackParamList, MoreStackParamList } from '../navigation/types'
import { colors, radius, spacing } from '../theme'

type Props =
  | NativeStackScreenProps<HomeStackParamList, 'KeywordSettings'>
  | NativeStackScreenProps<MoreStackParamList, 'KeywordSettings'>

export function KeywordSettingsScreen({ navigation }: Props) {
  const qc = useQueryClient()
  const query = useQuery({ queryKey: ['keywords'], queryFn: listKeywords })
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  useEffect(() => {
    if (query.data) setSelected(query.data.filter((item) => item.selected).map((item) => item.id))
  }, [query.data])

  const save = useMutation({
    mutationFn: () => updateMyKeywords(selected),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['keywords'] }),
        qc.invalidateQueries({ queryKey: ['personal-feed'] }),
        qc.invalidateQueries({ queryKey: ['personal-reports'] }),
      ])
      navigation.goBack()
    },
  })
  const add = useMutation({
    mutationFn: () => createCustomKeyword(custom),
    onSuccess: async (keyword) => {
      setCustom('')
      setSelected((current) => [...new Set([...current, keyword.id])])
      await qc.invalidateQueries({ queryKey: ['keywords'] })
    },
  })

  if (query.isLoading) return <Screen><LoadingState /></Screen>
  if (!query.data) return <Screen><EmptyState title="키워드를 불러오지 못했어요" /></Screen>

  return (
    <Screen eyebrow="MY INTERESTS" title="관심 키워드">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={19} color={colors.text} />
        <Text style={styles.backText}>돌아가기</Text>
      </Pressable>
      <Text style={styles.lead}>세 개 이상 선택하면 내 1면과 데일리 리포트가 만들어져요.</Text>

      <View style={styles.customRow}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="직접 키워드 추가"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />
        <Pressable
          disabled={!custom.trim() || add.isPending}
          onPress={() => add.mutate()}
          style={styles.addButton}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {query.data.map((keyword) => {
          const active = selected.includes(keyword.id)
          return (
            <Pressable
              key={keyword.id}
              onPress={() =>
                setSelected((current) =>
                  active ? current.filter((id) => id !== keyword.id) : [...current, keyword.id],
                )
              }
              style={[styles.keyword, active && styles.keywordActive]}
            >
              <Text style={[styles.keywordText, active && styles.keywordTextActive]}>{keyword.name}</Text>
              {active ? <Ionicons name="checkmark-circle" size={17} color={colors.mintDark} /> : null}
            </Pressable>
          )
        })}
      </View>

      {save.isError ? <Text style={styles.error}>관심 키워드는 최소 3개를 선택해야 해요.</Text> : null}
      <Pressable
        disabled={selected.length < 3 || save.isPending}
        onPress={() => save.mutate()}
        style={[styles.save, selected.length < 3 && styles.saveDisabled]}
      >
        <Text style={styles.saveText}>{selected.length}개 키워드로 시작하기</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  backText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  lead: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  customRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  addButton: { width: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.mintDark },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  keyword: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surface },
  keywordActive: { borderColor: colors.mint, backgroundColor: colors.mintSoft },
  keywordText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  keywordTextActive: { color: colors.mintDark },
  error: { color: colors.high, fontSize: 12 },
  save: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.text },
  saveDisabled: { opacity: 0.35 },
  saveText: { color: '#fff', fontSize: 13, fontWeight: '900' },
})
