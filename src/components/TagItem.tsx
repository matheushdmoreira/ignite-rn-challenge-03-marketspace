import { HStack, Heading, IPressableProps, Icon, Pressable } from 'native-base';
import { XCircle } from 'phosphor-react-native';

type ConditionItemProps = IPressableProps & {
  name: string;
  selectedTag?: boolean;
};

export function TagItem({ name, selectedTag, ...rest }: ConditionItemProps) {
  return (
    <Pressable
      bgColor={selectedTag ? 'blue.500' : 'gray.200'}
      px={3}
      rounded="full"
      {...rest}
    >
      <HStack py={1} alignItems="center">
        <Heading
          fontSize={10}
          color={selectedTag ? 'white' : 'gray.400'}
          textTransform="uppercase"
        >
          {name}
        </Heading>

        {selectedTag && (
          <Icon ml={1} as={<XCircle weight="fill" size={12} color="white" />} />
        )}
      </HStack>
    </Pressable>
  );
}
