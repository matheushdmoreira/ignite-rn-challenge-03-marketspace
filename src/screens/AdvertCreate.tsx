import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Box,
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
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions, TouchableOpacity } from 'react-native';
import { Masks } from 'react-native-mask-input';
import * as yup from 'yup';

import { AppError } from '@utils/AppError';

import { PaymentMethodsDTO } from '@dtos/PaymentMethodDTO';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { Button } from '@components/Button';
import { Checkbox } from '@components/Checkbox';
import { Input } from '@components/Input';
import { InputMask } from '@components/InputMask';
import { RadioButtons } from '@components/RadioButtons';

type ImageProps = {
  name: string;
  type: string;
  uri?: string;
  path?: string;
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

export function AdvertCreate() {
  const [imageLoading, setImageLoading] = useState(false);
  const [acceptTrade, setAcceptTrade] = useState(false);
  const [productImages, setProductImages] = useState<ImageProps[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormDataProps>({
    resolver: yupResolver(createAdvert),
  });

  const { colors } = useTheme();
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const toast = useToast();

  const widthScreenImage = (Dimensions.get('window').width - 64) / 3;

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

  function handleDeleteImage(value?: string) {
    const newArrayImages = productImages.filter((item) => item.uri !== value);
    setProductImages(newArrayImages);
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
            Criar anúncio
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

            <HStack ml={-2} flexWrap="wrap">
              {productImages.length > 0 &&
                productImages.map((image, index) => (
                  <Box key={index} position="relative">
                    <Image
                      w={widthScreenImage}
                      h={widthScreenImage}
                      ml={2}
                      mb={2}
                      rounded="lg"
                      source={{
                        uri: image.uri,
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
                      onPress={() => handleDeleteImage(image.uri)}
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
            </HStack>
          </VStack>

          <VStack mb={8}>
            <Heading fontSize="md" color="gray.500" mb={3}>
              Sobre o produto
            </Heading>

            <Controller
              control={control}
              name="title"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Título do produto"
                  onChangeText={onChange}
                  errorMessage={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange } }) => (
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
          isLoading={isSubmitting}
          onPress={handleSubmit(handleGoToPreview)}
        />
      </HStack>
    </VStack>
  );
}
