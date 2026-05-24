import { Pencil, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { translations } from '../i18n/es';
import type { ShippingRate } from 'types';
import { formatCurrency } from 'utils/currency';

type ShippingRateFormValues = {
  cpFrom: string;
  cpTo: string;
  price: string;
};

type ShippingRatesManagerProps = {
  shippingRates: ShippingRate[];
  submitting: boolean;
  deletingId: number | null;
  onCreate: (values: ShippingRateFormValues) => Promise<void>;
  onUpdate: (shippingRate: ShippingRate, values: ShippingRateFormValues) => Promise<void>;
  onDelete: (shippingRate: ShippingRate) => Promise<void>;
};

const t = translations.es;
const emptyValues: ShippingRateFormValues = { cpFrom: '', cpTo: '', price: '' };

function formatRange(shippingRate: ShippingRate) {
  return `${shippingRate.cp_from} - ${shippingRate.cp_to}`;
}

export function ShippingRatesManager({ shippingRates, submitting, deletingId, onCreate, onUpdate, onDelete }: ShippingRatesManagerProps) {
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [values, setValues] = useState<ShippingRateFormValues>(emptyValues);

  useEffect(() => {
    if (!editingRateId) {
      setValues(emptyValues);
    }
  }, [editingRateId]);

  function startEditing(shippingRate: ShippingRate) {
    setEditingRateId(shippingRate.id);
    setValues({
      cpFrom: String(shippingRate.cp_from),
      cpTo: String(shippingRate.cp_to),
      price: String(Number(shippingRate.price)),
    });
  }

  function cancelEditing() {
    setEditingRateId(null);
    setValues(emptyValues);
  }

  function updateField(field: keyof ShippingRateFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingRateId) {
      const shippingRate = shippingRates.find((item) => item.id === editingRateId);
      if (!shippingRate) {
        return;
      }
      await onUpdate(shippingRate, values);
      cancelEditing();
      return;
    }

    await onCreate(values);
    setValues(emptyValues);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="border-b border-white/8 pb-5">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
            {editingRateId ? t.shippingRateEditTitle : t.shippingRateFormTitle}
          </h3>
          <p className="mt-2 text-sm leading-7 text-white/55">{t.shippingRateRangeHelp}</p>
        </div>

        <form className="mt-6 grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.cpFrom}</span>
            <input
              type="number"
              min="0"
              value={values.cpFrom}
              onChange={(event) => updateField('cpFrom', event.target.value)}
              className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-blue-400/30"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.cpTo}</span>
            <input
              type="number"
              min="0"
              value={values.cpTo}
              onChange={(event) => updateField('cpTo', event.target.value)}
              className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-blue-400/30"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.shippingRatePrice}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-blue-400/30"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {editingRateId ? t.updateShippingRate : t.createShippingRate}
            </button>

            {editingRateId ? (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/78 transition hover:bg-white/[0.06]"
              >
                <X size={16} />
                {t.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {!shippingRates.length ? (
        <div className="rounded-[28px] border border-dashed border-white/12 bg-[#1a1a1a] p-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.shippingRates}</p>
          <h3 className="mt-4 text-2xl font-semibold text-white">{t.shippingRatesEmpty}</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/55">{t.noShippingRatesHelp}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1a1a1a]">
          <div className="max-h-[62vh] overflow-auto">
            <table className="min-w-full table-fixed divide-y divide-white/8 text-left text-sm text-white/72">
              <colgroup>
                <col className="w-[36%]" />
                <col className="w-[24%]" />
                <col className="w-[40%]" />
              </colgroup>
              <thead className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                <tr>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.shippingRateRange}</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.shippingRatePrice}</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 text-right font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {shippingRates.map((shippingRate) => (
                  <tr key={shippingRate.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-5 align-top font-medium text-white">{formatRange(shippingRate)}</td>
                    <td className="px-6 py-5 align-top text-white">{formatCurrency(shippingRate.price)}</td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(shippingRate)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white/76 transition hover:border-blue-400/30 hover:text-blue-200"
                        >
                          <Pencil size={14} />
                          {t.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(shippingRate)}
                          disabled={deletingId === shippingRate.id}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/16 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}