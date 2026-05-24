import { buildWhatsAppHref } from 'utils/whatsapp';

const whatsappHref = buildWhatsAppHref('Hola quiero hacer una consulta');

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-[70] inline-flex h-16 w-16 items-center justify-center rounded-full bg-transparent shadow-[0_18px_40px_rgba(22,32,24,0.18)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_24px_52px_rgba(22,32,24,0.24)] sm:bottom-6 sm:right-6 sm:h-[4.5rem] sm:w-[4.5rem]"
    >
      <span className="sr-only">WhatsApp</span>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="h-11 w-11 sm:h-12 sm:w-12">
        <path
          fill="#ffffff"
          d="M32 3C16.02 3 3 15.66 3 31.29c0 4.98 1.33 9.84 3.86 14.12L3 61l16.18-4.66A29.44 29.44 0 0 0 32 59.6c15.98 0 29-12.67 29-28.31C61 15.66 47.98 3 32 3Z"
        />
        <path
          fill="#25D366"
          d="M32 8.1c-13.14 0-23.83 10.38-23.83 23.14 0 4.42 1.3 8.7 3.76 12.39l.61.91-2.24 8.2 8.5-2.45.88.52A24.2 24.2 0 0 0 32 54.43c13.14 0 23.83-10.38 23.83-23.14C55.83 18.48 45.14 8.1 32 8.1Z"
        />
        <path
          fill="#ffffff"
          d="M24.71 18.06c-1.05.05-2.18.29-3 .9-.72.53-1.34 1.23-1.76 2.02-.89 1.67-1.07 3.62-.72 5.47.5 2.67 1.94 5.07 3.58 7.17 1.34 1.71 2.93 3.24 4.68 4.56 1.77 1.34 3.74 2.46 5.84 3.22 2.35.85 4.97 1.37 7.45.78 1.56-.38 3.03-1.27 3.99-2.57.67-.9 1.11-2 1.19-3.12l.06-.83c.03-.43-.21-.86-.61-1.05l-5.06-2.31a1.56 1.56 0 0 0-1.83.41l-2.09 2.47c-.21.24-.54.34-.84.23-1.35-.49-2.62-1.18-3.78-2.02a17.22 17.22 0 0 1-3.13-3.01c-.84-1.03-1.57-2.15-2.14-3.34-.14-.29-.09-.64.12-.89l1.75-2.08.51-.61c.27-.32.34-.75.19-1.14l-1.96-5.1c-.23-.61-.84-1-1.49-.96Z"
        />
      </svg>
    </a>
  );
}