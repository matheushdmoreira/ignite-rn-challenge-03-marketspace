import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Box,
  HStack,
  Heading,
  ScrollView,
  Text,
  VStack,
  useTheme,
  useToast,
} from 'native-base';
import { ArrowLeft, Tag } from 'phosphor-react-native';
import { useState } from 'react';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';
import { formatValueCurrency } from '@utils/formattValueCurrency';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { PaymentMethodsProps, ProductImagesProps } from '@dtos/AdvertDTO';

import { useAuth } from '@hooks/useAuth';

import { Button } from '@components/Button';
import { Carousel } from '@components/Carousel';
import { PaymentMethod } from '@components/PaymentMethod';
import { TagItem } from '@components/TagItem';

type RoutesParamsProps = {
  advertId?: string;
  name?: string;
  description?: string;
  type?: boolean;
  price?: string;
  payment_methods?: PaymentMethodsProps[];
  accept_trade?: boolean;
  product_images?: ProductImagesProps[];
};

export function MyAdvertPreview() {
  const [isPublishingAdvert, setIsPublishingAdvert] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const route = useRoute();
  const {
    advertId,
    name,
    description,
    type,
    price,
    accept_trade,
    payment_methods,
    product_images,
  } = route.params as RoutesParamsProps;

  function handleGoBack() {
    navigation.goBack();
  }

  async function handlePublishAdvert() {
    setIsPublishingAdvert(true);

    try {
      let publishAdvertId = null;

      if (advertId) {
        await api.put(`/products/${advertId}`, {
          name,
          description,
          price: Number(price),
          payment_methods,
          is_new: type,
          accept_trade,
        });

        publishAdvertId = advertId;
      } else {
        const response = await api.post('/products', {
          name,
          description,
          price: Number(price),
          payment_methods,
          is_new: type,
          accept_trade,
        });

        publishAdvertId = response.data.id;
      }

      if (
        product_images &&
        product_images.length > 0 &&
        !!product_images.find((image) => image.uri)
      ) {
        const formData = new FormData();

        formData.append('product_id', publishAdvertId);

        product_images.forEach((image) => {
          if (image.uri) {
            const imageFile = {
              ...image,
              name: user.name + '.' + image.name,
            } as any;

            formData.append('images', imageFile);
          }
        });

        await api.post('/products/images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.show({
        title: !advertId
          ? 'Anúncio criado com sucesso'
          : 'Anúncio atualizado com sucesso',
        placement: 'top',
        bgColor: 'green.500',
      });

      if (!advertId) {
        navigation.navigate('myAdvert', { advertId: publishAdvertId });
      } else {
        navigation.navigate('app', { screen: 'adverts' });
      }
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : !advertId
        ? 'Não foi possível criar o anúncio. Tente Novamente!'
        : 'Não foi possível atualizar o anúncio. Tente Novamente!';

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        });
      }
    } finally {
      setIsPublishingAdvert(false);
    }
  }

  return (
    <VStack flex={1} position="relative">
      <VStack pt={20} pb={4} px={6} bg="blue.500" alignItems="center">
        <Heading fontSize="md" color="white">
          Pré visualização do anúncio
        </Heading>

        <Text fontSize="sm" color="white">
          É assim que seu produto vai aparecer!
        </Text>
      </VStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 230 }}
        showsVerticalScrollIndicator={false}
      >
        {product_images && product_images.length > 0 && (
          <Box position="relative" pb={6}>
            <Carousel productsImages={product_images} />
          </Box>
        )}

        <VStack p={6} pt={0} alignItems="flex-start">
          <TagItem w="auto" name={type ? 'Novo' : 'Usado'} />

          <HStack
            my={2}
            w="full"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading flex={1} fontSize="lg" color="gray.600" mr={2}>
              {name}
            </Heading>

            <HStack alignItems="center">
              <Heading fontSize="xs" color="blue.500" mr={1}>
                R$
              </Heading>
              <Heading fontSize="lg" color="blue.500">
                {formatValueCurrency(Number(price) / 100)}
              </Heading>
            </HStack>
          </HStack>

          <Text mb={6} fontSize="sm" color="gray.500">
            {description}
          </Text>

          <HStack alignItems="center">
            <Heading fontSize="sm" color="gray.500" mr={2}>
              Aceita troca?
            </Heading>

            <Text fontSize="sm" color="gray.500">
              {accept_trade ? 'Sim' : 'Não'}
            </Text>
          </HStack>

          <VStack mt={4}>
            <Heading fontSize="sm" color="gray.500" mb={3}>
              Meios de pagamento:
            </Heading>

            {payment_methods &&
              payment_methods.length > 0 &&
              payment_methods.map((payment: any) => (
                <PaymentMethod key={String(payment)} paymentKey={payment} />
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
        space={3}
      >
        <Button
          flex={1}
          title="Voltar e editar"
          variant="gray"
          icon={<ArrowLeft size={16} color={colors.gray[600]} />}
          onPress={handleGoBack}
        />

        <Button
          flex={1}
          title="Publicar"
          variant="blue"
          icon={<Tag size={16} color="white" />}
          isLoading={isPublishingAdvert}
          onPress={handlePublishAdvert}
        />
      </HStack>
    </VStack>
  );
}
