import { motion } from 'framer-motion';

import { SafeImage } from 'components/SafeImage';
import { buildWhatsAppHref } from 'utils/whatsapp';

const whatsappHref = buildWhatsAppHref('Hola quiero consultar por un producto');
const defaultHeroImage =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';

type HeroProps = {
  imageUrl?: string;
  isLoading?: boolean;
};

export function Hero({ imageUrl, isLoading = false }: HeroProps) {
  const shouldShowImage = Boolean(imageUrl) || !isLoading;

  return (
    <section className="relative -mt-[108px] h-screen min-h-[100svh] overflow-hidden pt-[108px]">
      <div className="absolute inset-0">
        {shouldShowImage ? (
          <SafeImage
            src={imageUrl || defaultHeroImage}
            alt="Interior calido con muebles y decoracion minimalista"
            className="h-full w-full object-cover"
            fallbackSrc={defaultHeroImage}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_52%),linear-gradient(180deg,#8a9a87_0%,#6f806d_38%,#4e5f50_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(41,52,44,0.05)] via-[rgba(41,52,44,0.1)] to-[rgba(246,240,230,0.18)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,240,230,0.12),transparent_42%,rgba(246,240,230,0.08))]" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex max-w-4xl flex-col items-center gap-8 text-center"
        >
          {/* <div className="rounded-full border border-white/35 bg-white/10 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.34em] text-white/90 backdrop-blur-md">
            Topix Home Collection
          </div> */}
          <div className="space-y-5 text-white">
            <h1 className="text-6xl font-semibold leading-[0.88] tracking-[-0.06em] drop-shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:text-7xl lg:text-[5.8rem]">
              Muebles y artículos para el hogar
            </h1>
            {/* <p className="mx-auto max-w-2xl text-base leading-8 text-white/82 sm:text-lg sm:leading-9">
              Una seleccion editorial para interiores luminosos, materiales nobles y espacios que invitan a quedarse.
            </p> */}
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/30 bg-white/20 px-10 py-5 text-base font-semibold uppercase tracking-[0.18em] text-white shadow-[0_28px_90px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:bg-white/28 hover:shadow-[0_36px_100px_rgba(0,0,0,0.24)]"
          >
            Contactanos
          </a>
        </motion.div>
      </div>
    </section>
  );
}