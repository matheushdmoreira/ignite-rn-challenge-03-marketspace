import { FormControl, HStack, useTheme } from 'native-base';
import { useState } from 'react';
import MaskInput, { MaskInputProps } from 'react-native-mask-input';

type Props = MaskInputProps & {
  errorMessage?: string | null;
  isInvalid?: boolean;
};

export function InputMask({ errorMessage = null, isInvalid, ...rest }: Props) {
  const [inputFocused, setInputFocused] = useState(false);

  const { colors, fonts } = useTheme();

  const invalid = !!errorMessage || isInvalid;

  function handleInputFocused() {
    setInputFocused(true);
  }

  function handleInputBlur() {
    setInputFocused(false);
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
        <MaskInput
          style={{
            width: '100%',
            height: 48,
            padding: 0,
            backgroundColor: colors.white,
            borderWidth: 0,
            fontSize: 16,
            color: colors.gray[500],
            fontFamily: fonts.body,
          }}
          placeholderTextColor={colors.gray[300]}
          // _invalid={{
          //   borderColor: 'red.500',
          // }}
          // _focus={{
          //   bg: 'white',
          // }}
          onFocus={handleInputFocused}
          onBlur={handleInputBlur}
          {...rest}
        />
      </HStack>

      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
