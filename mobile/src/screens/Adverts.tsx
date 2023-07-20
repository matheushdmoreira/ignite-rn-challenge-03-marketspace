import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Center,
  FlatList,
  HStack,
  Heading,
  Text,
  VStack,
  useTheme,
  useToast,
} from 'native-base';
import { Plus } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';

import { AdProps } from '@dtos/AdvertDTO';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { AdItem } from '@components/AdItem';
import { Loading } from '@components/Loading';
import { Select } from '@components/Select';

type AdsProps = AdProps[];

export function Adverts() {
  const [isLoading, setIsLoading] = useState(false);
  const [ads, setAds] = useState<AdsProps>([]);

  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  function handleOpenAdvert(advertId: string) {
    navigation.navigate('myAdvert', { advertId });
  }

  function handleOpenAdvertCreate() {
    navigation.navigate('advertCreate');
  }

  async function fetchProducts() {
    setIsLoading(true);

    try {
      const response = await api.get('/users/products');

      setAds(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar os anúncios.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} position="relative">
      <HStack pt={20} pb={6} px={6} justifyContent="center" position="relative">
        <Heading fontSize="lg" color="gray.600">
          Meus anúncios
        </Heading>

        <TouchableOpacity
          style={{ position: 'absolute', bottom: 24, right: 24 }}
          onPress={handleOpenAdvertCreate}
        >
          <Plus size={24} color={colors.gray[600]} />
        </TouchableOpacity>
      </HStack>

      <VStack flex={1} px={6}>
        <HStack pt={2} alignItems="center" mb={5}>
          <Text flex={1} fontSize="sm" color="gray.500">
            {ads.length} anúncios
          </Text>

          <Select />
        </HStack>

        <FlatList
          flex={1}
          data={ads}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AdItem
              data={item}
              onPress={() => handleOpenAdvert(String(item.id))}
            />
          )}
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          ListEmptyComponent={() => (
            <Center>
              <Text textAlign="center" color="gray.400">
                Não há anúncios registrados ainda. {'\n'}
                Vamos registrar um anúncio?
              </Text>
            </Center>
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 20 }}
        />
      </VStack>
    </VStack>
  );
}
