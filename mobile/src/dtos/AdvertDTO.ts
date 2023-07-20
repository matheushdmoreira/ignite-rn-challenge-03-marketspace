import { PaymentMethodsDTO } from './PaymentMethodDTO';

export type PaymentMethodsProps = {
  key: PaymentMethodsDTO;
  name: string;
};

export type ProductImagesProps = {
  id?: string;
  path?: string;
  name?: string;
  uri?: string;
};

export type AdProps = {
  id?: string;
  name?: string;
  description?: string;
  user_id?: string;
  is_new?: boolean;
  accept_trade?: boolean;
  price?: number;
  is_active?: boolean;
  payment_methods?: PaymentMethodsProps[];
  product_images?: ProductImagesProps[];
  user?: { avatar: string; name: string; tel: string };
};
