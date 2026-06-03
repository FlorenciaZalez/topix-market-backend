export type Variant = {
  id: number;
  color: string;
  color_hex?: string | null;
  image_url?: string | null;
  image_urls?: string[];
  stock: number;
};

export type ProductImage = {
  id: number;
  url: string;
  position: number;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
};

export type ShippingRate = {
  id: number;
  cp_from: number;
  cp_to: number;
  price: string;
};

export type HomeContent = {
  id: number;
  hero_image_url: string;
  new_arrivals_image_url: string;
};

export type Product = {
  id: number;
  category_id?: number | null;
  category_ids: number[];
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string | null;
  is_on_sale: boolean;
  category?: Category | null;
  categories: Category[];
  images: ProductImage[];
  variants: Variant[];
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at?: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type CartItem = {
  product: Product;
  variant: Variant;
  quantity: number;
};

export type DeliveryAddress = {
  full_name: string;
  phone: string;
  street: string;
  number: string;
  apartment: string;
  city: string;
  postal_code: string;
  notes: string;
};

export type ShippingMethod = 'flat_rate' | 'to_be_arranged';
export type PaymentMethod = 'mercado_pago' | 'bank_transfer';

export type BankDetails = {
  id: number;
  bank_name: string;
  account_holder: string;
  cbu: string;
  alias: string;
  cuit: string;
  contact_phone: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

export type OrderItem = {
  id: number;
  quantity: number;
  unit_price: string;
  product: Product;
  variant: Variant;
};

export type Order = {
  id: number;
  user?: User | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  delivery_address: string | null;
  shipping_price: string;
  subtotal: string;
  total: string;
  payment_reference: string | null;
  created_at: string;
  items: OrderItem[];
};
