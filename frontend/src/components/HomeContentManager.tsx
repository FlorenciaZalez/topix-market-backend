import { ImagePlus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { translations } from '../i18n/es';
import type { HomeContent } from 'types';

type HomeContentFormValues = {
  heroImageUrl: string;
  newArrivalsImageUrl: string;
};

type HomeContentManagerProps = {
  homeContent: HomeContent | null;
  submitting: boolean;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onSave: (values: HomeContentFormValues) => Promise<void>;
};

const t = translations.es;

export function HomeContentManager({ homeContent, submitting, onUploadImages, onSave }: HomeContentManagerProps) {
  const [values, setValues] = useState<HomeContentFormValues>({ heroImageUrl: '', newArrivalsImageUrl: '' });
  const [uploadingField, setUploadingField] = useState<keyof HomeContentFormValues | null>(null);

  useEffect(() => {
    setValues({
      heroImageUrl: homeContent?.hero_image_url ?? '',
      newArrivalsImageUrl: homeContent?.new_arrivals_image_url ?? '',
    });
  }, [homeContent]);

  function updateField(field: keyof HomeContentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleUpload(field: keyof HomeContentFormValues, event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setUploadingField(field);
    try {
      const uploadedUrls = await onUploadImages(files);
      if (uploadedUrls[0]) {
        updateField(field, uploadedUrls[0]);
      }
    } finally {
      setUploadingField(null);
      event.target.value = '';
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="border-b border-white/8 pb-5">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{t.homeContent}</h3>
        <p className="mt-2 text-sm leading-7 text-white/55">{t.homeContentDescription}</p>
      </div>

      <form
        className="mt-6 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSave(values);
        }}
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-[#171717] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{t.heroImage}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.heroImageHelp}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/16">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleUpload('heroImageUrl', event)} />
                {uploadingField === 'heroImageUrl' ? t.uploading : t.chooseImages}
              </label>
            </div>

            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-[20px] border border-white/10 bg-[#111111]">
              {values.heroImageUrl ? <img src={values.heroImageUrl} alt={t.heroImage} className="h-full w-full object-cover" /> : null}
            </div>

            <input
              value={values.heroImageUrl}
              onChange={(event) => updateField('heroImageUrl', event.target.value)}
              placeholder="https://..."
              className="mt-4 w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
            />
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#171717] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{t.newArrivalsImage}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.newArrivalsImageHelp}</p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/16">
                <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleUpload('newArrivalsImageUrl', event)} />
                {uploadingField === 'newArrivalsImageUrl' ? t.uploading : t.chooseImages}
              </label>
            </div>

            <div className="mt-4 aspect-[4/3] overflow-hidden rounded-[20px] border border-white/10 bg-[#111111]">
              {values.newArrivalsImageUrl ? <img src={values.newArrivalsImageUrl} alt={t.newArrivalsImage} className="h-full w-full object-cover" /> : null}
            </div>

            <input
              value={values.newArrivalsImageUrl}
              onChange={(event) => updateField('newArrivalsImageUrl', event.target.value)}
              placeholder="https://..."
              className="mt-4 w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
            />
          </div>
        </div>

        <div>
          <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={16} />
            {t.saveHomeContent}
          </button>
        </div>
      </form>
    </section>
  );
}