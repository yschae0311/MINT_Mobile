import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, type Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { GlassSurface } from '../components/GlassSurface'
import { colors } from '../theme'
import { useAuthStore } from '../store/authStore'
import { BoardScreen } from '../screens/BoardScreen'
import { ChatScreen } from '../screens/ChatScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { HelpScreen } from '../screens/HelpScreen'
import { InquiriesScreen } from '../screens/InquiriesScreen'
import { InquiryDetailScreen } from '../screens/InquiryDetailScreen'
import { JobsScreen } from '../screens/JobsScreen'
import { KeywordSettingsScreen } from '../screens/KeywordSettingsScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { MoreScreen } from '../screens/MoreScreen'
import { PostDetailScreen } from '../screens/PostDetailScreen'
import { RegisterScreen } from '../screens/RegisterScreen'
import { ReportDetailScreen } from '../screens/ReportDetailScreen'
import { ReportsScreen } from '../screens/ReportsScreen'
import { SearchScreen } from '../screens/SearchScreen'
import { SplashScreen } from '../screens/SplashScreen'
import { UserApprovalsScreen } from '../screens/UserApprovalsScreen'
import type {
  AuthStackParamList,
  BoardStackParamList,
  ChatStackParamList,
  HomeStackParamList,
  MainTabParamList,
  MoreStackParamList,
  ReportsStackParamList,
} from './types'

const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const BoardStack = createNativeStackNavigator<BoardStackParamList>()
const ChatStack = createNativeStackNavigator<ChatStackParamList>()
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>()
const MoreStack = createNativeStackNavigator<MoreStackParamList>()
const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const Tabs = createBottomTabNavigator<MainTabParamList>()

const theme: Theme = {
  dark: false,
  colors: {
    primary: colors.mintDark,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.high,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
}

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
} as const

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="PostDetail" component={PostDetailScreen} />
      <HomeStack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <HomeStack.Screen name="KeywordSettings" component={KeywordSettingsScreen} />
    </HomeStack.Navigator>
  )
}

function NewsNavigator() {
  return (
    <BoardStack.Navigator screenOptions={screenOptions}>
      <BoardStack.Screen name="Board" component={BoardScreen} />
      <BoardStack.Screen name="PostDetail" component={PostDetailScreen} />
    </BoardStack.Navigator>
  )
}

function ChatNavigator() {
  return (
    <ChatStack.Navigator screenOptions={screenOptions}>
      <ChatStack.Screen name="Chat" component={ChatScreen} />
      <ChatStack.Screen name="PostDetail" component={PostDetailScreen} />
    </ChatStack.Navigator>
  )
}

function ReportsNavigator() {
  return (
    <ReportsStack.Navigator screenOptions={screenOptions}>
      <ReportsStack.Screen name="Reports" component={ReportsScreen} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} />
      <ReportsStack.Screen name="PostDetail" component={PostDetailScreen} />
    </ReportsStack.Navigator>
  )
}

function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="More" component={MoreScreen} />
      <MoreStack.Screen name="Search" component={SearchScreen} />
      <MoreStack.Screen name="Inquiries" component={InquiriesScreen} />
      <MoreStack.Screen name="InquiryDetail" component={InquiryDetailScreen} />
      <MoreStack.Screen name="UserApprovals" component={UserApprovalsScreen} />
      <MoreStack.Screen name="Jobs" component={JobsScreen} />
      <MoreStack.Screen name="Help" component={HelpScreen} />
      <MoreStack.Screen name="KeywordSettings" component={KeywordSettingsScreen} />
      <MoreStack.Screen name="PostDetail" component={PostDetailScreen} />
    </MoreStack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.mintDark,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          paddingTop: 5,
          paddingBottom: 7,
          borderTopWidth: 0,
          borderRadius: 24,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: '#183C31',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.07,
          shadowRadius: 18,
        },
        tabBarBackground: () => (
          <GlassSurface intensity={88} style={styles.tabBarGlass} />
        ),
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 1 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home-outline',
            NewsTab: 'newspaper-outline',
            ChatTab: 'sparkles',
            ReportsTab: 'document-text-outline',
            MoreTab: 'ellipsis-horizontal-circle-outline',
          }
          const isAi = route.name === 'ChatTab'
          return (
            <View style={[
              styles.tabIcon,
              isAi && styles.aiTabIcon,
              isAi && focused && styles.aiTabIconFocused,
            ]}>
              <Ionicons
                name={focused && !isAi ? icons[route.name].replace('-outline', '') as keyof typeof Ionicons.glyphMap : icons[route.name]}
                size={isAi ? 21 : size}
                color={isAi ? colors.mintDark : color}
              />
            </View>
          )
        },
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeNavigator} options={{ title: '1면' }} />
      <Tabs.Screen name="NewsTab" component={NewsNavigator} options={{ title: '뉴스' }} />
      <Tabs.Screen
        name="ChatTab"
        component={ChatNavigator}
        options={{ title: 'MINT AI' }}
      />
      <Tabs.Screen name="ReportsTab" component={ReportsNavigator} options={{ title: '리포트' }} />
      <Tabs.Screen name="MoreTab" component={MoreNavigator} options={{ title: '더보기' }} />
    </Tabs.Navigator>
  )
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  )
}

export function AppNavigator() {
  const { token, hydrated, restoreSession } = useAuthStore()

  useEffect(() => {
    void restoreSession()
  }, [restoreSession])

  if (!hydrated) return <SplashScreen />

  return (
    <NavigationContainer theme={theme}>
      {token ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 34,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  aiTabIcon: {
    width: 40,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(70, 177, 137, 0.10)',
  },
  aiTabIconFocused: {
    backgroundColor: 'rgba(70, 177, 137, 0.20)',
  },
  tabBarGlass: {
    flex: 1,
    borderRadius: 24,
  },
})
