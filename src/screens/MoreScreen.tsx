import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { listInquiries, listJobs, listMyInquiries, listPendingUsers } from '../api/mintApi'
import { GlassHighlight, GlassSurface } from '../components/GlassSurface'
import type { MoreStackParamList } from '../navigation/types'
import { useAuthStore } from '../store/authStore'
import { colors, radius, spacing } from '../theme'
import { Screen } from '../components/Screen'

type Props = NativeStackScreenProps<MoreStackParamList, 'More'>

export function MoreScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'
  const inquiries = useQuery({
    queryKey: ['inquiries', isAdmin ? 'admin' : 'mine'],
    queryFn: isAdmin ? listInquiries : listMyInquiries,
  })
  const pendingUsers = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: listPendingUsers,
    enabled: isAdmin,
  })
  const jobs = useQuery({ queryKey: ['jobs'], queryFn: listJobs, enabled: isAdmin })
  const openCount = inquiries.data?.filter((item) => item.status === 'open').length ?? 0
  const activeJobs = jobs.data?.filter((job) => job.status === 'pending' || job.status === 'running').length ?? 0

  return (
    <Screen eyebrow="MORE MINT" title="더보기">
      <View style={styles.profileScene}>
        <LinearGradient
          colors={['#DDF7ED', '#DCEFF8', '#F7EFE2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <GlassSurface style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0] || 'M'}</Text></View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <GlassHighlight />
        </GlassSurface>
      </View>

      <MenuItem icon="search-outline" title="통합 검색" subtitle="기사와 소스를 한 번에 찾아보세요" onPress={() => navigation.navigate('Search')} />
      <MenuItem icon="pricetags-outline" title="관심 키워드" subtitle="내 1면과 리포트에 반영할 주제를 골라요" onPress={() => navigation.navigate('KeywordSettings')} />
      <MenuItem
        icon="chatbox-ellipses-outline"
        title={isAdmin ? '문의 관리' : '문의하기'}
        subtitle={isAdmin ? '사용자 문의를 확인하고 답변해요' : '궁금한 점을 편집장에게 남겨보세요'}
        badge={openCount}
        onPress={() => navigation.navigate('Inquiries')}
      />
      {isAdmin ? (
        <>
          <MenuItem
            icon="person-add-outline"
            title="가입 승인"
            subtitle="새로운 팀원의 가입 신청을 확인해요"
            badge={pendingUsers.data?.length ?? 0}
            onPress={() => navigation.navigate('UserApprovals')}
          />
          <MenuItem
            icon="sync-outline"
            title="작업 상태"
            subtitle="수집과 리포트 작업 진행 상황을 살펴봐요"
            badge={activeJobs}
            onPress={() => navigation.navigate('Jobs')}
          />
        </>
      ) : null}
      <MenuItem icon="help-circle-outline" title="MINT 사용 안내" subtitle="기능과 자주 묻는 질문을 확인해요" onPress={() => navigation.navigate('Help')} />
    </Screen>
  )
}

function MenuItem({
  icon, title, subtitle, badge = 0, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  badge?: number
  onPress: () => void
}) {
  return (
    <GlassSurface interactive intensity={68} style={styles.itemGlass}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
        <View style={styles.icon}><Ionicons name={icon} size={22} color={colors.mintDark} /></View>
        <View style={styles.itemText}><Text style={styles.itemTitle}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
        {badge > 0 ? <Text style={styles.badge}>{badge}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>
      <GlassHighlight />
    </GlassSurface>
  )
}

const styles = StyleSheet.create({
  profileScene: { overflow: 'hidden', borderRadius: 26 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 26 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mintDark },
  avatarText: { color: '#fff', fontSize: 21, fontWeight: '900' },
  profileText: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 17, fontWeight: '900' },
  email: { color: colors.textMuted, fontSize: 12 },
  itemGlass: { borderRadius: 22 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 22 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mintSoft },
  itemText: { flex: 1, gap: 3 },
  itemTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  badge: { minWidth: 24, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', textAlign: 'center', color: '#fff', backgroundColor: colors.high, fontSize: 11, fontWeight: '900' },
  pressed: { opacity: 0.7 },
})
