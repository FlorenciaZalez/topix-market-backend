import { motion } from 'framer-motion';
import { ArrowRight, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchCategories, fetchHomeContent, fetchProducts, fetchShippingRates } from 'api/shop';
import { Hero } from 'components/Hero';
import { ProductCard } from 'components/ProductCard';
import { SafeImage } from 'components/SafeImage';
import type { Category, HomeContent, Product, ShippingRate } from 'types';
import { formatCurrency } from 'utils/currency';
import { buildWhatsAppHref } from 'utils/whatsapp';

const whatsappHref = buildWhatsAppHref('Hola quiero consultar por un producto');

const categoryImages = [
  {
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-12',
  },
  {
    image:
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  },
  {
    image:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80&sat=-5',
  },
] as const;

const featuredBadges = ['Nuevo', 'Oferta', 'Mas vendido', 'Nuevo', 'Oferta', 'Mas vendido', 'Nuevo', 'Oferta'];

const promoImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [shippingMessage, setShippingMessage] = useState<string | null>(null);
  const [shippingPrice, setShippingPrice] = useState<string | null>(null);

  const loadHomeData = async () => {
    setIsLoading(true);
    setLoadError(null);

    const [productsResult, categoriesResult, shippingRatesResult, homeContentResult] = await Promise.allSettled([
      fetchProducts(),
      fetchCategories(),
      fetchShippingRates(),
      fetchHomeContent(),
    ]);

    if (productsResult.status === 'fulfilled') {
      setProducts(productsResult.value);
    } else {
      setProducts([]);
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value);
    } else {
      setCategories([]);
    }

    if (shippingRatesResult.status === 'fulfilled') {
      setShippingRates(shippingRatesResult.value);
    } else {
      setShippingRates([]);
    }

    if (homeContentResult.status === 'fulfilled') {
      setHomeContent(homeContentResult.value);
    } else {
      setHomeContent(null);
    }

    if (
      productsResult.status === 'rejected' ||
      categoriesResult.status === 'rejected' ||
      shippingRatesResult.status === 'rejected' ||
      homeContentResult.status === 'rejected'
    ) {
      setLoadError('No pudimos cargar todo el contenido. Reintenta en unos segundos.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadHomeData();
  }, []);

  const featuredProducts = products.slice(0, 3);
  const categoryLinks = categories.map((category, index) => ({
    id: category.id,
    title: category.name,
    image: category.image_url || categoryImages[index % categoryImages.length].image,
  }));
  const heroImageUrl = homeContent?.hero_image_url || undefined;
  const newArrivalsImageUrl = homeContent?.new_arrivals_image_url || promoImage;

  function handleShippingCalculation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPostalCode = Number(postalCode.trim());
    if (!postalCode.trim() || Number.isNaN(normalizedPostalCode)) {
      setShippingPrice(null);
      setShippingMessage('Ingresa un codigo postal valido para calcular el envio.');
      return;
    }

    const matchingRate = shippingRates.find(
      (shippingRate) => normalizedPostalCode >= shippingRate.cp_from && normalizedPostalCode <= shippingRate.cp_to,
    );

    if (!matchingRate) {
      setShippingPrice(null);
      setShippingMessage('Todavia no tenemos una tarifa cargada para ese codigo postal. Escribinos por WhatsApp y lo cotizamos.');
      return;
    }

    setShippingPrice(formatCurrency(matchingRate.price));
    setShippingMessage(`Envio estimado para CP ${normalizedPostalCode}.`);
  }

  return (
    <div>
      <Hero imageUrl={heroImageUrl} />

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-20 sm:px-6 sm:pt-24 sm:pb-24 lg:px-8 lg:pt-28 lg:pb-28">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-moss/70">Categorias</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">Explora por categoria.</h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {categoryLinks.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.06 }}
            >
              <Link to={`/shop?category=${category.id}`} className="group block overflow-hidden rounded-[30px] shadow-[0_22px_54px_rgba(64,79,62,0.12)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SafeImage
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(29,37,31,0.42)] via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="inline-flex items-center rounded-full border border-white/25 bg-white/14 px-4 py-2 text-sm font-medium tracking-[0.08em] text-white backdrop-blur-md transition duration-300 group-hover:bg-white/22">
                      {category.title}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {!isLoading && categoryLinks.length === 0 ? (
            <div className="sm:col-span-2 xl:col-span-4 rounded-[30px] border border-white/60 bg-white/45 px-6 py-10 text-center text-sm text-ink/70 shadow-soft backdrop-blur-sm">
              No hay categorias para mostrar ahora.
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[38px] bg-[rgba(245,237,225,0.82)] px-5 py-10 shadow-[0_24px_70px_rgba(49,66,54,0.08)] sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-moss/70">Destacados</p>
              <h2 className="mt-3 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">Productos destacados.</h2>
            </div>
            <Link to="/shop" className="topix-button-secondary self-start sm:self-auto">
              Ver todos
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} badge={product.is_on_sale ? 'Oferta' : featuredBadges[index]} />
            ))}

            {!isLoading && featuredProducts.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-[28px] border border-white/60 bg-white/52 px-6 py-10 text-center text-sm text-ink/70 shadow-soft backdrop-blur-sm">
                No hay productos destacados disponibles en este momento.
              </div>
            ) : null}
          </div>

          {loadError ? (
            <div className="mt-6 flex flex-col items-center gap-3 rounded-[24px] border border-[#cdbda8] bg-white/48 px-5 py-5 text-center text-sm text-ink/72 sm:flex-row sm:justify-between sm:text-left">
              <p>{loadError}</p>
              <button type="button" onClick={() => void loadHomeData()} className="topix-button-secondary">
                Reintentar
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-[36px] border border-white/55 bg-linen/80 shadow-float"
        >
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[280px] overflow-hidden">
              <SafeImage
                src={newArrivalsImageUrl}
                alt="Nuevos ingresos Topix"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(27,35,29,0.18)] to-transparent" />
            </div>
            <div className="flex items-center px-8 py-10 sm:px-10 lg:px-12">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-moss/70">Nuevos ingresos</p>
                <h2 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink sm:text-5xl">
                  Descubrí los <span className="whitespace-nowrap">nuevos ingresos.</span>
                </h2>
                <div className="mt-8">
                  <Link to="/shop" className="topix-button">
                    Ver productos
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-[36px] border border-white/55 bg-white/58 p-8 shadow-soft backdrop-blur-md sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-moss/70">Calcular envio</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl">
                Descubri el costo de envio según tu codigo postal.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-ink/65 sm:text-lg sm:leading-9">
                Ingresa tu CP y conocé el valor del envío.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/55 bg-[rgba(246,238,226,0.76)] p-5 shadow-[0_22px_50px_rgba(49,66,54,0.08)] backdrop-blur-xl sm:p-6">
              <form className="space-y-4" onSubmit={handleShippingCalculation}>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.28em] text-moss/70">Codigo postal</span>
                  <div className="flex items-center gap-3 rounded-[24px] border border-white/50 bg-white/56 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                    <MapPin size={18} className="text-moss/70" />
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      placeholder="Ej: 1406"
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/34"
                    />
                  </div>
                </label>

                <button type="submit" className="topix-button w-full">
                  Calcular envio
                </button>
              </form>

              <div className="mt-4 rounded-[24px] border border-white/55 bg-white/44 px-5 py-4 text-center shadow-[0_18px_36px_rgba(49,66,54,0.06)]">
                {shippingPrice ? (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-moss/68">Costo de envío</p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-ink">{shippingPrice}</p>
                    <p className="mt-2 text-sm text-ink/62">{shippingMessage}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-moss/68">Costo de envío</p>
                    <p className="mt-3 text-sm leading-7 text-ink/62">
                      {shippingMessage || 'Ingresa tu codigo postal para ver el valor del envio antes de avanzar con tu compra.'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-[36px] border border-white/55 bg-white/58 px-8 py-10 text-center shadow-soft backdrop-blur-md sm:px-10 sm:py-12"
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-moss/70">Contacto directo</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.05em] text-ink sm:text-5xl">Necesitas ayuda?</h2>
          <div className="mt-8 flex justify-center">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="topix-button">
              
              Hablar por WhatsApp
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
