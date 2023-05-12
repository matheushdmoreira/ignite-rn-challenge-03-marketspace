import {
  CheckIcon,
  ISelectProps,
  Select as NBSelect,
  useTheme,
} from 'native-base';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import { useState } from 'react';

type Props = ISelectProps;

export function Select({ placeholder, ...rest }: Props) {
  const [selectValue, setSelectValue] = useState('all');

  const { colors } = useTheme();

  return (
    <NBSelect
      selectedValue={selectValue}
      h={10}
      minWidth="150"
      borderColor="gray.200"
      fontSize="sm"
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      dropdownIcon={
        <CaretDown
          size={18}
          color={colors.gray[400]}
          style={{ marginRight: 12 }}
        />
      }
      dropdownOpenIcon={
        <CaretUp
          size={18}
          color={colors.gray[400]}
          style={{ marginRight: 12 }}
        />
      }
      _actionSheetContent={{
        bg: 'white',
      }}
      _item={{
        bg: 'white',
        _text: {
          fontSize: 'sm',
          color: 'gray.500',
        },
        _pressed: {
          bg: 'gray.100',
        },
      }}
      _selectedItem={{
        fontFamily: 'heading',
        endIcon: <CheckIcon size={18} color={colors.gray[400]} />,
        _text: {
          fontSize: 'sm',
          color: 'gray.500',
          fontFamily: 'heading',
        },
      }}
      onValueChange={(itemValue) => setSelectValue(itemValue)}
      {...rest}
    >
      <NBSelect.Item label="Todos" value="all" />
      <NBSelect.Item label="Ativo" value="active" />
      <NBSelect.Item label="Inativo" value="inactive" />
    </NBSelect>
  );
}
