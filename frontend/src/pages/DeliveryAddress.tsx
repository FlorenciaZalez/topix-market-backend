import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GlassCard } from 'components/GlassCard';
import { PageIntro } from 'components/PageIntro';
import { useCart } from 'context/CartContext';
import type { DeliveryAddress } from 'types';

const emptyAddress: DeliveryAddress = {
  full_name: '',
  phone: '',
  street: '',
  number: '',
  apartment: '',
  city: '',
  postal_code: '',
  notes: '',
};

export function DeliveryAddressPage() {
  const navigate = useNavigate();
  const { items, deliveryAddress, setDeliveryAddress } = useCart();
  const [values, setValues] = useState<DeliveryAddress>(deliveryAddress ?? emptyAddress);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof DeliveryAddress, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.full_name || !values.phone || !values.street || !values.number || !values.city || !values.postal_code) {
      setError('Completa nombre, telefono, calle, numero, ciudad y codigo postal para continuar.');
      return;
    }

    setDeliveryAddress({
      full_name: values.full_name.trim(),
      phone: values.phone.trim(),
      street: values.street.trim(),
      number: values.number.trim(),
      apartment: values.apartment.trim(),
      city: values.city.trim(),
      postal_code: values.postal_code.trim(),
      notes: values.notes.trim(),
    });
    navigate('/checkout');
  }

  if (!items.length) {
    return (
      <div className="topix-page">
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-10">
          <p className="topix-kicker">Direccion de entrega</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Tu carrito esta vacio.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-ink/65">Agrega productos antes de completar los datos de entrega.</p>
          <Link to="/shop" className="topix-button mt-7">
            Ver productos
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="topix-page space-y-5">
      <PageIntro
        eyebrow="Entrega"
        title="Completa la direccion antes del checkout."
        description="Guardamos estos datos para asociarlos al pedido."
      />

      <GlassCard className="p-8">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleSubmit}>
          <label className="block md:col-span-2 xl:col-span-3">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Nombre y apellido</span>
            <input value={values.full_name} onChange={(event) => updateField('full_name', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Telefono</span>
            <input value={values.phone} onChange={(event) => updateField('phone', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Codigo postal</span>
            <input value={values.postal_code} onChange={(event) => updateField('postal_code', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block xl:col-span-1">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Ciudad</span>
            <input value={values.city} onChange={(event) => updateField('city', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Calle</span>
            <input value={values.street} onChange={(event) => updateField('street', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Numero</span>
            <input value={values.number} onChange={(event) => updateField('number', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block md:col-span-2 xl:col-span-3">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Departamento / Piso</span>
            <input value={values.apartment} onChange={(event) => updateField('apartment', event.target.value)} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          <label className="block md:col-span-2 xl:col-span-3">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-moss/62">Indicaciones adicionales</span>
            <textarea value={values.notes} onChange={(event) => updateField('notes', event.target.value)} rows={4} className="w-full rounded-[22px] border border-white/45 bg-white/52 px-4 py-3 text-sm text-ink outline-none transition focus:border-moss/35" />
          </label>

          {error ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[20px] border border-red-300/45 bg-red-50/60 px-4 py-3 text-sm text-red-900/80">
              {error}
            </div>
          ) : null}

          <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="topix-button">
              Ir al checkout
            </button>
            <Link to="/cart" className="topix-button-secondary text-center">
              Volver al carrito
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}