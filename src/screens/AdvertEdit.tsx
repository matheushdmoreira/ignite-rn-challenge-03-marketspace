import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Box,
  Center,
  HStack,
  Heading,
  Image,
  Pressable,
  ScrollView,
  Spinner,
  Switch,
  Text,
  VStack,
  useTheme,
  useToast,
} from 'native-base';
import { ArrowLeft, Plus, X } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Masks } from 'react-native-mask-input';
import * as yup from 'yup';

import { PaymentMethodsDTO } from '@dtos/PaymentMethodDTO';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { AppError } from '@utils/AppError';

import { Button } from '@components/Button';
import { Checkbox } from '@components/Checkbox';
import { Input } from '@components/Input';
import { InputMask } from '@components/InputMask';
import { Loading } from '@components/Loading';
import { RadioButtons } from '@components/RadioButtons';
import { AdProps } from '@dtos/AdvertDTO';
import { api } from '@services/api';

type ImageProps = {
  id?: string;
  name?: string;
  type?: string;
  uri?: string;
  path?: string;
};

type RoutesParamsProps = {
  advertId: string;
};

type FormDataProps = {
  title: string;
  description: string;
  type: string;
  price: string;
  payment_methods: PaymentMethodsDTO[];
  is_new?: boolean;
};

const createAdvert = yup.object({
  title: yup.string().required('Informe o título do produto.'),
  description: yup.string().required('Informe a descrição do produto.'),
  type: yup.string().required('Selecione uma opção.'),
  price: yup.string().required('Informe o valor do produto.'),
  payment_methods: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecione um meio de pagamento.')
    .required('Selecione um meio de pagamento.'),
});

export function AdvertEdit() {
  const [imageLoading, setImageLoading] = useState(false);
  const [isLoadingAdvert, setIsLoadingAdvert] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [acceptTrade, setAcceptTrade] = useState(false);
  const [productImages, setProductImages] = useState<ImageProps[]>([]);
  const [advert, setAdvert] = useState<AdProps>({} as AdProps);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormDataProps>({
    resolver: yupResolver(createAdvert),
  });

  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();
  const route = useRoute();
  const { advertId } = route.params as RoutesParamsProps;

  const widthScreenImage = (Dimensions.get('window').width - 64) / 3;
  const heightBoxImages = Math.ceil((productImages.length + 1) / 3);
  const heightBoxImagesAdd = heightBoxImages > 1 ? 8 : 0;

  function handleGoBack() {
    navigation.goBack();
  }

  async function handleSetImages() {
    setImageLoading(true);

    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri
        );

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Essa imagem é muito grande, escolha uma imagem de até 5MB.',
            placement: 'top',
            bgColor: 'red.600',
          });
        }

        const fileExtension = photoSelected.assets[0].uri.split('.').pop();

        const photoFile = {
          name: `${fileExtension}`.replace(/\s/g, '-').toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        setProductImages((images) => {
          return [...images, photoFile];
        });
      }
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível selecionar a imagem. Tente novamente!';

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        });
      }
    } finally {
      setImageLoading(false);
    }
  }

  async function handleDeleteImage(image: ImageProps) {
    setIsDeletingImage(true);

    try {
      let newArrayImages = null;
      if (image.uri) {
        newArrayImages = productImages.filter((item) => item.uri !== image.uri);
      } else {
        newArrayImages = productImages.filter((item) => item.id !== image.id);

        await api.delete('/products/images', {
          data: {
            productImagesIds: [image.id],
          },
        });
      }

      setProductImages(newArrayImages);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível deletar a imagem.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsDeletingImage(false);
    }
  }

  function handleGoToPreview({
    title,
    description,
    type,
    price,
    payment_methods,
  }: FormDataProps) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (productImages.length === 0) {
          return toast.show({
            title: 'Selecione ao menos uma imagem!',
            placement: 'top',
            bgColor: 'red.500',
          });
        }

        navigation.navigate('myAdvertPreview', {
          advertId,
          name: title,
          description,
          type: type === 'new' ? true : false,
          price,
          payment_methods,
          accept_trade: acceptTrade,
          product_images: productImages,
        });

        resolve('');
      }, 1000);
    });
  }

  async function fetchProduct() {
    setIsLoadingAdvert(true);

    try {
      const response = await api.get(`/products/${advertId}`);

      const advertData = {
        ...response.data,
        payment_methods: response.data.payment_methods.map(
          (method: any) => method.key
        ),
      };

      reset({
        title: advertData.name ? advertData.name : '',
        description: advertData.description ? advertData.description : '',
        price: String(advertData.price),
        type: advertData.is_new ? 'new' : 'used',
        payment_methods: advertData.payment_methods
          ? advertData.payment_methods
          : ([] as any),
      });

      setAdvert(advertData);
      setProductImages(advertData.product_images);
      setAcceptTrade(response.data.accept_trade);
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
      setIsLoadingAdvert(false);
    }
  }

  useEffect(() => {
    if (advertId) {
      fetchProduct();
      return;
    }
  }, [advertId]);

  if (isLoadingAdvert) {
    return <Loading />;
  }

  return (
    <VStack flex={1} position="relative">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <HStack
          pt={20}
          pb={6}
          px={6}
          justifyContent="center"
          position="relative"
        >
          <Heading fontSize="lg" color="gray.600">
            {!advertId ? 'Criar anúncio' : 'Editar anúncio'}
          </Heading>

          <TouchableOpacity
            style={{ position: 'absolute', bottom: 24, left: 24 }}
            onPress={handleGoBack}
          >
            <ArrowLeft size={24} color={colors.gray[600]} />
          </TouchableOpacity>
        </HStack>

        <VStack px={6}>
          <VStack mb={6}>
            <Heading fontSize="md" color="gray.500" mb={1}>
              Imagens
            </Heading>

            <Text mb={3} fontSize="sm" color="gray.400">
              Escolha até 3 imagens para mostrar o quando o seu produto é
              incrível!
            </Text>

            <HStack ml={-2} flexWrap="wrap" position="relative">
              {productImages.length > 0 &&
                productImages.map((image, index) => (
                  <Box
                    key={index}
                    w={widthScreenImage}
                    h={widthScreenImage}
                    ml={2}
                    mb={2}
                    position="relative"
                    rounded="lg"
                    overflow="hidden"
                  >
                    <Image
                      w={widthScreenImage}
                      h={widthScreenImage}
                      source={{
                        uri: image.path
                          ? `${api.defaults.baseURL}/images/${image.path}`
                          : image.uri,
                      }}
                      alt="Imagens do anúncio"
                      resizeMode="cover"
                    />

                    <Pressable
                      w={4}
                      h={4}
                      justifyContent="center"
                      alignItems="center"
                      position="absolute"
                      top={2}
                      right={2}
                      bg="gray.500"
                      rounded="full"
                      _pressed={{
                        bg: 'gray.600',
                      }}
                      onPress={() => handleDeleteImage(image)}
                    >
                      <X size={12} color="white" />
                    </Pressable>
                  </Box>
                ))}

              <Pressable
                w={widthScreenImage}
                h={widthScreenImage}
                bg="gray.200"
                justifyContent="center"
                alignItems="center"
                rounded="lg"
                ml={2}
                mb={2}
                _pressed={{
                  borderWidth: 1,
                  borderColor: 'gray.300',
                }}
                _disabled={{
                  opacity: 0.7,
                }}
                isDisabled={imageLoading}
                onPress={handleSetImages}
              >
                {imageLoading ? (
                  <Spinner size="sm" color="gray.300" />
                ) : (
                  <Plus size={24} color={colors.gray[300]} />
                )}
              </Pressable>

              {isDeletingImage && (
                <Center
                  w={widthScreenImage * 3 + 16}
                  h={widthScreenImage * heightBoxImages + heightBoxImagesAdd}
                  bg="gray.300:alpha.40"
                  position="absolute"
                  top={0}
                  left={2}
                  right={0}
                  bottom={0}
                  pb={-2}
                  rounded="lg"
                >
                  <Spinner size="sm" color="gray.500" />
                </Center>
              )}
            </HStack>
          </VStack>

          <VStack mb={8}>
            <Heading fontSize="md" color="gray.500" mb={3}>
              Sobre o produto
            </Heading>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Título do produto"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  h={110}
                  py={4}
                  placeholder="Descrição do produto"
                  editable
                  multiline
                  textAlignVertical="top"
                  style={{
                    maxHeight: 110,
                    minHeight: 110,
                  }}
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.description?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { value, name, onChange } }) => (
                <RadioButtons
                  name={name}
                  value={value || ''}
                  onChange={onChange}
                  options={[
                    { value: 'new', title: 'Produto novo' },
                    { value: 'used', title: 'Produto usado' },
                  ]}
                  errorMessage={errors.type?.message}
                />
              )}
            />
          </VStack>

          <VStack>
            <Heading fontSize="md" color="gray.500" mb={3}>
              Venda
            </Heading>

            <Controller
              control={control}
              name="price"
              render={({ field: { value, onChange } }) => (
                <InputMask
                  keyboardType="numeric"
                  placeholder="Valor do produto"
                  mask={Masks.BRL_CURRENCY}
                  value={value}
                  onChangeText={(value) => {
                    onChange(value.replace(/\D/g, ''));
                  }}
                  errorMessage={errors.price?.message}
                />
              )}
            />
          </VStack>

          <VStack mb={4}>
            <Heading fontSize="sm" color="gray.500" mb={3}>
              Aceita troca?
            </Heading>

            <Switch
              value={acceptTrade}
              onChange={() => setAcceptTrade((prevState) => !prevState)}
              onTrackColor="blue.500"
              offTrackColor="gray.100"
            />
          </VStack>

          <VStack mb={12}>
            <Heading fontSize="sm" color="gray.500" mb={3}>
              Meios de pagamento aceitos
            </Heading>

            <Controller
              control={control}
              name="payment_methods"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  value={value || []}
                  onChange={onChange}
                  accessibilityLabel="Escolha os meios de pagamento"
                  options={[
                    { key: 'boleto', name: 'Boleto' },
                    { key: 'pix', name: 'Pix' },
                    { key: 'cash', name: 'Dinheiro' },
                    { key: 'card', name: 'Cartão de crédito' },
                    { key: 'deposit', name: 'Transferência bancária' },
                  ]}
                  errorMessage={errors.payment_methods?.message}
                />
              )}
            />
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
          title="Cancelar"
          variant="gray"
          onPress={handleGoBack}
        />

        <Button
          flex={1}
          title="Avançar"
          variant="black"
          onPress={handleSubmit(handleGoToPreview)}
          isLoading={isSubmitting}
        />
      </HStack>
    </VStack>
  );
}
