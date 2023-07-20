import { Box, HStack, Image } from 'native-base';
import { useRef } from 'react';
import { Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';
import RNCarousel from 'react-native-reanimated-carousel';

import { api } from '@services/api';

import { ProductImagesProps } from '@dtos/AdvertDTO';

import { PaginationItem } from './PaginationItem';

type CarouselProps = {
  productsImages: ProductImagesProps[];
};

export function Carousel({ productsImages }: CarouselProps) {
  const refCarousel = useRef<ICarouselInstance>(null);
  const width = Dimensions.get('window').width;
  const progressValue = useSharedValue<number>(0);

  return (
    <Box position="relative">
      <RNCarousel
        data={productsImages}
        ref={refCarousel}
        loop
        width={width}
        height={280}
        autoPlay={true && productsImages.length > 1}
        autoPlayInterval={3000}
        scrollAnimationDuration={1000}
        onProgressChange={(_, absoluteProgress) =>
          (progressValue.value = absoluteProgress)
        }
        renderItem={({ item, index }) => (
          <Image
            key={index}
            source={{
              uri: item.uri
                ? item.uri
                : `${api.defaults.baseURL}/images/${item.path}`,
            }}
            w="full"
            h={280}
            alt="Imagem do anúncio"
            resizeMode="cover"
          />
        )}
      />
      {productsImages.length > 1 && (
        <HStack
          w="full"
          p={1}
          position="absolute"
          bottom={0}
          justifyContent="space-between"
          space={1}
        >
          {productsImages.map((_, index) => (
            <PaginationItem
              animValue={progressValue}
              index={index}
              key={index}
              length={productsImages.length}
            />
          ))}
        </HStack>
      )}
    </Box>
  );
}
