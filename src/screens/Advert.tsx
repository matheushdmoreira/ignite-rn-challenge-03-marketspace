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
import { ArrowLeft, WhatsappLogo } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Linking, TouchableOpacity } from 'react-native';

import userPhotoDefault from '@assets/userPhotoDefault.png';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';

import { formatValueCurrency } from '@utils/formattValueCurrency';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { AdProps } from '@dtos/AdvertDTO';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';
import { PaymentMethod } from '@components/PaymentMethod';
import { TagItem } from '@components/TagItem';
import { UserPhoto } from '@components/UserPhoto';

import { Carousel } from '@components/Carousel';

type RoutesParamsProps = {
  advertId?: string;
};

export function Advert() {
  const [isLoading, setIsLoading] = useState(false);
  const [advert, setAdvert] = useState<AdProps>({} as AdProps);

  const toast = useToast();
  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const route = useRoute();
  const { advertId } = route.params as RoutesParamsProps;

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleOpenLinkingWhatsapp(phone?: string) {
    const url = `https://wa.me/${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      toast.show({
        title: 'Não foi possível entrar em contato por whatsapp.',
        placement: 'top',
        bgColor: 'red.500',
      });
    }
  }

  async function fetchAdvert() {
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
      fetchAdvert();
      return;
    }
  }, [advertId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <VStack flex={1} position="relative">
      <HStack pt={16} pb={3} px={6}>
        <TouchableOpacity onPress={handleGoBack}>
          <ArrowLeft size={24} color={colors.gray[600]} />
        </TouchableOpacity>
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
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
          {advert.user && (
            <HStack w="full" mb={6}>
              <UserPhoto
                source={
                  !advert.user.avatar
                    ? userPhotoDefault
                    : {
                        uri: `${api.defaults.baseURL}/images/${advert.user.avatar}`,
                      }
                }
                size={6}
                alt="Imagem do usuário dono do anúncio"
                borderWidth={2}
                borderColor="blue.500"
              />

              <Text ml={2} fontSize="sm" color="gray.600">
                {advert.user.name}
              </Text>
            </HStack>
          )}

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

      <HStack
        flex={1}
        p={6}
        pb={10}
        position="absolute"
        bottom={0}
        left={0}
        bgColor="white"
        alignItems="center"
      >
        <HStack flex={1} alignItems="center">
          <Heading fontSize="xs" color="blue.700" mr={1}>
            R$
          </Heading>
          <Heading fontSize="xl" color="blue.700">
            {formatValueCurrency(59.9)}
          </Heading>
        </HStack>

        <Button
          flex={1}
          maxW="56"
          title="Entrar em contato"
          icon={<WhatsappLogo weight="fill" size={16} color="white" />}
          onPress={() =>
            handleOpenLinkingWhatsapp(advert.user && advert.user.tel)
          }
        />
      </HStack>
    </VStack>
  );
}
