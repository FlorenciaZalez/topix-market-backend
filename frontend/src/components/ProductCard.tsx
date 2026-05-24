import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { GlassCard } from 'components/GlassCard';
import { SafeImage } from 'components/SafeImage';
import type { Product } from 'types';
import { formatCurrency } from 'utils/currency';

type ProductCardProps = {
  product: Product;
  badge?: string;
};

const colorMap: Record<string, string> = {
  black: '#1f1f1f',
  blanco: '#f4f1ea',
  white: '#f4f1ea',
  gris: '#9ca3af',
  gray: '#9ca3af',
  grey: '#9ca3af',
  beige: '#d6c2a1',
  crema: '#efe3cb',
  cream: '#efe3cb',
  marron: '#7a5a45',
  brown: '#7a5a45',
  verde: '#64785f',
  green: '#64785f',
  azul: '#6b85b1',
  blue: '#6b85b1',
  rojo: '#b85c5c',
  red: '#b85c5c',
  amarillo: '#d8b64c',
  yellow: '#d8b64c',
  rosa: '#d79aa7',
  pink: '#d79aa7',
  terracotta: '#b96f55',
  terracota: '#b96f55',
  natural: '#b8a58a',
  madera: '#8c6a4b',
  wood: '#8c6a4b',
};

function getColorValue(color: string) {
  return colorMap[color.trim().toLowerCase()] || '#314236';
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const fallbackImage = '/placeholder-topix.svg';
  const variantSwatches = useMemo(
    () =>
      product.variants
        .filter((variant) => variant.color.trim() && variant.color.trim().toLowerCase() !== 'default')
        .slice(0, 5),
    [product.variants],
  );
  const defaultImage = product.images[0]?.url || variantSwatches.find((variant) => variant.image_url)?.image_url || fallbackImage;
  const [activeImage, setActiveImage] = useState(defaultImage);

  useEffect(() => {
    setActiveImage(defaultImage);
  }, [defaultImage, product.id]);

  const productBadge = badge || (product.is_on_sale ? 'Oferta' : null);

  return (
    <motion.div whileHover={{ y: -10, scale: 1.008 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="h-full">
      <Link to={`/product/${product.id}`} className="group block h-full" onMouseLeave={() => setActiveImage(defaultImage)}>
        <GlassCard className="flex h-full flex-col overflow-hidden border-white/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.98)_0%,rgba(247,239,229,0.94)_100%)] p-1 shadow-[0_28px_72px_rgba(49,66,54,0.16)] group-hover:shadow-[0_38px_98px_rgba(49,66,54,0.2)]">
          <div className="relative aspect-[1.08/1.18] overflow-hidden rounded-[22px] bg-linen/70">
            <SafeImage
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
              fallbackSrc={fallbackImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,34,29,0.22)] via-[rgba(26,34,29,0.02)] to-transparent opacity-80" />
            {productBadge ? (
              <span className="absolute left-3.5 top-3.5 rounded-full border border-white/30 bg-[rgba(34,47,39,0.78)] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_12px_30px_rgba(22,31,26,0.24)] backdrop-blur-md sm:left-4 sm:top-4">
                {productBadge}
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col px-0 pb-0 pt-2 sm:pt-2.5">
            <div className="min-h-[1.3rem]">
              <p
                className="truncate text-[1rem] font-normal leading-[1.2] tracking-[-0.03em] text-ink sm:text-[1.06rem]"
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.name}
              </p>
            </div>

            <div className="flex min-h-[1.15rem] items-center gap-1.5 pt-1">
              {variantSwatches.map((variant) => {
                const swatchColor = variant.color_hex || getColorValue(variant.color);
                const isActive = activeImage === (variant.image_url || defaultImage);

                return (
                  <span
                    key={variant.id}
                    title={variant.color}
                    onMouseEnter={() => setActiveImage(variant.image_url || defaultImage)}
                    className={`h-2.5 w-2.5 rounded-full border shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition ${
                      isActive ? 'scale-125 border-[#243229]/40' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: swatchColor }}
                  />
                );
              })}
            </div>

            <div className="flex min-h-[2.2rem] items-end gap-2 pt-1 sm:min-h-[2.35rem]">
              {product.is_on_sale && product.sale_price ? (
                <>
                  <span className="text-[1.42rem] font-semibold leading-none tracking-[-0.05em] text-[#243229] sm:text-[1.56rem]">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="pb-0.5 text-[0.82rem] font-medium text-ink/38 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-[1.42rem] font-semibold leading-none tracking-[-0.05em] text-[#243229] sm:text-[1.56rem]">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <div className="mt-auto pt-2.5">
              <span className="inline-flex w-full items-center justify-center rounded-full bg-[#314236] px-4 py-2.5 text-[0.82rem] font-semibold text-white shadow-[0_18px_36px_rgba(49,66,54,0.22)] transition duration-300 group-hover:bg-[#243229] group-hover:shadow-[0_22px_46px_rgba(36,50,41,0.26)]">
                Ver producto
              </span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}
