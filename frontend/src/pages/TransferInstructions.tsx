import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { fetchBankDetails } from 'api/shop';
import { GlassCard } from 'components/GlassCard';
import type { BankDetails } from 'types';

export function TransferInstructionsPage() {
  const [searchParams] = useSearchParams();
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const orderId = searchParams.get('orderId');
  const contactPhone = bankDetails?.contact_phone?.trim() || '';
  const whatsappPhone = contactPhone.replace(/\D/g, '');
  const whatsappLink = whatsappPhone ? `https://wa.me/${whatsappPhone}` : null;

  useEffect(() => {
    void fetchBankDetails()
      .then(setBankDetails)
      .catch(() => {
        setBankDetails(null);
      });
  }, []);

  return (
    <div className="topix-page">
      <GlassCard className="w-full p-8 text-center sm:p-10 lg:p-12">
        <p className="topix-kicker">Transferencia confirmada</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Gracias por tu compra</h1>
        <p className="mt-4 text-lg leading-8 text-ink/65">
          Envia el comprobante a{' '}
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="font-semibold text-moss underline decoration-moss/35 underline-offset-4 transition hover:text-ink">
              {contactPhone}
            </a>
          ) : (
            'configurado en admin'
          )}
          .
        </p>
        <p className="mt-5 text-base leading-8 text-ink/65">
          {orderId
            ? `Tu pedido #${orderId} ya fue generado. Realiza la transferencia con los datos indicados y luego envia el comprobante para avanzar con la validacion.`
            : 'Tu pedido ya fue generado. Realiza la transferencia con los datos indicados y luego envia el comprobante para avanzar con la validacion.'}
        </p>

        {/* {bankDetails ? (
          <div className="mt-8 rounded-[28px] border border-white/45 bg-white/52 p-6 text-left text-sm leading-7 text-ink/70">
            <p><span className="font-semibold text-ink">Banco:</span> {bankDetails.bank_name}</p>
            <p><span className="font-semibold text-ink">Titular:</span> {bankDetails.account_holder}</p>
            <p><span className="font-semibold text-ink">CBU:</span> {bankDetails.cbu}</p>
            <p><span className="font-semibold text-ink">Alias:</span> {bankDetails.alias}</p>
          </div>
        ) : null} */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/shop" className="topix-button">
            Seguir comprando
          </Link>
          <Link to="/" className="topix-button-secondary">
            Volver al inicio
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}