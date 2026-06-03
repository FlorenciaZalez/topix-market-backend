import { CheckCircle2, CircleAlert, PackagePlus, Search } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { CategoryCreateModal } from 'components/CategoryCreateModal';
import { CategoryManager } from 'components/CategoryManager';
import { BankDetailsManager } from 'components/BankDetailsManager';
import { CustomersManager } from 'components/CustomersManager';
import { HomeContentManager } from 'components/HomeContentManager';
import { OrdersManager } from 'components/OrdersManager';
import { ProductForm, type ProductFormValues } from 'components/ProductForm';
import { ProductTable } from 'components/ProductTable';
import { ShippingRatesManager } from 'components/ShippingRatesManager';
import { Sidebar, type AdminSection } from 'components/Sidebar';
import { translations } from '../i18n/es';
import { parseLocaleNumberInput } from 'utils/number';
import {
  createCategory,
  createProduct,
  createShippingRate,
  deleteCategory,
  deleteProduct,
  deleteShippingRate,
  getAdminOrders,
  getAdminUsers,
  getCategories,
  getBankDetails,
  getHomeContent,
  getProducts,
  getShippingRates,
  updateCategory,
  updateBankDetails,
  updateHomeContent,
  updateAdminOrderStatus,
  updateProduct,
  updateShippingRate,
  uploadCategoryImages,
  uploadHeroImages,
  uploadProductImages,
} from 'services/api';
import type { BankDetails, Category, HomeContent, Order, OrderStatus, Product, ShippingRate, User } from 'types';

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

const t = translations.es;

const emptyForm: ProductFormValues = {
  categoryIds: [],
  name: '',
  price: '',
  description: '',
  isOnSale: false,
  variants: [
    {
      rowId: 'new-variant-1',
      color: '',
      colorHex: '#314236',
      imageUrls: [],
      stock: '0',
    },
  ],
  images: [''],
};

function getProductStock(product: Product) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

function toFormValues(product: Product): ProductFormValues {
  return {
    categoryIds: product.category_ids.map((categoryId) => String(categoryId)),
    name: product.name,
    price: String(Number(product.price)),
    description: product.description,
    isOnSale: product.is_on_sale,
    variants: product.variants.length
      ? product.variants.map((variant) => ({
          rowId: `existing-variant-${variant.id}`,
          color: variant.color && variant.color !== 'Default' ? variant.color : '',
          colorHex: variant.color_hex || '#314236',
          imageUrls: variant.image_urls?.length ? variant.image_urls : variant.image_url ? [variant.image_url] : [],
          stock: String(variant.stock),
        }))
      : [
          {
            rowId: 'new-variant-1',
            color: '',
            colorHex: '#314236',
            imageUrls: [],
            stock: '0',
          },
        ],
    images: product.images.length ? product.images.map((image) => image.url) : [''],
  };
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return t.unexpectedError;
}

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [deletingShippingRateId, setDeletingShippingRateId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, products]);

  const sectionTitle =
    activeSection === 'products'
      ? t.productDashboard
      : activeSection === 'categories'
        ? t.categoriesManager
        : activeSection === 'shipping-rates'
          ? t.shippingRates
        : activeSection === 'bank-details'
          ? t.bankDetails
        : activeSection === 'orders'
          ? t.orders
          : t.customers;

  const sectionDescription =
    activeSection === 'products'
      ? t.productDashboardDescription
      : activeSection === 'categories'
        ? ''
        : activeSection === 'shipping-rates'
          ? t.shippingRatesDescription
        : activeSection === 'home-content'
          ? t.homeContentDescription
        : activeSection === 'bank-details'
          ? t.bankDetailsDescription
        : activeSection === 'orders'
          ? t.ordersDescription
        : activeSection === 'customers'
          ? t.customersDescription
        : t.reservedSection;

  async function loadDashboard() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getProducts(),
        getCategories(),
        getShippingRates(),
        getHomeContent(),
        getBankDetails().catch(() => null),
        getAdminOrders(),
        getAdminUsers(),
      ]);

      const [productsResult, categoriesResult, shippingRatesResult, homeContentResult, bankDetailsResult, ordersResult, usersResult] = results;

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
      }

      if (shippingRatesResult.status === 'fulfilled') {
        setShippingRates(shippingRatesResult.value);
      }

      if (homeContentResult.status === 'fulfilled') {
        setHomeContent(homeContentResult.value);
      }

      if (bankDetailsResult.status === 'fulfilled') {
        setBankDetails(bankDetailsResult.value);
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value);
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value);
      }

      const rejectedResult = results.find((result) => result.status === 'rejected');
      if (rejectedResult?.status === 'rejected') {
        setFeedback({
          type: 'error',
          message: getErrorMessage(rejectedResult.reason),
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true);

    try {
      const parsedPrice = parseLocaleNumberInput(values.price);
      if (parsedPrice === null || parsedPrice < 0) {
        throw new Error(t.validPrice);
      }

      const payload = {
        categoryIds: values.categoryIds.map((categoryId) => Number(categoryId)),
        name: values.name.trim(),
        price: parsedPrice,
        description: values.description.trim(),
        isOnSale: values.isOnSale,
        variants: values.variants.map((variant) => ({
          color: variant.color.trim(),
          colorHex: variant.colorHex,
          imageUrls: variant.imageUrls.map((imageUrl) => imageUrl.trim()).filter(Boolean),
          stock: Number(variant.stock),
        })),
        images: values.images.map((image) => image.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setFeedback({ type: 'success', message: t.productUpdated });
      } else {
        await createProduct(payload);
        setFeedback({ type: 'success', message: t.productCreated });
      }

      setModalOpen(false);
      setEditingProduct(null);
      await loadDashboard();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(t.deleteConfirmation.replace('{name}', product.name))) {
      return;
    }

    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      setFeedback({ type: 'success', message: t.productDeleted });
      await loadDashboard();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDuplicate(product: Product) {
    if (!product.category_ids.length) {
      setFeedback({ type: 'error', message: t.categoryRequired });
      return;
    }

    setDuplicatingId(product.id);

    try {
      await createProduct({
        categoryIds: product.category_ids,
        name: `${product.name} - ${t.copySuffix}`,
        price: Number(product.price),
        description: product.description,
        isOnSale: product.is_on_sale,
        variants: product.variants.length
          ? product.variants.map((variant) => ({
              color: variant.color && variant.color !== 'Default' ? variant.color : 'Negro',
              colorHex: variant.color_hex || '#314236',
              imageUrls: variant.image_urls?.length
                ? variant.image_urls
                : variant.image_url
                  ? [variant.image_url]
                  : product.images[0]?.url
                    ? [product.images[0].url]
                    : [],
              stock: variant.stock,
            }))
          : [
              {
                color: 'Negro',
                colorHex: '#314236',
                imageUrls: product.images[0]?.url ? [product.images[0].url] : [],
                stock: getProductStock(product),
              },
            ],
        images: product.images.map((image) => image.url),
      });
      setFeedback({ type: 'success', message: t.productDuplicated });
      await loadDashboard();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleCreateCategory(name: string, imageUrl: string | null) {
    setCreatingCategory(true);

    try {
      await createCategory({ name, imageUrl });
      setFeedback({ type: 'success', message: t.categoryCreated });
      await loadDashboard();
      setCategoryModalOpen(false);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!window.confirm(t.deleteCategoryConfirmation.replace('{name}', category.name))) {
      return;
    }

    setDeletingCategoryId(category.id);

    try {
      await deleteCategory(category.id);
      setFeedback({ type: 'success', message: t.categoryDeleted });
      await loadDashboard();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleUpdateCategory(category: Category, name: string, imageUrl: string | null) {
    setUpdatingCategoryId(category.id);

    try {
      await updateCategory(category.id, { name, imageUrl });
      setFeedback({ type: 'success', message: t.categoryUpdated });
      await loadDashboard();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error),
      });
    } finally {
      setUpdatingCategoryId(null);
    }
  }

  function parseShippingRateValues(values: { cpFrom: string; cpTo: string; price: string }) {
    return {
      cpFrom: Number(values.cpFrom),
      cpTo: Number(values.cpTo),
      price: Number(values.price),
    };
  }

  async function handleCreateShippingRate(values: { cpFrom: string; cpTo: string; price: string }) {
    setSubmitting(true);

    try {
      await createShippingRate(parseShippingRateValues(values));
      setFeedback({ type: 'success', message: t.shippingRateCreated });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateShippingRate(shippingRate: ShippingRate, values: { cpFrom: string; cpTo: string; price: string }) {
    setSubmitting(true);

    try {
      await updateShippingRate(shippingRate.id, parseShippingRateValues(values));
      setFeedback({ type: 'success', message: t.shippingRateUpdated });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteShippingRate(shippingRate: ShippingRate) {
    const rangeLabel = `${shippingRate.cp_from} - ${shippingRate.cp_to}`;
    if (!window.confirm(t.deleteShippingRateConfirmation.replace('{range}', rangeLabel))) {
      return;
    }

    setDeletingShippingRateId(shippingRate.id);
    try {
      await deleteShippingRate(shippingRate.id);
      setFeedback({ type: 'success', message: t.shippingRateDeleted });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setDeletingShippingRateId(null);
    }
  }

  async function handleSaveBankDetails(values: {
    bankName: string;
    accountHolder: string;
    cbu: string;
    alias: string;
    cuit: string;
    contactPhone: string;
  }) {
    setSubmitting(true);
    try {
      await updateBankDetails(values);
      setFeedback({ type: 'success', message: t.bankDetailsSaved });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveHomeContent(values: { heroImageUrl: string; newArrivalsImageUrl: string }) {
    setSubmitting(true);
    try {
      await updateHomeContent(values);
      setFeedback({ type: 'success', message: t.homeContentSaved });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateOrderStatus(orderId: number, status: OrderStatus) {
    setUpdatingOrderId(orderId);
    try {
      await updateAdminOrderStatus(orderId, status);
      setFeedback({ type: 'success', message: t.orderUpdated });
      await loadDashboard();
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="mx-auto w-full px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:px-10 2xl:px-12">
      <div className="rounded-[36px] border border-white/8 bg-[#0f0f0f] p-4 text-white shadow-[0_36px_120px_rgba(15,15,15,0.32)] sm:p-5 lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

          <main className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_rgba(26,26,26,1)_0%,_rgba(19,19,19,1)_100%)] p-5 sm:p-6 lg:p-8">
            <div className="grid gap-6 border-b border-white/8 pb-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/38">{t.operations}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{sectionTitle}</h2>
                {sectionDescription ? <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{sectionDescription}</p> : null}
              </div>

              {activeSection === 'products' ? (
                <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[240px] xl:flex-col">
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110"
                  >
                    <PackagePlus size={16} />
                    {t.newProduct}
                  </button>
                </div>
              ) : null}
            </div>

            {feedback ? (
              <div
                className={`mt-6 flex items-start gap-3 rounded-[22px] border px-4 py-4 text-sm ${
                  feedback.type === 'success'
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
                    : 'border-red-400/20 bg-red-500/10 text-red-100'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5" /> : <CircleAlert size={18} className="mt-0.5" />}
                <p>{feedback.message}</p>
              </div>
            ) : null}

            {activeSection === 'products' ? (
              <div className="mt-6 space-y-6">
                <div className="w-full">
                  <div className="w-full">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.searchProducts}</label>
                    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <Search size={16} className="text-white/38" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t.searchProductsPlaceholder}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </div>
                </div>

                {filteredProducts.length ? (
                  <ProductTable
                    products={filteredProducts}
                    loading={loading}
                    deletingId={deletingId}
                    duplicatingId={duplicatingId}
                    onEdit={openEditModal}
                    onDuplicate={(product) => void handleDuplicate(product)}
                    onDelete={(product) => void handleDelete(product)}
                  />
                ) : loading ? (
                  <ProductTable
                    products={filteredProducts}
                    loading={loading}
                    deletingId={deletingId}
                    duplicatingId={duplicatingId}
                    onEdit={openEditModal}
                    onDuplicate={(product) => void handleDuplicate(product)}
                    onDelete={(product) => void handleDelete(product)}
                  />
                ) : products.length ? (
                  <div className="rounded-[28px] border border-dashed border-white/12 bg-[#1a1a1a] p-12 text-center">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.searchProducts}</p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{t.noSearchResults}</h3>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/55">{t.adjustSearch}</p>
                  </div>
                ) : (
                  <ProductTable
                    products={filteredProducts}
                    loading={loading}
                    deletingId={deletingId}
                    duplicatingId={duplicatingId}
                    onEdit={openEditModal}
                    onDuplicate={(product) => void handleDuplicate(product)}
                    onDelete={(product) => void handleDelete(product)}
                  />
                )}
              </div>
            ) : activeSection === 'categories' ? (
              <div className="mt-6">
                <CategoryManager
                  categories={categories}
                  updatingId={updatingCategoryId}
                  deletingId={deletingCategoryId}
                  onOpenCreateModal={() => setCategoryModalOpen(true)}
                  onUploadImages={uploadCategoryImages}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              </div>
            ) : activeSection === 'shipping-rates' ? (
              <div className="mt-6">
                <ShippingRatesManager
                  shippingRates={shippingRates}
                  submitting={submitting}
                  deletingId={deletingShippingRateId}
                  onCreate={handleCreateShippingRate}
                  onUpdate={handleUpdateShippingRate}
                  onDelete={handleDeleteShippingRate}
                />
              </div>
            ) : activeSection === 'home-content' ? (
              <div className="mt-6">
                <HomeContentManager
                  homeContent={homeContent}
                  submitting={submitting}
                  onUploadImages={uploadHeroImages}
                  onSave={handleSaveHomeContent}
                />
              </div>
            ) : activeSection === 'bank-details' ? (
              <div className="mt-6">
                <BankDetailsManager bankDetails={bankDetails} submitting={submitting} onSave={handleSaveBankDetails} />
              </div>
            ) : activeSection === 'orders' ? (
              <div className="mt-6">
                <OrdersManager
                  orders={orders}
                  loading={loading}
                  updatingOrderId={updatingOrderId}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              </div>
            ) : activeSection === 'customers' ? (
              <div className="mt-6">
                <CustomersManager users={users} loading={loading} />
              </div>
            ) : (
              <div className="mt-6 rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-10 text-center">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.placeholder}</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{t.customersModule}</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/56">
                  {t.dynamicContentDescription}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <ProductForm
        open={modalOpen}
        title={editingProduct ? t.productEditorEditTitle : t.productEditorCreateTitle}
        submitLabel={editingProduct ? t.saveChanges : t.createProduct}
        initialValues={editingProduct ? toFormValues(editingProduct) : emptyForm}
        categories={categories}
        submitting={submitting}
        onUploadImages={uploadProductImages}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmit}
      />

      <CategoryCreateModal
        open={categoryModalOpen}
        creating={creatingCategory}
        onUploadImages={uploadCategoryImages}
        onClose={() => setCategoryModalOpen(false)}
        onCreate={handleCreateCategory}
      />
    </div>
  );
}
