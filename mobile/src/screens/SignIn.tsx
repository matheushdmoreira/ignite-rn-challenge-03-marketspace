import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import { Center, ScrollView, Text, VStack, useToast } from 'native-base';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import LogoSvg from '@assets/logo.svg';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';

type FormDataProps = {
  email: string;
  password: string;
};

const signInSchema = yup.object({
  email: yup.string().required('Informe o email.').email('E-mail inválido.'),
  password: yup
    .string()
    .required('Informe a senha.')
    .min(6, 'No mínimo 6 digitos.'),
});

export function SignIn() {
  const [formIsLoading, setFormIsLoading] = useState(false);

  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast();
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({ resolver: yupResolver(signInSchema) });

  function handleGoSignUp() {
    navigation.navigate('signUp');
  }

  async function handleSignIn(data: FormDataProps) {
    try {
      setFormIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : 'Não foi possível entrar, tente novamente mais tarde.';

      setFormIsLoading(false);

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    }
  }

  return (
    <VStack flex={1} bgColor="white">
      <ScrollView>
        <Center
          pt={32}
          pb={24}
          px={12}
          bgColor="gray.100"
          borderBottomRadius={24}
        >
          <LogoSvg />

          <Text mt={16} mb={4} fontSize="sm" color="gray.500">
            Acesse sua conta
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="E-mail"
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
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

          <Button
            title="Entrar"
            mt={4}
            onPress={handleSubmit(handleSignIn)}
            isLoading={formIsLoading}
          />
        </Center>

        <Center px={12}>
          <Text mt={16} mb={4} fontSize="sm" color="gray.500">
            Ainda não tem acesso?
          </Text>

          <Button
            variant="gray"
            title="Criar uma conta"
            onPress={handleGoSignUp}
          />
        </Center>
      </ScrollView>
    </VStack>
  );
}
