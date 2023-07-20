import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Box,
  Center,
  Heading,
  Pressable,
  ScrollView,
  Skeleton,
  Text,
  VStack,
  useToast,
} from 'native-base';
import { PencilSimpleLine } from 'phosphor-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import LogoSvg from '@assets/logo-icon.svg';
import userPhotoDefault from '@assets/userPhotoDefault.png';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import { AppError } from '@utils/AppError';

import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { UserPhoto } from '@components/UserPhoto';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';

const PHOTO_SIZE = 88;

type userImageSelectedProps = {
  selected: boolean;
  photo: {
    uri: string;
    name: string;
    type: string;
  };
};

type FormDataProps = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
};

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o email.').email('E-mail inválido.'),
  phone: yup.string().required('Informe o telefone.'),
  password: yup
    .string()
    .required('Informe a senha.')
    .min(6, 'A senha deve ter no mínimo de 6 digitos.'),
  password_confirm: yup
    .string()
    .required('Confirme a senha.')
    .oneOf([yup.ref('password')], 'A confirmação da senha não confere.'),
});

export function SignUp() {
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [photoSelected, setPhotoSelected] = useState<userImageSelectedProps>({
    selected: false,
  } as userImageSelectedProps);

  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast();
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({ resolver: yupResolver(signUpSchema) });

  function handleGoSignIn() {
    navigation.navigate('signIn');
  }

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true);

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
          name: `${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        setPhotoSelected({
          selected: true,
          photo: { ...photoFile },
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
      setPhotoIsLoading(false);
    }
  }

  async function handleSignUp({ name, email, phone, password }: FormDataProps) {
    setFormIsLoading(true);

    try {
      if (!photoSelected.selected) {
        return toast.show({
          title: 'Por favor selecione uma imagem!',
          placement: 'top',
          bgColor: 'red.500',
        });
      }

      const userImage = {
        ...photoSelected.photo,
        name: `${name}.${photoSelected.photo.name}`.toLowerCase(),
      } as any;

      const userForm = new FormData();

      userForm.append('avatar', userImage);
      userForm.append('name', name.toLowerCase());
      userForm.append('email', email.toLowerCase());
      userForm.append('tel', phone);
      userForm.append('password', password);

      await api.post('/users', userForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await signIn(email, password);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível cadastrar. Tente novamente!';

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        });
      }
    } finally {
      setFormIsLoading(false);
    }
  }

  return (
    <VStack flex={1} bgColor="gray.100">
      <ScrollView>
        <Center py={20} px={12}>
          <LogoSvg />

          <Heading mt={4} mb={2} fontSize="lg" color="gray.600">
            Boas vindas!
          </Heading>

          <Text mb={8} fontSize="sm" color="gray.500" textAlign="center">
            Crie sua conta e use o espaço para comprar itens variados e vender
            seus produtos
          </Text>

          <Box mb={4} position="relative">
            {photoIsLoading ? (
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded="full"
                startColor="gray.400"
                endColor="gray.300"
              />
            ) : (
              <UserPhoto
                source={
                  photoSelected.selected
                    ? { uri: photoSelected.photo.uri }
                    : userPhotoDefault
                }
                size={PHOTO_SIZE}
                alt="Imagem do usuário"
              />
            )}

            <Pressable
              w={10}
              h={10}
              rounded="full"
              alignItems="center"
              justifyContent="center"
              bgColor="blue.500"
              _pressed={{ bgColor: 'blue.700' }}
              position="absolute"
              bottom={0}
              right={-8}
              onPress={handleUserPhotoSelect}
            >
              <PencilSimpleLine size={16} color="white" />
            </Pressable>
          </Box>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Nome"
                onChangeText={onChange}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="E-mail"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Telefone"
                onChangeText={onChange}
                errorMessage={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Confirmar Senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password_confirm?.message}
              />
            )}
          />

          <Button
            variant="black"
            title="Criar"
            mt={4}
            onPress={handleSubmit(handleSignUp)}
            isLoading={formIsLoading}
          />

          <Text mt={16} mb={4} fontSize="sm" color="gray.500">
            Já tem uma conta?
          </Text>

          <Button
            variant="gray"
            title="Ir para login"
            onPress={handleGoSignIn}
          />
        </Center>
      </ScrollView>
    </VStack>
  );
}
