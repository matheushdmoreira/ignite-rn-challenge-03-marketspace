import { HStack, Text, useTheme } from 'native-base';
import {
  Bank,
  Barcode,
  CreditCard,
  Money,
  QrCode,
} from 'phosphor-react-native';

import { PaymentMethodsDTO } from '@dtos/PaymentMethodDTO';

type Props = {
  paymentKey: PaymentMethodsDTO;
};

export function PaymentMethod({ paymentKey }: Props) {
  const { colors } = useTheme();

  const methods = {
    boleto: (
      <>
        <Barcode size={18} color={colors.gray[500]} />
        <Text ml={2} fontSize="sm" color="gray.500">
          Boleto
        </Text>
      </>
    ),
    pix: (
      <>
        <QrCode size={18} color={colors.gray[500]} />
        <Text ml={2} fontSize="sm" color="gray.500">
          Pix
        </Text>
      </>
    ),
    cash: (
      <>
        <Money size={18} color={colors.gray[500]} />
        <Text ml={2} fontSize="sm" color="gray.500">
          Dinheiro
        </Text>
      </>
    ),
    card: (
      <>
        <CreditCard size={18} color={colors.gray[500]} />
        <Text ml={2} fontSize="sm" color="gray.500">
          Cartão de crédito
        </Text>
      </>
    ),
    deposit: (
      <>
        <Bank size={18} color={colors.gray[500]} />
        <Text ml={2} fontSize="sm" color="gray.500">
          Depósito bancáro
        </Text>
      </>
    ),
  };

  return (
    <HStack py={0.5} alignItems="center">
      {methods[paymentKey]}
    </HStack>
  );
}
