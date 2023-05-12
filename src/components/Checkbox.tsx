import {
  FormControl,
  ICheckboxGroupProps,
  Checkbox as NativeBaseCheckbox,
} from 'native-base';

type OptionProps = {
  key: string;
  name: string;
};

type CheckboxProps = ICheckboxGroupProps & {
  options: OptionProps[];
  isInvalid?: boolean;
  errorMessage?: string | null;
};

export function Checkbox({
  options,
  isInvalid,
  errorMessage = null,
  ...rest
}: CheckboxProps) {
  const invalid = !!errorMessage || isInvalid;

  return (
    <FormControl isInvalid={invalid}>
      <NativeBaseCheckbox.Group {...rest}>
        {options.map((option) => (
          <NativeBaseCheckbox
            key={option.key}
            value={option.key}
            my={1}
            _text={{ fontSize: 'md', color: 'gray.500', marginLeft: 1 }}
            _checked={{ bg: 'blue.500', borderColor: 'blue.500' }}
            _pressed={{ backgroundColor: 'blue.700', borderColor: 'blue.700' }}
            _invalid={{
              borderColor: 'red.500',
            }}
          >
            {option.name}
          </NativeBaseCheckbox>
        ))}
      </NativeBaseCheckbox.Group>

      <FormControl.ErrorMessage _text={{ color: 'red.500' }}>
        {errorMessage}
      </FormControl.ErrorMessage>
    </FormControl>
  );
}
