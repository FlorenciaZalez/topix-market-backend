import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { translations } from '../i18n/es';
import type { Category } from 'types';
import { parseLocaleNumberInput } from 'utils/number';

export type ProductVariantFormValue = {
  rowId: string;
  color: string;
  colorHex: string;
  imageUrl: string;
  stock: string;
};

export type ProductFormValues = {
  categoryIds: string[];
  name: string;
  price: string;
  description: string;
  isOnSale: boolean;
  variants: ProductVariantFormValue[];
  images: string[];
};

type ProductFormProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues: ProductFormValues;
  categories: Category[];
  submitting: boolean;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
};

const t = translations.es;

const emptyErrors = {
  categoryIds: '',
  name: '',
  price: '',
  variants: '',
  description: '',
};

let variantRowSequence = 0;

function createVariantRowId() {
  variantRowSequence += 1;
  return `variant-row-${variantRowSequence}`;
}

const createEmptyVariant = (): ProductVariantFormValue => ({
  rowId: createVariantRowId(),
  color: '',
  colorHex: '#314236',
  imageUrl: '',
  stock: '0',
});

export function ProductForm({
  open,
  title,
  submitLabel,
  initialValues,
  categories,
  submitting,
  onUploadImages,
  onClose,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState(emptyErrors);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors(emptyErrors);
      setUploadError('');
      setCategoriesOpen(false);
    }
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  function removeImage(index: number) {
    setValues((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
      variants: current.variants.map((variant) =>
        variant.imageUrl === current.images[index]
          ? {
              ...variant,
              imageUrl: '',
            }
          : variant,
      ),
    }));
  }

  function updateVariant(index: number, nextVariant: ProductVariantFormValue) {
    setValues((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (variantIndex === index ? nextVariant : variant)),
    }));
  }

  function addVariant() {
    setValues((current) => ({
      ...current,
      variants: [...current.variants, createEmptyVariant()],
    }));
  }

  function removeVariant(index: number) {
    setValues((current) => ({
      ...current,
      variants:
        current.variants.length === 1
          ? [createEmptyVariant()]
          : current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setUploadError('');
    setUploadingImages(true);

    try {
      const uploadedUrls = await onUploadImages(files);
      setValues((current) => ({
        ...current,
        images: [...current.images.filter(Boolean), ...uploadedUrls],
      }));
    } catch {
      setUploadError(t.uploadError);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  }

  function updateVariantImage(index: number, imageUrl: string) {
    setValues((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => {
        if (variantIndex === index) {
          return {
            ...variant,
            imageUrl,
          };
        }

        if (imageUrl && variant.imageUrl === imageUrl) {
          return {
            ...variant,
            imageUrl: '',
          };
        }

        return variant;
      }),
    }));
  }

  function validate() {
    const parsedPrice = parseLocaleNumberInput(values.price);

    const hasVariantBasics =
      values.variants.length > 0 &&
      values.variants.every(
        (variant) =>
          variant.color.trim() &&
          variant.stock.trim() &&
          Number.isInteger(Number(variant.stock)) &&
          Number(variant.stock) >= 0,
      );

    const hasVariantImages = values.variants.length > 0 && values.variants.every((variant) => variant.imageUrl.trim());

    const hasValidVariants =
      values.variants.length > 0 &&
      hasVariantBasics &&
      hasVariantImages;

    const nextErrors = {
      categoryIds: values.categoryIds.length ? '' : t.categoryRequired,
      name: values.name.trim() ? '' : t.nameRequired,
      price: parsedPrice !== null && parsedPrice >= 0 ? '' : t.validPrice,
      variants: hasValidVariants ? '' : hasVariantBasics ? t.colorImageRequired : t.atLeastOneColor,
      description: values.description.trim() ? '' : t.descriptionRequired,
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((error) => !error);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    await onSubmit({
      ...values,
      images: values.images.filter(Boolean),
      variants: values.variants.map((variant) => ({
        rowId: variant.rowId,
        color: variant.color.trim(),
        colorHex: variant.colorHex,
        imageUrl: variant.imageUrl.trim(),
        stock: variant.stock.trim(),
      })),
    });
  }

  const selectedCategoryNames = categories
    .filter((category) => values.categoryIds.includes(String(category.id)))
    .map((category) => category.name);

  const categoriesTriggerLabel = selectedCategoryNames.length
    ? selectedCategoryNames.join(', ')
    : t.selectCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#111111] p-6 text-white shadow-[0_36px_120px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/38">{t.productEditor}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/68 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">{t.categories}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen((current) => !current)}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-left text-sm outline-none transition',
                  categoriesOpen
                    ? 'border-blue-400/40 bg-[#202020]'
                    : 'border-white/10 bg-[#1a1a1a] hover:border-white/20 hover:bg-[#202020]',
                ].join(' ')}
              >
                <span className={selectedCategoryNames.length ? 'truncate text-white' : 'truncate text-white/45'}>
                  {categoriesTriggerLabel}
                </span>
                <ChevronDown
                  size={16}
                  className={[
                    'shrink-0 text-white/55 transition-transform',
                    categoriesOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </button>

              {categoriesOpen ? (
                <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-[24px] border border-white/10 bg-[#171717] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const isSelected = values.categoryIds.includes(String(category.id));

                      return (
                        <label
                          key={category.id}
                          className={[
                            'flex cursor-pointer items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm transition',
                            isSelected
                              ? 'border-blue-400/40 bg-blue-500/10 text-white'
                              : 'border-white/10 bg-[#1a1a1a] text-white/72 hover:border-white/20 hover:bg-[#202020]',
                          ].join(' ')}
                        >
                          <span className="truncate">{category.name}</span>
                          <span
                            className={[
                              'flex h-5 w-5 items-center justify-center rounded-full border transition',
                              isSelected ? 'border-blue-300 bg-blue-300 text-[#111111]' : 'border-white/20 bg-transparent text-transparent',
                            ].join(' ')}
                          >
                            <Check size={12} />
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) =>
                              setValues((current) => ({
                                ...current,
                                categoryIds: event.target.checked
                                  ? [...current.categoryIds, String(category.id)]
                                  : current.categoryIds.filter((categoryId) => categoryId !== String(category.id)),
                              }))
                            }
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            {errors.categoryIds ? <p className="mt-2 text-xs text-red-300">{errors.categoryIds}</p> : null}
            {!categories.length ? <p className="mt-2 text-xs text-white/45">{t.noCategoriesHelp}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">{t.name}</label>
            <input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
              placeholder={t.premiumOfficeChair}
            />
            {errors.name ? <p className="mt-2 text-xs text-red-300">{errors.name}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">{t.price}</label>
            <input
              type="text"
              inputMode="decimal"
              value={values.price}
              onChange={(event) => setValues((current) => ({ ...current, price: event.target.value }))}
              className="w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
              placeholder="239.000 o 239000,50"
            />
            {errors.price ? <p className="mt-2 text-xs text-red-300">{errors.price}</p> : null}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#171717] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-white/42">{t.productColors}</label>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.productColorsHelp}</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/16"
              >
                <Plus size={15} />
                {t.addColorOption}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {values.variants.map((variant, index) => (
                <div key={variant.rowId} className="rounded-[22px] border border-white/10 bg-[#121212] p-3 sm:p-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_120px_auto] sm:items-center">
                    <input
                      value={variant.color}
                      onChange={(event) => updateVariant(index, { ...variant, color: event.target.value })}
                      className="h-14 w-full rounded-[18px] border border-white/10 bg-[#1a1a1a] px-4 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
                      placeholder={t.colorPlaceholder}
                    />

                    <div className="flex h-14 items-center gap-3 rounded-[18px] border border-white/10 bg-[#1a1a1a] px-3">
                      <input
                        type="color"
                        value={variant.colorHex}
                        onChange={(event) => updateVariant(index, { ...variant, colorHex: event.target.value })}
                        className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{variant.colorHex}</p>
                        <p className="text-xs text-white/45">{t.colorTone}</p>
                      </div>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock}
                      onChange={(event) => updateVariant(index, { ...variant, stock: event.target.value })}
                      className="h-14 w-full rounded-[18px] border border-white/10 bg-[#1a1a1a] px-4 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
                      placeholder={t.stock}
                    />

                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="inline-flex h-14 w-14 items-center justify-center self-center rounded-full border border-red-500/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/16"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {errors.variants ? <p className="mt-3 text-xs text-red-300">{errors.variants}</p> : null}
          </div>

          <label className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#171717] px-4 py-4 text-sm text-white/82">
            <input
              type="checkbox"
              checked={values.isOnSale}
              onChange={(event) => setValues((current) => ({ ...current, isOnSale: event.target.checked }))}
              className="h-4 w-4 rounded border-white/20 bg-[#1a1a1a] text-blue-500 focus:ring-blue-400/40"
            />
            <div>
              <p className="font-medium text-white">{t.onSale}</p>
              <p className="mt-1 text-xs text-white/48">{t.onSaleHelp}</p>
            </div>
          </label>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">{t.description}</label>
            <textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              rows={5}
              className="w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
              placeholder={t.describeProduct}
            />
            {errors.description ? <p className="mt-2 text-xs text-red-300">{errors.description}</p> : null}
          </div>

          <div>
            <div className="rounded-[24px] border border-white/10 bg-[#171717] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-white/42">{t.uploadImages}</label>
                  <p className="mt-2 text-sm leading-6 text-white/55">{t.uploadImagesHelp}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-500/16">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  {uploadingImages ? t.uploading : t.chooseImages}
                </label>
              </div>
              {uploadError ? <p className="mt-3 text-xs text-red-300">{uploadError}</p> : null}
            </div>

            <div className="mt-4 space-y-3">
              {values.images.some(Boolean) ? (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.22em] text-white/38">{t.uploadedImages}</p>
                  <div className="mb-4 flex flex-wrap gap-3">
                    {values.images.filter(Boolean).map((image, index) => (
                      <div key={image} className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
                        <img src={image} alt={t.uploadedImages} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white transition hover:bg-black/85"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[20px] border border-white/10 bg-[#141414] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">{t.colorImageMapping}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.colorImageMappingHelp}</p>

                {values.images.some(Boolean) ? (
                  <div className="mt-4 space-y-3">
                    {values.variants.map((variant, index) => (
                      <div
                        key={`image-map-${variant.rowId}`}
                        className="grid gap-3 rounded-[18px] border border-white/10 bg-[#101010] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)] sm:items-center"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full border border-white/10"
                            style={{ backgroundColor: variant.colorHex || '#314236' }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{variant.color || t.color}</p>
                            <p className="text-xs text-white/45">{t.assignImageToColor}</p>
                          </div>
                        </div>

                        <select
                          value={variant.imageUrl}
                          onChange={(event) => updateVariantImage(index, event.target.value)}
                          className="h-12 w-full rounded-[16px] border border-white/10 bg-[#1a1a1a] px-4 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
                        >
                          <option value="">{t.selectImage}</option>
                          {values.images.filter(Boolean).map((image, imageIndex) => (
                            <option key={image} value={image}>
                              {t.uploadedImageLabel.replace('{number}', String(imageIndex + 1))}
                            </option>
                          ))}
                        </select>

                        {variant.imageUrl ? (
                          <div className="sm:col-span-2 flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#171717] p-2">
                            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
                              <img src={variant.imageUrl} alt={variant.color || t.color} className="h-full w-full object-cover" />
                            </div>
                            <p className="truncate text-xs text-white/45">{variant.imageUrl}</p>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/45">{t.noImagesToAssign}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/78 transition hover:bg-white/[0.08]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t.saving : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
