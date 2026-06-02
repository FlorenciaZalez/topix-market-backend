import api, { normalizeAssetUrl } from './client';
import type { AuthResponse, BankDetails, Category, HomeContent, Order, PaymentMethod, Product, ShippingRate, User } from 'types';

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    image_url: normalizeAssetUrl(category.image_url),
  };
}

function normalizeProduct(product: Product): Product {
  const normalizedCategories = product.categories.map(normalizeCategory);

  return {
    ...product,
    category_id: product.category_id ?? product.category_ids[0] ?? null,
    category: product.category ?? normalizedCategories[0] ?? null,
    categories: normalizedCategories,
    images: product.images.map((image) => ({
      ...image,
      url: normalizeAssetUrl(image.url) ?? image.url,
    })),
    variants: product.variants.map((variant) => {
      const normalizedImageUrls = (variant.image_urls ?? [])
        .map((imageUrl) => normalizeAssetUrl(imageUrl) ?? imageUrl)
        .filter(Boolean);
      const normalizedPrimaryImage = normalizeAssetUrl(variant.image_url) ?? normalizedImageUrls[0] ?? null;

      return {
        ...variant,
        image_url: normalizedPrimaryImage,
        image_urls: normalizedImageUrls.length ? normalizedImageUrls : normalizedPrimaryImage ? [normalizedPrimaryImage] : [],
      };
    }),
  };
}

function normalizeHomeContent(homeContent: HomeContent): HomeContent {
  return {
    ...homeContent,
    hero_image_url: normalizeAssetUrl(homeContent.hero_image_url) ?? '',
    new_arrivals_image_url: normalizeAssetUrl(homeContent.new_arrivals_image_url) ?? '',
  };
}

function normalizeOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      product: normalizeProduct(item.product),
    })),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products');
  return data.map(normalizeProduct);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data.map(normalizeCategory);
}

export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const { data } = await api.get<ShippingRate[]>('/shipping-rates');
  return data;
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const { data } = await api.get<HomeContent>('/home-content');
  return normalizeHomeContent(data);
}

export async function fetchBankDetails(): Promise<BankDetails> {
  const { data } = await api.get<BankDetails>('/bank-details');
  return data;
}

export async function fetchProduct(productId: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${productId}`);
  return normalizeProduct(data);
}

export async function registerUser(payload: { email: string; full_name: string; password: string }): Promise<User> {
  const { data } = await api.post<User>('/auth/register', payload);
  return data;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const params = new URLSearchParams();
  params.append('username', payload.email);
  params.append('password', payload.password);
  const { data } = await api.post<AuthResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function createOrder(payload: {
  shipping_method: 'flat_rate' | 'to_be_arranged';
  payment_method: PaymentMethod;
  delivery_address: string;
  items: Array<{ product_id: number; variant_id: number; quantity: number }>;
}): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload);
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/orders');
  return data.map(normalizeOrder);
}

export async function createPaymentPreference(orderId: number): Promise<{ init_point: string; preference_id: string }> {
  const { data } = await api.post('/payments/preference', { order_id: orderId });
  return data;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await api.post<string[]>('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.map((value) => normalizeAssetUrl(value) ?? value);
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/admin/products');
  return data.map(normalizeProduct);
}

export async function createAdminProduct(payload: Record<string, unknown>): Promise<Product> {
  const { data } = await api.post<Product>('/admin/products', payload);
  return data;
}

export async function updateAdminProduct(productId: number, payload: Record<string, unknown>): Promise<Product> {
  const { data } = await api.put<Product>(`/admin/products/${productId}`, payload);
  return data;
}

export async function deleteAdminProduct(productId: number): Promise<void> {
  await api.delete(`/admin/products/${productId}`);
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/admin/orders');
  return data.map(normalizeOrder);
}

export async function updateAdminOrderStatus(orderId: number, status: string): Promise<Order> {
  const { data } = await api.patch<Order>(`/admin/orders/${orderId}`, { status });
  return data;
}
