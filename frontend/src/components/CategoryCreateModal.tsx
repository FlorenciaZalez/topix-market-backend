import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { translations } from '../i18n/es';

type CategoryCreateModalProps = {
  open: boolean;
  creating: boolean;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onClose: () => void;
  onCreate: (name: string, imageUrl: string | null) => Promise<void>;
};

const t = translations.es;

export function CategoryCreateModal({ open, creating, onUploadImages, onClose, onCreate }: CategoryCreateModalProps) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setImageUrl('');
      setUploadingImage(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      return;
    }

    await onCreate(normalizedName, imageUrl.trim() || null);
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrls = await onUploadImages(files);
      if (uploadedUrls[0]) {
        setImageUrl(uploadedUrls[0]);
      }
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#111111] p-6 text-white shadow-[0_36px_120px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/38">{t.categoriesManager}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{t.createCategoryModalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/68 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/42">{t.categoryName}</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.categoryNamePlaceholder}
              className="w-full rounded-[20px] border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40 focus:bg-[#202020]"
            />
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#171717] p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <label className="block text-xs uppercase tracking-[0.24em] text-white/42">{t.categoryImage}</label>
                <p className="mt-2 text-sm leading-6 text-white/55">{t.categoryImageHelp}</p>
              </div>
              <label className="inline-flex h-12 min-w-[160px] cursor-pointer items-center justify-center self-start rounded-full border border-blue-400/20 bg-blue-500/10 px-5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/16 md:justify-self-end">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                {uploadingImage ? t.uploading : t.chooseCategoryImage}
              </label>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-white/10 bg-[#121212] p-3">
              <div className="h-16 w-16 overflow-hidden rounded-[18px] border border-white/10 bg-[#202020]">
                {imageUrl ? <img src={imageUrl} alt={t.categoryImage} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{imageUrl ? t.categoryImageReady : t.noCategoryImageSelected}</p>
                <p className="mt-1 truncate text-xs text-white/45">{imageUrl || t.uploadCategoryImageHint}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/78 transition hover:bg-white/[0.08]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? t.saving : t.createCategoryAction}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
