import { extendTheme } from 'native-base';

export const THEME = extendTheme({
  colors: {
    blue: {
      700: '#364D9D',
      500: '#647AC7',
    },
    gray: {
      600: '#1A181B',
      500: '#3E3A40',
      400: '#5F5B62',
      300: '#9F9BA1',
      200: '#D9D8DA',
      100: '#EDECEE',
    },
    white: '#FFFFFF',
    red: {
      500: '#EE7979',
    },
  },
  fonts: {
    heading: 'Karla_700Bold',
    body: 'Karla_400Regular',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
  sizes: {
    14: 56,
    33: 148,
  },
  components: {
    Heading: {
      baseStyle: () => {
        return {
          fontFamily: 'heading',
        };
      },
    },
  },
});
