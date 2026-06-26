import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, radius, spacing } from '../theme'

const editions = [
  {
    term: ['OCPP', '충전기와 운영 서버(CSMS)가 상태와 충전 세션을 주고받는 표준 통신이에요.'],
    fact: '전기차 배터리는 추운 날 효율이 떨어지고 난방에도 에너지를 써서 주행거리가 줄어들 수 있어요.',
    quiz: ['충전량을 나타내는 단위는 무엇일까요?', ['kW', 'kWh', 'V'], 1, 'kWh는 에너지와 충전량, kW는 순간 출력을 나타내요.'],
  },
  {
    term: ['V2G', '전기차가 전력망과 에너지를 양방향으로 주고받는 기술이에요.'],
    fact: 'SOC가 높아질수록 충전 속도가 줄어드는 건 배터리의 수명과 안전을 지키기 위해서예요.',
    quiz: ['Plug & Charge와 가장 관련 깊은 표준은?', ['ISO 15118', 'HTTP/2', 'Bluetooth LE'], 0, 'ISO 15118은 차량과 충전기 사이의 보안 통신을 다뤄요.'],
  },
  {
    term: ['eMSP', '앱과 카드, 로밍을 통해 운전자에게 충전 서비스를 제공하는 사업자예요.'],
    fact: '완속 충전은 출력은 낮지만 업무나 수면처럼 오래 머무는 시간과 함께 쓰기 좋아요.',
    quiz: ['CPO가 주로 맡는 일은?', ['충전 인프라 운영', '차량 제조', '배터리 채굴'], 0, 'CPO는 충전소와 충전기를 운영하는 주체예요.'],
  },
] as const

export function DailyCorner() {
  const edition = useMemo(() => editions[Math.floor(Date.now() / 86_400_000) % editions.length]!, [])
  const [picked, setPicked] = useState<number | null>(null)
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>잠깐 쉬어가기</Text>
      <Text style={styles.heading}>오늘의 EV 한 스푼</Text>
      <View style={styles.block}><Text style={styles.label}>오늘의 용어 · {edition.term[0]}</Text><Text style={styles.body}>{edition.term[1]}</Text></View>
      <View style={styles.block}><Text style={styles.label}>알아두면 좋은 이야기</Text><Text style={styles.body}>{edition.fact}</Text></View>
      <View style={styles.block}>
        <Text style={styles.label}>가벼운 퀴즈</Text>
        <Text style={styles.question}>{edition.quiz[0]}</Text>
        {edition.quiz[1].map((option, index) => (
          <Pressable key={option} disabled={picked !== null} onPress={() => setPicked(index)} style={[styles.option, picked !== null && index === edition.quiz[2] && styles.correct, picked === index && index !== edition.quiz[2] && styles.wrong]}>
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
        {picked !== null ? <Text style={styles.explanation}>{picked === edition.quiz[2] ? '정답이에요! ' : '아쉽지만, '} {edition.quiz[3]}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { padding: spacing.xl, gap: spacing.lg, borderRadius: radius.xl, backgroundColor: '#FFFDF7', borderWidth: 1, borderColor: '#EEE7D7' },
  eyebrow: { color: colors.medium, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  heading: { color: colors.text, fontSize: 20, fontWeight: '900' },
  block: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 13, fontWeight: '900' },
  body: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  question: { color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '700' },
  option: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  correct: { backgroundColor: colors.mintSoft, borderColor: colors.mint },
  wrong: { backgroundColor: colors.highSoft, borderColor: colors.high },
  optionText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  explanation: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
})
