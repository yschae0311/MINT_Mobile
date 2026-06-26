import { StyleSheet, Text, View } from 'react-native'

import { Screen } from '../components/Screen'
import { colors, radius, spacing } from '../theme'

const items = [
  ['중요 뉴스와 AI 탐문은 어떻게 달라요?', '중요 뉴스는 신뢰할 수 있는 소스에서 모은 자료예요. AI 탐문은 관련성이 있어 보여 먼저 발견한 후보라서 한 번 더 살펴보면 좋아요.'],
  ['MINT AI는 어떤 자료로 답하나요?', '먼저 MINT에 수집된 기사와 AI 요약을 찾아 답해요. 자료가 없으면 일반 지식으로 찾아볼지 먼저 물어봐요.'],
  ['원문은 어디서 볼 수 있나요?', '기사 상세의 ‘원문 열기’를 누르면 원래 기사를 확인할 수 있어요.'],
  ['리포트는 언제 만들어지나요?', '자동 스케줄이 켜져 있다면 매일 아침 만들어져요. 필요할 때는 웹 운영 화면에서 직접 만들 수도 있어요.'],
]

export function HelpScreen() {
  return (
    <Screen eyebrow="MINT GUIDE" title="MINT 사용 안내">
      <View style={styles.hero}><Text style={styles.heroTitle}>MINT는 이런 일을 해요</Text><Text style={styles.heroBody}>EV·충전 업계 소식을 모으고, AI가 핵심과 영향을 정리해 팀이 함께 읽기 좋은 브리핑으로 만들어요.</Text></View>
      {items.map(([question, answer]) => (
        <View key={question} style={styles.card}><Text style={styles.question}>{question}</Text><Text style={styles.answer}>{answer}</Text></View>
      ))}
      <View style={styles.tip}><Text style={styles.tipTitle}>조금 더 궁금하다면</Text><Text style={styles.tipBody}>MINT AI에게 물어보거나 문의 메뉴에서 편집장에게 편하게 남겨주세요.</Text></View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { padding: spacing.xl, gap: spacing.sm, borderRadius: radius.xl, backgroundColor: colors.mintDark },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  heroBody: { color: '#E4F5EF', fontSize: 14, lineHeight: 22 },
  card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  question: { color: colors.text, fontSize: 15, fontWeight: '900' },
  answer: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  tip: { padding: spacing.lg, gap: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.mintSoft },
  tipTitle: { color: colors.mintDark, fontSize: 14, fontWeight: '900' },
  tipBody: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
})
