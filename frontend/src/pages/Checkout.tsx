import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { createOrder, createPaymentPreference, fetchBankDetails } from 'api/shop';
import { GlassCard } from 'components/GlassCard';
import { PageIntro } from 'components/PageIntro';
import { useAuth } from 'context/AuthContext';
import { useCart } from 'context/CartContext';
import type { BankDetails, DeliveryAddress, PaymentMethod, ShippingMethod } from 'types';
import { formatCurrency } from 'utils/currency';

function formatDeliveryAddress(address: DeliveryAddress) {
  const lineOne = `${address.street} ${address.number}${address.apartment ? `, ${address.apartment}` : ''}`;
  const lineTwo = `${address.city} · CP ${address.postal_code}`;
  return `${address.full_name} | ${address.phone} | ${lineOne} | ${lineTwo}${address.notes ? ` | ${address.notes}` : ''}`;
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  return 'No pudimos iniciar el checkout. Intenta nuevamente.';
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, deliveryAddress, clearCart, clearDeliveryAddress } = useCart();
  const { user } = useAuth();
  const [shippingMethod] = useState<ShippingMethod>('flat_rate');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercado_pago');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankDetailsError, setBankDetailsError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchBankDetails()
      .then((data) => {
        setBankDetails(data);
        setBankDetailsError(null);
      })
      .catch(() => {
        setBankDetails(null);
        setBankDetailsError('Todavia no hay datos bancarios configurados para transferencia bancaria.');
      });
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        const unitPrice = item.product.is_on_sale && item.product.sale_price ? item.product.sale_price : item.product.price;
        return acc + Number(unitPrice) * item.quantity;
      }, 0),
    [items],
  );

  const shippingPrice = shippingMethod === 'flat_rate' ? 2500 : 0;
  const total = subtotal + shippingPrice;
  const formattedDeliveryAddress = deliveryAddress ? formatDeliveryAddress(deliveryAddress) : null;

  async function handleCheckout() {
    if (!user || !items.length || !formattedDeliveryAddress) {
      return;
    }

    if (paymentMethod === 'bank_transfer' && !bankDetails) {
      return;
    }

    setCheckoutError(null);
    setLoading(true);
    try {
      const order = await createOrder({
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        delivery_address: formattedDeliveryAddress,
        items: items.map((item) => ({
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
        })),
      });

      if (paymentMethod === 'mercado_pago') {
        const preference = await createPaymentPreference(order.id);
        clearCart();
        clearDeliveryAddress();
        window.location.href = preference.init_point;
        return;
      }

      clearCart();
      clearDeliveryAddress();
      navigate(`/checkout/transfer-confirmation?orderId=${order.id}`);
    } catch (error) {
      setCheckoutError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="topix-page">
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-10">
          <p className="topix-kicker">Checkout</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Necesitas iniciar sesion para continuar.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-ink/65">
            La compra se procesa con tu cuenta para generar la orden y continuar luego con el metodo de pago elegido.
          </p>
          <Link to="/login" className="topix-button mt-7">
            Ir a login
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="topix-page">
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-10">
          <p className="topix-kicker">Checkout</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Tu carrito esta vacio.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-ink/65">Agrega productos antes de continuar con el pago.</p>
          <Link to="/shop" className="topix-button mt-7">
            Ver productos
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (!deliveryAddress) {
    return (
      <div className="topix-page">
        <GlassCard className="mx-auto max-w-2xl p-8 text-center sm:p-10">
          <p className="topix-kicker">Direccion de entrega</p>
          <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Falta tu direccion antes del checkout.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-ink/65">
            Completa primero los datos de entrega para poder generar el pedido correctamente.
          </p>
          <Link to="/checkout/address" className="topix-button mt-7">
            Cargar direccion
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="topix-page grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <div className="space-y-5">
        <PageIntro
          eyebrow="Checkout"
          title="Ultima revision antes del pago."
          description="Elige tu metodo de pago y confirma tu seleccion para finalizar la compra de la forma que prefieras."
        />

        <GlassCard className="p-8">
          <div className="space-y-4">
            <label className="flex cursor-pointer items-start gap-4 rounded-[24px] border border-white/40 bg-white/40 p-5 transition duration-200 hover:bg-white/52">
              <input
                type="radio"
                checked={paymentMethod === 'mercado_pago'}
                onChange={() => setPaymentMethod('mercado_pago')}
                className="mt-1"
              />
              <div>
                <p className="text-lg font-semibold text-ink">Mercado Pago</p>
                <p className="mt-1 text-sm leading-7 text-ink/60">Seras redirigido a Mercado Pago para completar la compra.</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-start gap-4 rounded-[24px] border border-white/40 bg-white/40 p-5 transition duration-200 hover:bg-white/52">
              <input
                type="radio"
                checked={paymentMethod === 'bank_transfer'}
                onChange={() => setPaymentMethod('bank_transfer')}
                className="mt-1"
              />
              <div>
                <p className="text-lg font-semibold text-ink">Transferencia bancaria</p>
                <p className="mt-1 text-sm leading-7 text-ink/60">Al seleccionarla, veras los datos bancarios para completar la compra.</p>
              </div>
            </label>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="h-fit p-8 lg:sticky lg:top-28">
        <p className="topix-kicker">{paymentMethod === 'bank_transfer' ? 'Datos bancarios' : 'Resumen de compra'}</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">
          {paymentMethod === 'bank_transfer' ? 'Completa tu transferencia.' : 'Todo listo para avanzar.'}
        </h2>

        <div className="mt-6 rounded-[24px] border border-white/40 bg-white/42 p-5 text-sm leading-7 text-ink/68">
          <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">Entrega</p>
          <p className="mt-2 font-medium text-ink">{deliveryAddress.full_name}</p>
          <p>{deliveryAddress.phone}</p>
          <p>{deliveryAddress.street} {deliveryAddress.number}{deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}</p>
          <p>{deliveryAddress.city} · CP {deliveryAddress.postal_code}</p>
          {deliveryAddress.notes ? <p>{deliveryAddress.notes}</p> : null}
          <Link to="/checkout/address" className="mt-3 inline-flex text-sm font-medium text-moss transition hover:text-ink">
            Editar direccion
          </Link>
        </div>

        {paymentMethod === 'bank_transfer' ? (
          <div className="mt-6 space-y-4">
            {bankDetails ? (
              <div className="topix-panel p-6">
                <div className="space-y-4 text-sm text-ink/72">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">Banco</p>
                    <p className="mt-1 font-medium text-ink">{bankDetails.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">Titular</p>
                    <p className="mt-1 font-medium text-ink">{bankDetails.account_holder}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">CBU</p>
                    <p className="mt-1 break-all font-medium text-ink">{bankDetails.cbu}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">Alias</p>
                    <p className="mt-1 font-medium text-ink">{bankDetails.alias}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">CUIT</p>
                    <p className="mt-1 font-medium text-ink">{bankDetails.cuit}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-moss/62">Telefono para comprobante</p>
                    <p className="mt-1 font-medium text-ink">{bankDetails.contact_phone || 'No configurado'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#d8c9b7] bg-white/44 px-5 py-4 text-sm leading-7 text-ink/65">
                {bankDetailsError}
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 space-y-3 text-ink/70">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.variant.id}`} className="topix-subpanel flex items-center justify-between gap-4 p-4">
              <span className="text-sm leading-7 text-ink/65">
                {item.product.name} · {item.variant.color} x{item.quantity}
              </span>
              <span className="shrink-0 text-sm font-medium text-ink">
                {formatCurrency(
                  (item.product.is_on_sale && item.product.sale_price ? item.product.sale_price : item.product.price) as string,
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3 border-t border-white/40 pt-6">
          <div className="flex items-center justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-ink/70">
            <span>Envio</span>
            <span>{shippingMethod === 'flat_rate' ? formatCurrency(shippingPrice) : 'A coordinar luego'}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-semibold text-ink">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        {checkoutError ? (
          <div className="mt-4 rounded-[20px] border border-red-300/45 bg-red-50/60 px-4 py-3 text-sm text-red-900/80">
            {checkoutError}
          </div>
        ) : null}
        <button
          disabled={loading || !items.length || !deliveryAddress || (paymentMethod === 'bank_transfer' && !bankDetails)}
          onClick={() => void handleCheckout()}
          className="topix-button mt-8 w-full"
        >
          {loading
            ? paymentMethod === 'mercado_pago'
              ? 'Preparando checkout...'
              : 'Generando pedido...'
            : paymentMethod === 'mercado_pago'
              ? 'Continuar a Mercado Pago'
              : 'Confirmar pedido por transferencia'}
        </button>
      </GlassCard>
    </div>
  );
}
