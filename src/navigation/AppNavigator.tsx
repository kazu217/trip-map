import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Settings } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { BookingImportScreen } from '../screens/BookingImportScreen';
import { NotebookPageScreen } from '../screens/NotebookPageScreen';
import { NotebookScreen } from '../screens/NotebookScreen';
import { PlanFormScreen } from '../screens/PlanFormScreen';
import { PlanListScreen } from '../screens/PlanListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SpotDetailScreen } from '../screens/SpotDetailScreen';
import { SpotFormScreen } from '../screens/SpotFormScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { TripFormScreen } from '../screens/TripFormScreen';
import { RootTabParamList, TripsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<TripsStackParamList>();

const TripsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '800' },
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TripMap' }} />
      <Stack.Screen name="TripForm" component={TripFormScreen} options={{ title: '旅行' }} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: '旅行詳細' }} />
      <Stack.Screen name="SpotForm" component={SpotFormScreen} options={{ title: 'スポット' }} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} options={{ title: 'スポット詳細' }} />
      <Stack.Screen name="BookingImport" component={BookingImportScreen} options={{ title: '予約を読み取る' }} />
      <Stack.Screen name="Notebook" component={NotebookScreen} options={{ title: '自由ノート' }} />
      <Stack.Screen name="NotebookPage" component={NotebookPageScreen} options={{ title: 'ノートページ' }} />
      <Stack.Screen name="PlanList" component={PlanListScreen} options={{ title: 'やること' }} />
      <Stack.Screen name="PlanForm" component={PlanFormScreen} options={{ title: 'やること' }} />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border
            }
          }}
        >
          <Tab.Screen
            name="Trips"
            component={TripsStack}
            options={{
              title: '旅行',
              tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: '設定',
              tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};
