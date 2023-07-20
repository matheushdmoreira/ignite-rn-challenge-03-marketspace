import {
  FormControl,
  HStack,
  IInputProps,
  Input as NativeBaseInput,
  Pressable,
  useTheme,
} from 'native-base';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { useState } from 'react';

type Props = IInputProps & {
  errorMessage?: string | null;
};

export function Input({
  errorMessage = null,
  isInvalid,
  secureTextEntry,
  ...rest
}: Props) {
  const [inputFocused, setInputFocused] = useState(false);
  const [secureTextHide, setSecureTextHide] = useState(true);

  const { colors } = useTheme();

  const invalid = !!errorMessage || isInvalid;

  function handleInputFocused() {
    setInputFocused(true);
  }

  function handleInputBlur() {
    setInputFocused(false);
  }

  function handleToogleSecureTextEntry() {
    setSecureTextHide((prevState) => !prevState);
  }

  return (
    <FormControl isInvalid={invalid} mb={4}>
      <HStack
        w="full"
        bg="white"
        px={4}
        borderWidth={1}
        borderColor={inputFocused ? 'gray.500' : invalid ? 'red.500' : 'white'}
        rounded="lg"
        alignItems="center"
      >
        <NativeBaseInput
          flex={1}
          h={12}
          p={0}
          bg="white"
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
          secureTextEntry={secureTextEntry && secureTextHide}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          {...rest}
        />

        {secureTextEntry && (
          <Pressable ml={2} onPress={handleToogleSecureTextEntry}>
            {secureTextHide ? (
              <EyeSlash size={20} color={colors.gray[600]} />
            ) : (
              <Eye size={20} color={colors.gray[600]} />
            )}
          </Pressable>
        )}
      </HStack>

      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
