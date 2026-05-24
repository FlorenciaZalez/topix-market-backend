import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { normalizeAssetUrl } from 'api/client';
import { translations } from '../i18n/es';
import type { Category } from 'types';

type CategoryManagerProps = {
  categories: Category[];
  updatingId: number | null;
  deletingId: number | null;
  onOpenCreateModal: () => void;
  onUploadImages: (files: File[]) => Promise<string[]>;
  onUpdate: (category: Category, name: string, imageUrl: string | null) => Promise<void>;
  onDelete: (category: Category) => Promise<void>;
};

const t = translations.es;

export function CategoryManager({
  categories,
  updatingId,
  deletingId,
  onOpenCreateModal,
  onUploadImages,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [uploadingEditImage, setUploadingEditImage] = useState<number | null>(null);

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingImageUrl(category.image_url ?? '');
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName('');
    setEditingImageUrl('');
  }

  async function handleUpdate(category: Category) {
    const normalizedName = editingName.trim();
    if (!normalizedName) {
      return;
    }

    await onUpdate(category, normalizedName, editingImageUrl.trim() || null);
    cancelEditing();
  }

  async function handleEditImageUpload(categoryId: number, event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    setUploadingEditImage(categoryId);
    try {
      const uploadedUrls = await onUploadImages(files);
      if (uploadedUrls[0]) {
        setEditingImageUrl(uploadedUrls[0]);
      }
    } finally {
      setUploadingEditImage(null);
      event.target.value = '';
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{t.categoriesManager}</h3>
        </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(59,130,246,0.26)] transition hover:brightness-110"
        >
          <Plus size={16} />
          {t.createCategoryAction}
        </button>
      </div>

      {categories.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="inline-flex items-center gap-3 rounded-[22px] border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white/82"
            >
              <div className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-[#202020]">
                {((editingId === category.id ? editingImageUrl : category.image_url) ?? '') ? (
                  <img
                    src={normalizeAssetUrl(editingId === category.id ? editingImageUrl : category.image_url ?? '') ?? ''}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              {editingId === category.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    className="min-w-[180px] rounded-full border border-white/10 bg-[#222222] px-3 py-2 text-sm text-white outline-none transition focus:border-blue-400/40"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/78 transition hover:bg-white/[0.08]">
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleEditImageUpload(category.id, event)} />
                    {uploadingEditImage === category.id ? t.uploading : t.categoryImageUpdated}
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleUpdate(category)}
                    disabled={updatingId === category.id || !editingName.trim()}
                    className="inline-flex items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 p-2 text-blue-100 transition hover:bg-blue-500/16 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/78 transition hover:bg-white/[0.08]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-white">{category.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/28">{category.slug}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditing(category)}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/78 transition hover:bg-white/[0.08]"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => void onDelete(category)}
                disabled={deletingId === category.id || updatingId === category.id}
                className="inline-flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 p-2 text-red-200 transition hover:bg-red-500/16 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-white/48">{t.noCategoriesAvailable}</p>
      )}
    </section>
  );
}
