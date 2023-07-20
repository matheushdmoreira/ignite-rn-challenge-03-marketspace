import { Box, HStack, Heading, Switch, VStack, useTheme } from 'native-base';
import { X } from 'phosphor-react-native';
import { Modal, ModalProps, TouchableOpacity } from 'react-native';

import { PaymentMethodsDTO } from '@dtos/PaymentMethodDTO';

import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { TagItem } from './TagItem';

type Props = ModalProps & {
  conditionOfAds?: string;
  acceptExchange: boolean;
  paymentMethods: string[];
  setConditionOfAds: (condition: 'new' | 'used' | undefined) => void;
  setAcceptExchange: (value: boolean) => void;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethodsDTO[]>>;
  onPressClose: () => void;
  onPressReset: () => void;
  onPressAction: () => void;
};

export function FilterModal({
  conditionOfAds,
  setConditionOfAds,
  acceptExchange,
  setAcceptExchange,
  paymentMethods,
  setPaymentMethods,
  onPressClose,
  onPressReset,
  onPressAction,
  ...rest
}: Props) {
  const { colors } = useTheme();

  function handleChangeCondition(condition: 'new' | 'used' | undefined) {
    if (conditionOfAds === condition) {
      setConditionOfAds(undefined);
      return;
    }

    setConditionOfAds(condition);
  }

  return (
    <Modal animationType="slide" transparent={true} {...rest}>
      <VStack bgColor="black:alpha.70" flex={1} justifyContent="flex-end">
        <VStack
          pb={10}
          px={6}
          bgColor="gray.100"
          borderTopLeftRadius={24}
          borderTopRightRadius={24}
          alignItems="center"
        >
          <Box width={54} h={1} bgColor="gray.200" left="0.5" top={2} />

          <VStack pt={10}>
            <HStack mb={6} justifyContent="space-between">
              <Heading fontSize="lg" color="gray.600">
                Filtrar anúncios
              </Heading>

              <TouchableOpacity onPress={onPressClose} activeOpacity={0.7}>
                <X size={24} color={colors.gray[300]} />
              </TouchableOpacity>
            </HStack>

            <VStack>
              <VStack mb={6}>
                <Heading fontSize="sm" color="gray.500" mb={3}>
                  Condição
                </Heading>

                <HStack>
                  <TagItem
                    name="Novo"
                    selectedTag={conditionOfAds === 'new'}
                    mr={2}
                    onPress={() => handleChangeCondition('new')}
                  />

                  <TagItem
                    name="Usado"
                    selectedTag={conditionOfAds === 'used'}
                    onPress={() => handleChangeCondition('used')}
                  />
                </HStack>
              </VStack>

              <VStack mb={6}>
                <Heading fontSize="sm" color="gray.500" mb={3}>
                  Aceita troca?
                </Heading>

                <Switch
                  value={acceptExchange}
                  onToggle={(value) => setAcceptExchange(value)}
                  onTrackColor="blue.500"
                  offTrackColor="gray.100"
                />
              </VStack>

              <VStack mb={12}>
                <Heading fontSize="sm" color="gray.500" mb={3}>
                  Meios de pagamento aceitos
                </Heading>

                <Checkbox
                  value={paymentMethods || []}
                  onChange={setPaymentMethods}
                  accessibilityLabel="Escolha os meios de pagamento"
                  options={[
                    { key: 'boleto', name: 'Boleto' },
                    { key: 'pix', name: 'Pix' },
                    { key: 'cash', name: 'Dinheiro' },
                    { key: 'card', name: 'Cartão de crédito' },
                    { key: 'deposit', name: 'Depósito bancárioeto' },
                  ]}
                />
              </VStack>
            </VStack>

            <HStack w="full" justifyContent="space-between">
              <Button
                variant="gray"
                width="48%"
                title="Resetar filtros"
                onPress={onPressReset}
              />

              <Button
                variant="black"
                width="48%"
                title="Aplicar filtros"
                onPress={onPressAction}
              />
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </Modal>
  );
}
