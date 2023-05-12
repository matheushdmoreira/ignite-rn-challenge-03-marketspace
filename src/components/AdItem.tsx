import { Box, Center, HStack, Heading, Image, Text, VStack } from 'native-base';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { api } from '@services/api';

import userPhotoDefault from '@assets/userPhotoDefault.png';

import { formatValueCurrency } from '@utils/formattValueCurrency';

import { AdProps } from '@dtos/AdvertDTO';

import { UserPhoto } from './UserPhoto';

type AdsItemProps = TouchableOpacityProps & {
  data: AdProps;
};

export function AdItem({ data, ...rest }: AdsItemProps) {
  return (
    <TouchableOpacity
      style={{ width: '47.5%', marginBottom: 24 }}
      activeOpacity={0.7}
      {...rest}
    >
      <VStack flex={1}>
        <Box position="relative" rounded="lg" overflow="hidden">
          {data.product_images && data.product_images.length > 0 ? (
            <Image
              source={{
                uri: `${api.defaults.baseURL}/images/${data.product_images[0].path}`,
              }}
              alt="Imagem do produto"
              w="full"
              h={110}
              resizeMode="cover"
            />
          ) : (
            <Center w="full" h={110} bg="gray.200">
              <Text fontSize="xs" textAlign="center">
                Esse produto não possui imagem
              </Text>
            </Center>
          )}

          {data.user && (
            <UserPhoto
              source={
                data.user.avatar
                  ? {
                      uri: `${api.defaults.baseURL}/images/${data.user.avatar}`,
                    }
                  : userPhotoDefault
              }
              alt="Imagem do dono do anúncio"
              size={6}
              position="absolute"
              left={1}
              top={1}
              borderWidth={1}
              borderColor="white"
            />
          )}

          <Box
            bgColor={data.is_new ? 'blue.700' : 'gray.500'}
            position="absolute"
            right={1}
            top={1}
            px={2}
            py={1}
            rounded="full"
          >
            <Heading fontSize={10} color="white" textTransform="uppercase">
              {data.is_new ? 'Novo' : 'Usado'}
            </Heading>
          </Box>

          {data.is_active !== undefined && !data.is_active && (
            <Box
              background="gray.600:alpha.50"
              w="full"
              h={110}
              position="absolute"
              justifyContent="flex-end"
            >
              <Heading
                fontSize="xs"
                color="white"
                textTransform="uppercase"
                px={2}
                py={2}
              >
                Anúncio Desativado
              </Heading>
            </Box>
          )}
        </Box>

        <Text
          mt={1}
          fontSize="sm"
          color={data.is_active && !data.is_active ? 'gray.300' : 'gray.500'}
        >
          {data.name}
        </Text>

        <HStack alignItems="center">
          <Heading
            fontSize="xs"
            fontFamily={data.is_active && !data.is_active ? 'body' : 'heading'}
            color={data.is_active && !data.is_active ? 'gray.300' : 'gray.500'}
            mr={1}
          >
            R$
          </Heading>
          <Heading
            fontSize="sm"
            fontFamily={data.is_active && !data.is_active ? 'body' : 'heading'}
            color={data.is_active && !data.is_active ? 'gray.300' : 'gray.500'}
          >
            {data.price && formatValueCurrency(data.price / 100)}
          </Heading>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
}
