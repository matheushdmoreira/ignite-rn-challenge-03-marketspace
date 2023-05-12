import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Box,
  Center,
  FlatList,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
  useTheme,
  useToast,
} from 'native-base';
import {
  ArrowRight,
  MagnifyingGlass,
  Plus,
  Sliders,
  Tag,
} from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { AdProps } from '@dtos/AdvertDTO';
import { PaymentMethodsDTO } from '@dtos/PaymentMethodDTO';

import { useAuth } from '@hooks/useAuth';

import { AdItem } from '@components/AdItem';
import { Button } from '@components/Button';
import { FilterModal } from '@components/FilterModal';
import { Loading } from '@components/Loading';
import { UserPhoto } from '@components/UserPhoto';

type ConditionProps = 'new' | 'used' | undefined;

type AdsProps = AdProps[];

export function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ads, setAds] = useState<AdsProps>([]);
  const [numberOfAdsActive, setNumberOfAdsActive] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [acceptExchange, setAcceptExchange] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsDTO[]>([
    'pix',
    'boleto',
    'card',
    'cash',
    'deposit',
  ]);
  const [conditionOfAds, setConditionOfAds] =
    useState<ConditionProps>(undefined);

  const { user } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  function handleToogleAcceptExchange() {
    setAcceptExchange((oldState) => !oldState);
  }

  function handleOpenAdvert(advertId: string) {
    navigation.navigate('advert', { advertId });
  }

  function handleOpenAdvertCreate() {
    navigation.navigate('advertCreate');
  }

  function handleOpenMyAdverts() {
    navigation.navigate('app', { screen: 'adverts' });
  }

  async function handleResetFilter() {
    setSearchText('');
    setAcceptExchange(false);
    setPaymentMethods(['pix', 'boleto', 'card', 'cash', 'deposit']);
    setConditionOfAds(undefined);
  }

  async function handleSearch() {
    await fetchProducts();
  }

  async function handleApplyFilter() {
    setModalVisible(false);

    await fetchProducts();
  }

  async function fetchNumberOfProductsActive() {
    setIsLoading(true);

    try {
      const response = await api.get('/users/products');

      const numberOfAdsActiveData = response.data.filter(
        (ad: any) => ad.is_active === true
      );

      setNumberOfAdsActive(numberOfAdsActiveData.length);
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

  async function fetchProducts() {
    setIsLoading(true);

    try {
      const response = await api.get('/products', {
        params: {
          query: searchText,
          is_new: conditionOfAds && conditionOfAds === 'new',
          accept_trade:
            acceptExchange && acceptExchange === true ? acceptExchange : false,
          payment_methods: paymentMethods,
        },
      });

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
      fetchNumberOfProductsActive();
      fetchProducts();
    }, [])
  );

  return (
    <VStack flex={1} px={6} pt={20}>
      <FilterModal
        visible={modalVisible}
        conditionOfAds={conditionOfAds}
        setConditionOfAds={setConditionOfAds}
        acceptExchange={acceptExchange}
        setAcceptExchange={handleToogleAcceptExchange}
        paymentMethods={paymentMethods}
        setPaymentMethods={setPaymentMethods}
        onPressClose={() => setModalVisible(false)}
        onPressReset={handleResetFilter}
        onPressAction={handleApplyFilter}
      />

      <HStack>
        <HStack flex={1}>
          <UserPhoto
            source={{ uri: `${api.defaults.baseURL}/images/${user.avatar}` }}
            size={12}
            alt="Foto do usuário"
            borderWidth={2}
            borderColor="blue.500"
            mr={2}
          />

          <VStack>
            <Text fontSize="md" color="gray.600">
              Boas vindas,
            </Text>
            <Heading fontSize="md" color="gray.600">
              {`${user.name[0].toUpperCase() + user.name.substring(1)}`}
            </Heading>
          </VStack>
        </HStack>

        <Button
          variant="black"
          width="40"
          ml={2}
          title="Criar anúncio"
          icon={<Plus size={16} color="white" />}
          onPress={handleOpenAdvertCreate}
        />
      </HStack>

      <VStack my={8}>
        <Text mb={3} color="gray.400">
          Seus produtos anunciados para venda
        </Text>

        <HStack
          py={4}
          px={5}
          bgColor="blue.500:alpha.10"
          rounded="md"
          alignItems="center"
        >
          <Tag size={20} color={colors.blue[700]} />

          <VStack flex={1} ml={4}>
            <Heading color="gray.500" fontSize="lg">
              {numberOfAdsActive}
            </Heading>
            <Text color="gray.500" fontSize="xs">
              anúncios ativos
            </Text>
          </VStack>

          <TouchableOpacity onPress={handleOpenMyAdverts}>
            <HStack alignItems="center">
              <Heading color="blue.700" fontSize="xs" mr={2}>
                Meus anúncios
              </Heading>
              <ArrowRight size={16} color={colors.blue[700]} />
            </HStack>
          </TouchableOpacity>
        </HStack>
      </VStack>

      <VStack mb={6}>
        <Text mb={3} color="gray.400">
          Compre produtos variados
        </Text>

        <HStack
          w="full"
          pr={4}
          alignItems="center"
          bg="white"
          rounded="lg"
          overflow="hidden"
        >
          <Input
            flex={1}
            h={12}
            maxH={12}
            pl={4}
            py={3}
            placeholder="Buscar anúncio"
            borderWidth={0}
            fontSize="md"
            color="gray.500"
            fontFamily="body"
            placeholderTextColor="gray.300"
            _invalid={{
              borderColor: 'red.500',
            }}
            _focus={{
              bg: 'white',
            }}
            value={searchText}
            onChangeText={setSearchText}
          />

          <HStack alignItems="center">
            <TouchableOpacity activeOpacity={0.7} onPress={handleSearch}>
              <MagnifyingGlass
                weight="bold"
                size={22}
                color={colors.gray[500]}
              />
            </TouchableOpacity>

            <Box h={4} mx={3} borderRightWidth={1} borderColor="gray.200" />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalVisible(true)}
            >
              <Sliders weight="bold" size={22} color={colors.gray[500]} />
            </TouchableOpacity>
          </HStack>
        </HStack>
      </VStack>

      {isLoading ? (
        <Loading />
      ) : (
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
      )}
    </VStack>
  );
}
