import { Link } from 'react-router-dom';

import { GlassCard } from 'components/GlassCard';
import { PageIntro } from 'components/PageIntro';
import { SafeImage } from 'components/SafeImage';
import { useCart } from 'context/CartContext';
import { formatCurrency } from 'utils/currency';

export function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.is_on_sale && item.product.sale_price ? item.product.sale_price : item.product.price;
    return acc + Number(unitPrice) * item.quantity;
  }, 0);

  return (
    <div className="topix-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <PageIntro
          eyebrow="Carrito"
          title="Productos seleccionados"
          description="Revisa tu carrito antes de finalizar tu compra."
        />

        {items.length ? (
          items.map((item) => {
            const unitPrice = item.product.is_on_sale && item.product.sale_price ? item.product.sale_price : item.product.price;
            return (
              <GlassCard key={`${item.product.id}-${item.variant.id}`} className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                  <SafeImage
                    src={item.product.images[0]?.url || 'https://placehold.co/300x400/f5efe3/47624d?text=Topix'}
                    alt={item.product.name}
                    className="h-28 w-24 rounded-[22px] object-cover"
                    fallbackSrc="/placeholder-topix.svg"
                  />
                  <div>
                    <p className="topix-kicker">{item.variant.color}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink">{item.product.name}</p>
                    <p className="mt-2 text-sm leading-7 text-ink/56">{formatCurrency(unitPrice)} por unidad</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-full border border-white/55 bg-white/58 shadow-glass">
                    <button
                      className="px-4 py-3 text-ink/68 transition hover:bg-white/68"
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.product.id, item.variant.id, Number(event.target.value))}
                      className="w-16 bg-transparent px-1 py-3 text-center text-sm text-ink outline-none"
                    />
                    <button
                      className="px-4 py-3 text-ink/68 transition hover:bg-white/68"
                      onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button className="text-sm font-medium text-ink/48 transition hover:text-red-600" onClick={() => removeItem(item.product.id, item.variant.id)}>
                    Quitar
                  </button>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="p-10 text-center">
            <p className="topix-kicker">Carrito vacio</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Todavia no sumaste ninguna pieza.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-ink/62">
              Explora la coleccion y arma una seleccion que combine materiales, tonos y presencia visual.
            </p>
            <Link to="/shop" className="topix-button mt-7">
              Ver productos
            </Link>
          </GlassCard>
        )}
      </div>

      <GlassCard className="h-fit p-8 lg:sticky lg:top-28">
        <p className="topix-kicker">Resumen</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">Resumen de compra</h2>
        <div className="mt-8 space-y-4 border-t border-white/45 pt-6 text-base text-ink/70">
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Envio</span>
            <span>Se define en checkout</span>
          </div>
        </div>
        {/* <p className="mt-6 text-sm leading-7 text-ink/56">
          Podras elegir tarifa fija o coordinacion personalizada antes de pasar al pago.
        </p> */}
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/checkout/address" className="topix-button w-full">
            Continuar con direccion
          </Link>
          <Link to="/shop" className="topix-button-secondary w-full">
            Seguir comprando
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
