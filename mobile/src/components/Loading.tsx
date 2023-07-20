import { Center, Spinner } from 'native-base';

export function Loading() {
  return (
    <Center flex={1} bgColor="gray.100">
      <Spinner color="gray.500" />
    </Center>
  );
}
