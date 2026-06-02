import api, { normalizeAssetUrl } from 'api/client';
import { compressCategoryImage, compressProductImage, compressHeroImage } from 'utils/imageCompression';
import type { BankDetails, Category, HomeContent, Order, OrderStatus, Product, ShippingRate, User } from 'types';

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
    variants: product.variants.map((variant) => ({
      ...variant,
      image_url: normalizeAssetUrl(variant.image_url),
    })),
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

export type CategoryMutationInput = {
  name: string;
  imageUrl?: string | null;
};

export type ProductMutationInput = {
  categoryIds: number[];
  name: string;
  price: number;
  description: string;
  isOnSale: boolean;
  variants: Array<{
    color: string;
    colorHex: string;
    imageUrl?: string | null;
    stock: number;
  }>;
  images: string[];
};

export type ShippingRateMutationInput = {
  cpFrom: number;
  cpTo: number;
  price: number;
};

export type BankDetailsMutationInput = {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
  contactPhone: string;
};

export type HomeContentMutationInput = {
  heroImageUrl: string;
  newArrivalsImageUrl: string;
};

function toAdminPayload(payload: ProductMutationInput) {
  return {
    category_ids: payload.categoryIds,
    name: payload.name,
    price: payload.price,
    description: payload.description,
    image_urls: payload.images,
    sale_price: null,
    is_on_sale: payload.isOnSale,
    variants: payload.variants.map((variant) => ({
      color: variant.color,
      color_hex: variant.colorHex,
      image_url: variant.imageUrl ?? null,
      stock: variant.stock,
    })),
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/admin/products');
  return data.map(normalizeProduct);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data.map(normalizeCategory);
}

export async function createCategory(payload: CategoryMutationInput): Promise<Category> {
  const { data } = await api.post<Category>('/categories', {
    name: payload.name,
    image_url: payload.imageUrl ?? null,
  });
  return normalizeCategory(data);
}

export async function updateCategory(categoryId: number, payload: CategoryMutationInput): Promise<Category> {
  const { data } = await api.put<Category>(`/categories/${categoryId}`, {
    name: payload.name,
    image_url: payload.imageUrl ?? null,
  });
  return normalizeCategory(data);
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await api.delete(`/categories/${categoryId}`);
}

export async function createProduct(payload: ProductMutationInput): Promise<Product> {
  const { data } = await api.post<Product>('/admin/products', toAdminPayload(payload));
  return normalizeProduct(data);
}

export async function updateProduct(productId: number, payload: ProductMutationInput): Promise<Product> {
  const { data } = await api.put<Product>(`/admin/products/${productId}`, toAdminPayload(payload));
  return normalizeProduct(data);
}

export async function deleteProduct(productId: number): Promise<void> {
  await api.delete(`/admin/products/${productId}`);
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  // Compress images before uploading
  const compressedFiles = await Promise.all(files.map((file) => compressProductImage(file)));
  
  const formData = new FormData();
  compressedFiles.forEach((file) => formData.append('files', file));
  const { data } = await api.post<string[]>('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.map((value) => normalizeAssetUrl(value) ?? value);
}

export async function uploadCategoryImages(files: File[]): Promise<string[]> {
  // Compress images before uploading (smaller size for category icons)
  const compressedFiles = await Promise.all(files.map((file) => compressCategoryImage(file)));
  
  const formData = new FormData();
  compressedFiles.forEach((file) => formData.append('files', file));
  const { data } = await api.post<string[]>('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.map((value) => normalizeAssetUrl(value) ?? value);
}

export async function uploadHeroImages(files: File[]): Promise<string[]> {
  // Compress images before uploading (larger size for hero/banner images)
  const compressedFiles = await Promise.all(files.map((file) => compressHeroImage(file)));
  
  const formData = new FormData();
  compressedFiles.forEach((file) => formData.append('files', file));
  const { data } = await api.post<string[]>('/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.map((value) => normalizeAssetUrl(value) ?? value);
}

export async function getShippingRates(): Promise<ShippingRate[]> {
  const { data } = await api.get<ShippingRate[]>('/shipping-rates');
  return data;
}

export async function createShippingRate(payload: ShippingRateMutationInput): Promise<ShippingRate> {
  const { data } = await api.post<ShippingRate>('/shipping-rates', {
    cp_from: payload.cpFrom,
    cp_to: payload.cpTo,
    price: payload.price,
  });
  return data;
}

export async function updateShippingRate(shippingRateId: number, payload: ShippingRateMutationInput): Promise<ShippingRate> {
  const { data } = await api.put<ShippingRate>(`/shipping-rates/${shippingRateId}`, {
    cp_from: payload.cpFrom,
    cp_to: payload.cpTo,
    price: payload.price,
  });
  return data;
}

export async function deleteShippingRate(shippingRateId: number): Promise<void> {
  await api.delete(`/shipping-rates/${shippingRateId}`);
}

export async function getBankDetails(): Promise<BankDetails> {
  const { data } = await api.get<BankDetails>('/bank-details');
  return data;
}

export async function updateBankDetails(payload: BankDetailsMutationInput): Promise<BankDetails> {
  const { data } = await api.put<BankDetails>('/bank-details', {
    bank_name: payload.bankName,
    account_holder: payload.accountHolder,
    cbu: payload.cbu,
    alias: payload.alias,
    cuit: payload.cuit,
    contact_phone: payload.contactPhone,
  });
  return data;
}

export async function getHomeContent(): Promise<HomeContent> {
  const { data } = await api.get<HomeContent>('/home-content');
  return normalizeHomeContent(data);
}

export async function updateHomeContent(payload: HomeContentMutationInput): Promise<HomeContent> {
  const { data } = await api.put<HomeContent>('/home-content', {
    hero_image_url: payload.heroImageUrl,
    new_arrivals_image_url: payload.newArrivalsImageUrl,
  });
  return normalizeHomeContent(data);
}

export async function getAdminOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>('/admin/orders');
  return data.map(normalizeOrder);
}

export async function updateAdminOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch<Order>(`/admin/orders/${orderId}`, { status });
  return normalizeOrder(data);
}

export async function getAdminUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/admin/users');
  return data;
}