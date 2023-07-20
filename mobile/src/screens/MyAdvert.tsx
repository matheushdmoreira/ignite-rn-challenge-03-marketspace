import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Box,
  Center,
  HStack,
  Heading,
  ScrollView,
  Text,
  VStack,
  useTheme,
  useToast,
} from 'native-base';
import { ArrowLeft, PencilSimple, Power, Trash } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';
import { formatValueCurrency } from '@utils/formattValueCurrency';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { AdProps } from '@dtos/AdvertDTO';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';
import { PaymentMethod } from '@components/PaymentMethod';
import { TagItem } from '@components/TagItem';

import { Carousel } from '@components/Carousel';

type RoutesParamsProps = {
  advertId?: string;
};

export function MyAdvert() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingVisibilityLoading, setIsChangingVisibilityLoading] =
    useState(false);
  const [isDeletingAdvert, setIsDeletingAdvert] = useState(false);
  const [advert, setAdvert] = useState<AdProps>({} as AdProps);

  const toast = useToast();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const route = useRoute();
  const { advertId } = route.params as RoutesParamsProps;
  const { colors } = useTheme();

  function handleGoBack() {
    navigation.navigate('app', { screen: 'adverts' });
  }

  async function handleSetAdvertActive(advertId?: string) {
    setIsChangingVisibilityLoading(true);

    try {
      await api.patch(`/products/${advertId}`, {
        is_active: !advert.is_active,
      });

      setAdvert((oldState) => {
        return {
          ...oldState,
          is_active: !oldState.is_active,
        };
      });

      toast.show({
        title: 'Status do anúncio alterado com sucesso.',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível deletar. Tente Novamente!';

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        });
      }
    } finally {
      setIsChangingVisibilityLoading(false);
    }
  }

  function handleDeleteAdvertAlert(advertId?: string) {
    Alert.alert('Excluir', 'Deseja excluir o anúncio?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => handleDeleteAdvert(advertId) },
    ]);
  }

  async function handleDeleteAdvert(advertId?: string) {
    setIsDeletingAdvert(true);

    try {
      await api.delete(`/products/${advertId}`);

      toast.show({
        title: 'Anúncio deletado com sucesso.',
        placement: 'top',
        bgColor: 'green.500',
      });

      navigation.navigate('app', { screen: 'adverts' });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível deletar. Tente Novamente!';

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        });
      }
    } finally {
      setIsDeletingAdvert(false);
    }
  }

  async function handleEditAdvert(advertId?: string) {
    navigation.navigate('advertEdit', { advertId });
  }

  async function fetchProduct() {
    setIsLoading(true);

    try {
      const response = await api.get(`/products/${advertId}`);

      setAdvert(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível carregar os dados do anúncio.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (advertId) {
      fetchProduct();
      return;
    }
  }, [advertId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} position="relative">
      <HStack pt={16} pb={3} px={6} justifyContent="space-between">
        <TouchableOpacity onPress={handleGoBack}>
          <ArrowLeft size={24} color={colors.gray[600]} />
        </TouchableOpacity>

        {advert.id && (
          <TouchableOpacity onPress={() => handleEditAdvert(advert.id)}>
            <PencilSimple size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        )}
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 230 }}
        showsVerticalScrollIndicator={false}
      >
        {advert.product_images && advert.product_images.length > 0 && (
          <Box position="relative" pb={6}>
            <Carousel productsImages={advert.product_images} />

            {(advertId || advert.id) && !advert.is_active && (
              <Center
                bg="gray.600:alpha.60"
                w="full"
                h="full"
                position="absolute"
              >
                <Heading fontSize="sm" color="white" textTransform="uppercase">
                  Anúncio Desativado
                </Heading>
              </Center>
            )}
          </Box>
        )}

        <VStack p={6} pt={0} alignItems="flex-start">
          <TagItem w="auto" name={advert.is_new ? 'Novo' : 'Usado'} />

          <HStack
            my={2}
            w="full"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading flex={1} fontSize="lg" color="gray.600" mr={2}>
              {advert.name}
            </Heading>

            <HStack alignItems="center">
              <Heading fontSize="xs" color="blue.500" mr={1}>
                R$
              </Heading>
              <Heading fontSize="lg" color="blue.500">
                {formatValueCurrency(Number(advert.price) / 100)}
              </Heading>
            </HStack>
          </HStack>

          <Text mb={6} fontSize="sm" color="gray.500">
            {advert.description}
          </Text>

          <HStack alignItems="center">
            <Heading fontSize="sm" color="gray.500" mr={2}>
              Aceita troca?
            </Heading>

            <Text fontSize="sm" color="gray.500">
              {advert.accept_trade ? 'Sim' : 'Não'}
            </Text>
          </HStack>

          <VStack mt={4}>
            <Heading fontSize="sm" color="gray.500" mb={3}>
              Meios de pagamento:
            </Heading>

            {advert.payment_methods &&
              advert.payment_methods.length > 0 &&
              advert.payment_methods.map((payment: any) => (
                <PaymentMethod
                  key={advert.id ? payment.key : String(payment)}
                  paymentKey={advert.id ? payment.key : payment}
                />
              ))}
          </VStack>
        </VStack>
      </ScrollView>

      <VStack
        w="full"
        flex={1}
        p={6}
        pb={10}
        position="absolute"
        bottom={0}
        left={0}
        space={2}
        bgColor="white"
        alignItems="center"
      >
        <Button
          flex={1}
          variant={advert.is_active ? 'black' : 'blue'}
          title={advert.is_active ? 'Desativar anúncio' : 'Ativar anúncio'}
          icon={<Power size={16} color="white" />}
          isLoading={isChangingVisibilityLoading}
          onPress={() => handleSetAdvertActive(advert.id)}
        />

        <Button
          flex={1}
          variant="gray"
          title="Excluir anúncio"
          icon={<Trash size={16} color={colors.gray[600]} />}
          isLoading={isDeletingAdvert}
          onPress={() => handleDeleteAdvertAlert(advert.id)}
        />
      </VStack>
    </VStack>
  );
}
