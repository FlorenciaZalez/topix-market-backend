import { Landmark, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { translations } from '../i18n/es';
import type { BankDetails } from 'types';

type BankDetailsFormValues = {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
  contactPhone: string;
};

type BankDetailsManagerProps = {
  bankDetails: BankDetails | null;
  submitting: boolean;
  onSave: (values: BankDetailsFormValues) => Promise<void>;
};

const t = translations.es;

export function BankDetailsManager({ bankDetails, submitting, onSave }: BankDetailsManagerProps) {
  const [values, setValues] = useState<BankDetailsFormValues>({
    bankName: '',
    accountHolder: '',
    cbu: '',
    alias: '',
    cuit: '',
    contactPhone: '',
  });

  useEffect(() => {
    setValues({
      bankName: bankDetails?.bank_name ?? '',
      accountHolder: bankDetails?.account_holder ?? '',
      cbu: bankDetails?.cbu ?? '',
      alias: bankDetails?.alias ?? '',
      cuit: bankDetails?.cuit ?? '',
      contactPhone: bankDetails?.contact_phone ?? '',
    });
  }, [bankDetails]);

  function updateField(field: keyof BankDetailsFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="border-b border-white/8 pb-5">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-blue-500/12 p-2 text-blue-200">
            <Landmark size={18} />
          </span>
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{t.bankDetails}</h3>
            <p className="mt-1 text-sm leading-7 text-white/55">{t.bankDetailsDescription}</p>
          </div>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onSave(values);
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.bankName}</span>
          <input value={values.bankName} onChange={(event) => updateField('bankName', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.accountHolder}</span>
          <input value={values.accountHolder} onChange={(event) => updateField('accountHolder', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">CBU</span>
          <input value={values.cbu} onChange={(event) => updateField('cbu', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">Alias</span>
          <input value={values.alias} onChange={(event) => updateField('alias', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">CUIT</span>
          <input value={values.cuit} onChange={(event) => updateField('cuit', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.28em] text-white/38">{t.contactPhone}</span>
          <input value={values.contactPhone} onChange={(event) => updateField('contactPhone', event.target.value)} className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/30" />
        </label>

        <div className="lg:col-span-2">
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={16} />
            {t.saveBankDetails}
          </button>
        </div>
      </form>
    </section>
  );
}