import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

import { buildWhatsAppHref } from 'utils/whatsapp';

const instagramHref = 'https://instagram.com/TU_USUARIO';
const whatsappHref = buildWhatsAppHref('Hola quiero consultar por un producto');

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-white/45 bg-white/35 py-10 text-sm text-ink/68 backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr_0.9fr] lg:items-start lg:px-8">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-moss/70">Topix</p>
          <p className="max-w-md text-sm leading-7">Muebles y articulos para el hogar.</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-moss/70">Menu</p>
          <nav className="mt-3 flex flex-col gap-2">
            <Link to="/" className="text-sm text-ink/70 transition-colors hover:text-moss">
              Home
            </Link>
            <Link to="/shop" className="text-sm text-ink/70 transition-colors hover:text-moss">
              Productos
            </Link>
            <Link to="/#contacto" className="text-sm text-ink/70 transition-colors hover:text-moss">
              Contacto
            </Link>
          </nav>
        </div>

        <div className="space-y-2 text-sm lg:text-right">
          <p>Contacto directo por WhatsApp</p>
          <a className="font-medium text-moss transition-colors hover:text-olive" href={whatsappHref} target="_blank" rel="noreferrer">
            Escribir ahora
          </a>
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-moss lg:justify-end"
          >
            <Instagram size={16} />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
