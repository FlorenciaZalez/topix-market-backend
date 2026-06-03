import { Copy, Pencil, Trash2 } from 'lucide-react';

import { normalizeAssetUrl } from 'api/client';
import { translations } from '../i18n/es';
import type { Product } from 'types';

type ProductTableProps = {
  products: Product[];
  loading: boolean;
  deletingId: number | null;
  duplicatingId: number | null;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const t = translations.es;

function formatPrice(price: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function getStock(product: Product) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

export function ProductTable({ products, loading, deletingId, duplicatingId, onEdit, onDuplicate, onDelete }: ProductTableProps) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#1a1a1a] p-10 text-center text-sm text-white/58">
        {t.loadingProducts}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/12 bg-[#1a1a1a] p-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.emptyState}</p>
        <h3 className="mt-4 text-2xl font-semibold text-white">{t.noProductsYet}</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/55">
          {t.createFirstProduct}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1a1a1a]">
      <div className="max-h-[62vh] overflow-auto">
        <table className="min-w-full table-fixed divide-y divide-white/8 text-left text-sm text-white/72">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[34%]" />
          </colgroup>
          <thead className="text-[11px] uppercase tracking-[0.28em] text-white/38">
            <tr>
              <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.name}</th>
              <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.price}</th>
              <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.stock}</th>
              <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 text-right font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-5 align-top">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                      {product.images[0] ? (
                        <img src={normalizeAssetUrl(product.images[0].url) ?? ''} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/28">{t.imageFallback}</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white" title={product.name}>{product.name}</p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/32" title={product.slug}>{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top font-medium text-white">{formatPrice(product.price)}</td>
                <td className="px-6 py-5 align-top text-white/72">{getStock(product)}</td>
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/76 transition hover:border-blue-400/30 hover:text-blue-200"
                    >
                      <Pencil size={14} />
                      {t.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(product)}
                      disabled={duplicatingId === product.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/76 transition hover:border-violet-400/30 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Copy size={14} />
                      {duplicatingId === product.id ? t.duplicating : t.duplicate}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      disabled={deletingId === product.id}
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/16 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                      {deletingId === product.id ? t.deleting : t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}