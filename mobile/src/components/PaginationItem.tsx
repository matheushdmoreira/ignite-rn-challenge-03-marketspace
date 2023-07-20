import { View, useTheme } from 'native-base';
import { Dimensions } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

type PaginationItemProps = {
  index: number;
  length: number;
  animValue: Animated.SharedValue<number>;
};

export function PaginationItem({
  index,
  length,
  animValue,
}: PaginationItemProps) {
  const { colors } = useTheme();
  const width = Dimensions.get('window').width / length - 6;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  }, [animValue, index, length]);

  return (
    <View
      h={1}
      bgColor="white:alpha.50"
      overflow="hidden"
      borderRadius="full"
      style={{
        width,
      }}
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor: colors.white,
            opacity: 0.75,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </View>
  );
}
