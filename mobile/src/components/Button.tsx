import {
  Button as ButtonNativeBase,
  HStack,
  IButtonProps,
  Text,
} from 'native-base';
import { ReactNode } from 'react';

type Props = IButtonProps & {
  title: string;
  variant?: 'blue' | 'black' | 'gray';
  icon?: ReactNode;
};

export function Button({ title, variant = 'blue', icon, ...rest }: Props) {
  return (
    <ButtonNativeBase
      {...rest}
      width="full"
      h={12}
      bg={
        variant === 'blue'
          ? 'blue.500'
          : variant === 'black'
          ? 'gray.600'
          : 'gray.200'
      }
      rounded="lg"
      variant={variant}
      _pressed={{
        bg:
          variant === 'blue'
            ? 'blue.700'
            : variant === 'black'
            ? 'gray.500'
            : 'gray.300',
      }}
      _loading={{
        bg:
          variant === 'blue'
            ? 'blue.500'
            : variant === 'black'
            ? 'gray.600'
            : 'gray.200',
        _text: {
          color: variant === 'gray' ? 'gray.500' : 'white',
        },
        opacity: 1,
      }}
      {...rest}
    >
      <HStack alignItems="center">
        {icon}
        <Text
          color={variant === 'gray' ? 'gray.500' : 'white'}
          fontFamily="heading"
          fontSize="sm"
          ml={icon ? 2 : 0}
        >
          {title}
        </Text>
      </HStack>
    </ButtonNativeBase>
  );
}
