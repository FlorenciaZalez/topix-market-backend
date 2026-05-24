import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchProduct, fetchProducts } from 'api/shop';
import { GlassCard } from 'components/GlassCard';
import { ProductCard } from 'components/ProductCard';
import { SafeImage } from 'components/SafeImage';
import { useCart } from 'context/CartContext';
import type { Product, Variant } from 'types';
import { formatCurrency } from 'utils/currency';
import { buildWhatsAppHref } from 'utils/whatsapp';

const placeholderImage = '/placeholder-topix.svg';

const serviceHighlights = ['Entrega coordinada', 'Producto seleccionado', 'Atencion personalizada'];

function buildWhatsappHref(productName: string) {
  return buildWhatsAppHref(`Hola, quiero consultar por ${productName}.`);
}

function getStockMeta(stock: number) {
  if (stock <= 0) {
    return {
      label: 'Sin stock',
      tone: 'text-[#9a5c4d]',
      chip: 'border-[#d8b7aa] bg-[#fff1eb] text-[#9a5c4d]',
    };
  }

  if (stock <= 3) {
    return {
      label: 'Ultimas unidades',
      tone: 'text-[#8d6a2f]',
      chip: 'border-[#ead4a9] bg-[#fff7e7] text-[#8d6a2f]',
    };
  }

  return {
    label: 'En stock',
    tone: 'text-moss',
    chip: 'border-[rgba(93,116,94,0.18)] bg-[rgba(93,116,94,0.1)] text-moss',
  };
}

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState(placeholderImage);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) {
      return;
    }

    void Promise.all([fetchProduct(Number(productId)), fetchProducts()]).then(([productData, products]) => {
      setProduct(productData);
      setSelectedVariant(productData.variants[0] ?? null);
      setSelectedImage(productData.images[0]?.url ?? placeholderImage);
      setQuantity(1);
      setRelatedProducts(products.filter((item) => item.id !== productData.id).slice(0, 4));
    });
  }, [productId]);

  const displayPrice = useMemo(() => {
    if (!product) {
      return null;
    }

    return product.is_on_sale && product.sale_price ? product.sale_price : product.price;
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product || product.images.length === 0) {
      return [placeholderImage];
    }

    return product.images.map((image) => image.url);
  }, [product]);

  const lifestyleImages = useMemo(() => {
    if (galleryImages.length > 1) {
      return galleryImages.slice(1, 3);
    }

    return galleryImages;
  }, [galleryImages]);

  const stockMeta = getStockMeta(selectedVariant?.stock ?? 0);
  const whatsappHref = buildWhatsappHref(product?.name ?? 'un producto');

  if (!product) {
    return <div className="topix-page text-center text-ink/60">Cargando producto...</div>;
  }

  return (
    <div className="topix-page space-y-12 lg:space-y-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={() => navigate(-1)} className="topix-button-secondary px-5">
          <ArrowLeft size={16} />
          Volver
        </button>
        <Link to="/cart" className="topix-chip">
          Ir al carrito
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-start lg:gap-14 xl:gap-16">
        <div className="space-y-6 lg:sticky lg:top-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[36px] bg-linen/65 shadow-[0_36px_95px_rgba(49,66,54,0.14)]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,38,33,0.06)] to-transparent" />
            <SafeImage
              src={selectedImage}
              alt={product.name}
              className="aspect-[4/5] h-full w-full object-cover transition duration-700 group-hover:scale-[1.1]"
              fallbackSrc={placeholderImage}
            />
          </motion.div>

          <div className="grid grid-cols-4 gap-3.5 sm:grid-cols-5 lg:grid-cols-4">
            {galleryImages.map((image, index) => {
              const isActive = selectedImage === image;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={[
                    'group overflow-hidden rounded-[24px] border bg-white/65 shadow-[0_16px_38px_rgba(49,66,54,0.09)] backdrop-blur-sm',
                    isActive
                      ? 'border-moss/35 ring-2 ring-moss/25 shadow-[0_22px_48px_rgba(73,99,78,0.16)]'
                      : 'border-white/55 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(49,66,54,0.14)]',
                  ].join(' ')}
                >
                  <SafeImage
                    src={image}
                    alt={`${product.name} miniatura ${index + 1}`}
                    className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    fallbackSrc={placeholderImage}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <GlassCard className="h-fit border-white/70 bg-[rgba(255,251,246,0.84)] p-7 shadow-[0_32px_84px_rgba(49,66,54,0.13)] lg:sticky lg:top-28 lg:p-10">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="topix-kicker">Producto</span>
                {product.is_on_sale ? <span className="topix-chip border-moss/10 bg-moss/12 text-moss">Oferta</span> : null}
              </div>
              <h1 className="max-w-xl text-4xl font-semibold leading-[0.9] tracking-[-0.06em] text-ink sm:text-5xl lg:text-[3.9rem] xl:text-[4.2rem]">
                {product.name}
              </h1>
              <p
                className="max-w-xl text-[0.98rem] leading-7 text-ink/64 sm:text-[1.05rem]"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-4 pt-1">
              <span className="text-[3rem] font-semibold leading-none tracking-[-0.08em] text-moss sm:text-[3.7rem] xl:text-[4.2rem]">
                {displayPrice ? formatCurrency(displayPrice) : null}
              </span>
              <div className={`rounded-full border px-4 py-2 text-sm font-medium shadow-[0_16px_34px_rgba(49,66,54,0.08)] ${stockMeta.chip}`}>
                {stockMeta.label}
              </div>
            </div>

            {product.is_on_sale && product.sale_price ? (
              <div className="flex items-center gap-3">
                <span className="text-sm uppercase tracking-[0.18em] text-ink/45">Precio regular</span>
                <span className="text-lg text-ink/35 line-through">{formatCurrency(product.price)}</span>
              </div>
            ) : null}

            <div className="space-y-4 pt-1">
              <p className="topix-kicker">Color disponible</p>
              <div className="flex flex-wrap gap-3.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const variantStock = getStockMeta(variant.stock);

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity((current) => Math.min(current, Math.max(variant.stock, 1)));
                      }}
                      className={[
                        'rounded-full border px-5 py-3.5 text-sm font-medium shadow-[0_18px_42px_rgba(49,66,54,0.08)] backdrop-blur-sm transition duration-300',
                        isSelected
                          ? 'border-moss bg-moss text-white ring-2 ring-moss/15 shadow-[0_24px_52px_rgba(73,99,78,0.24)]'
                          : 'border-white/60 bg-white/72 text-ink/72 hover:-translate-y-1 hover:border-moss/20 hover:bg-white/92 hover:shadow-[0_22px_48px_rgba(49,66,54,0.14)]',
                      ].join(' ')}
                      aria-pressed={isSelected}
                    >
                      <span>{variant.color}</span>
                      <span className={`ml-2 text-xs ${isSelected ? 'text-white/80' : variantStock.tone}`}>{variant.stock} u.</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[156px_1fr] sm:items-end">
              <div>
                <p className="topix-kicker">Cantidad</p>
                <div className="mt-3 flex items-center overflow-hidden rounded-full border border-white/60 bg-white/70 shadow-[0_18px_40px_rgba(49,66,54,0.08)] backdrop-blur-sm">
                  <button
                    type="button"
                    className="px-4 py-3 text-ink/68 hover:bg-white/78"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(selectedVariant?.stock ?? 1, 1)}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(selectedVariant?.stock ?? 1, 1)))
                    }
                    className="w-full bg-transparent px-2 py-3 text-center text-sm text-ink outline-none"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 text-ink/68 hover:bg-white/78"
                    onClick={() => setQuantity((current) => Math.min(current + 1, Math.max(selectedVariant?.stock ?? current + 1, 1)))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[64px] w-full items-center justify-center gap-3 rounded-full bg-moss px-8 py-4 text-base font-semibold text-white shadow-[0_30px_70px_rgba(73,99,78,0.28)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_38px_90px_rgba(73,99,78,0.34)]"
              >
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => selectedVariant && selectedVariant.stock > 0 && addItem(product, selectedVariant, quantity)}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className="topix-button-secondary min-h-[58px] w-full justify-center border-moss/18 bg-white/66"
              >
                Agregar al carrito
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/55 bg-[rgba(255,255,255,0.46)] p-5 shadow-[0_18px_40px_rgba(49,66,54,0.06)]">
              {serviceHighlights.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-ink/70 sm:text-[0.95rem]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss/10 text-moss shadow-[0_10px_24px_rgba(73,99,78,0.12)]">
                    <Check size={16} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <section className="space-y-7 pt-2">
        <div>
          <p className="topix-kicker">Ambientado</p>
          <h2 className="mt-3 text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink sm:text-4xl">
            Asi se ve dentro de un espacio real.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {lifestyleImages.map((image, index) => (
            <motion.div
              key={`${image}-lifestyle-${index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group overflow-hidden rounded-[32px] bg-linen/65 shadow-[0_28px_70px_rgba(49,66,54,0.11)]"
            >
              <SafeImage
                src={image}
                alt={`${product.name} ambientado ${index + 1}`}
                className="aspect-[16/11] h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                fallbackSrc={placeholderImage}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-7 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="topix-kicker">Relacionados</p>
            <h2 className="mt-3 text-3xl font-semibold leading-[0.95] tracking-[-0.05em] text-ink sm:text-4xl">
              Tambien puede interesarte.
            </h2>
          </div>
          <Link to="/shop" className="topix-button-secondary">
            Ver mas
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
