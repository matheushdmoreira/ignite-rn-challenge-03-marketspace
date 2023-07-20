import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useTheme } from 'native-base';
import { House, SignOut, Tag } from 'phosphor-react-native';
import { Platform } from 'react-native';

import { useAuth } from '@hooks/useAuth';
import { Advert } from '@screens/Advert';
import { Adverts } from '@screens/Adverts';
import { Home } from '@screens/Home';

type TabRoutes = {
  home: undefined;
  adverts: undefined;
  signOut: undefined;
  advert: { advertId: string };
};

export type TabNavigatorRoutesProps = BottomTabNavigationProp<TabRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<TabRoutes>();

function LogoutComponent() {
  return null;
}

export function TabRoutes() {
  const { sizes, colors } = useTheme();

  const { signOut } = useAuth();

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.gray[500],
        tabBarInactiveTintColor: colors.gray[300],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 'auto' : 96,
          paddingBottom: sizes[10],
          paddingTop: sizes[6],
        },
      }}
    >
      <Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <House color={color} weight={focused ? 'bold' : 'regular'} />
          ),
        }}
      />

      <Screen
        name="adverts"
        component={Adverts}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Tag color={color} weight={focused ? 'bold' : 'regular'} />
          ),
        }}
      />

      <Screen
        name="signOut"
        component={LogoutComponent}
        options={{
          tabBarIcon: () => <SignOut color={colors.red[500]} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            signOut();
          },
        }}
      />

      <Screen
        name="advert"
        component={Advert}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Navigator>
  );
}
