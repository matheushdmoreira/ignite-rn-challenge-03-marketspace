import { FormControl, HStack, IRadioGroupProps, Radio } from 'native-base';

type OptionProps = {
  value: string;
  title: string;
};

type RadioButtonProps = IRadioGroupProps & {
  options: OptionProps[];
  errorMessage?: string | null;
};

export function RadioButtons({
  options,
  isInvalid,
  errorMessage = null,
  ...rest
}: RadioButtonProps) {
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid}>
      <Radio.Group {...rest}>
        <HStack space={6}>
          {options.map((option, index) => (
            <Radio
              key={index}
              value={option.value}
              _text={{ fontSize: 'md', color: 'gray.500' }}
              _checked={{
                borderColor: 'blue.500',
                _icon: { color: 'blue.500' },
              }}
              _pressed={{
                borderColor: 'blue.700',
                _icon: { color: 'blue.700' },
              }}
              _invalid={{
                borderColor: 'red.500',
              }}
            >
              {option.title}
            </Radio>
          ))}
        </HStack>
      </Radio.Group>

      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
