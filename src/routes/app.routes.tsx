import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { TabRoutes } from './tab.routes';

import { Advert } from '@screens/Advert';
import { AdvertCreate } from '@screens/AdvertCreate';
import { AdvertEdit } from '@screens/AdvertEdit';
import { MyAdvert } from '@screens/MyAdvert';
import { MyAdvertPreview } from '@screens/MyAdvertPreview';

type AppRoutes = {
  app: { screen: 'home' | 'adverts' | 'signOut' };
  advert: {
    advertId?: string;
  };
  myAdvert: {
    advertId?: string;
  };
  advertCreate: undefined;
  advertEdit: { advertId?: string };
  myAdvertPreview: {
    advertId?: string;
    name?: string;
    description?: string;
    price?: string;
    product_images?: any[];
    payment_methods?: string[];
    type?: boolean;
    accept_trade?: boolean;
    is_active?: boolean;
  };
};

export type AppNavigatorRoutesProps = NativeStackNavigationProp<AppRoutes>;

const { Navigator, Screen } = createNativeStackNavigator<AppRoutes>();

export function AppRoutes() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="app"
    >
      <Screen name="app" component={TabRoutes} />

      <Screen name="advert" component={Advert} />

      <Screen name="myAdvert" component={MyAdvert} />

      <Screen name="advertCreate" component={AdvertCreate} />

      <Screen name="advertEdit" component={AdvertEdit} />

      <Screen name="myAdvertPreview" component={MyAdvertPreview} />
    </Navigator>
  );
}
