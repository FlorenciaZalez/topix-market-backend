import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchCategories, fetchProducts } from 'api/shop';
import { GlassCard } from 'components/GlassCard';
import { ProductCard } from 'components/ProductCard';
import type { Category, Product } from 'types';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

type PriceFilterOption = 'all' | 'under-100' | '100-300' | '300-600' | 'over-600';

function getNumericPrice(product: Product) {
  return Number(product.sale_price ?? product.price);
}

function matchesPriceRange(product: Product, priceFilter: PriceFilterOption) {
  const price = getNumericPrice(product);

  switch (priceFilter) {
    case 'under-100':
      return price < 100;
    case '100-300':
      return price >= 100 && price <= 300;
    case '300-600':
      return price > 300 && price <= 600;
    case 'over-600':
      return price > 600;
    default:
      return true;
  }
}

function sortProducts(items: Product[], sortBy: SortOption) {
  const nextItems = [...items];

  switch (sortBy) {
    case 'price-asc':
      return nextItems.sort((first, second) => getNumericPrice(first) - getNumericPrice(second));
    case 'price-desc':
      return nextItems.sort((first, second) => getNumericPrice(second) - getNumericPrice(first));
    case 'name-asc':
      return nextItems.sort((first, second) => first.name.localeCompare(second.name));
    default:
      return nextItems;
  }
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all');
  const [priceFilter, setPriceFilter] = useState<PriceFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    void Promise.all([fetchProducts(), fetchCategories()]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
    });
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') ?? 'all');
  }, [searchParams]);

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFiltersOpen]);

  function handleCategoryChange(categoryId: string) {
    setSelectedCategory(categoryId);
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', categoryId);
    }
    setSearchParams(nextParams, { replace: true });
  }

  const filteredProducts = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const result = products.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.variants.map((variant) => variant.color).join(' ')}`;
      const matchesSearch = !normalized || haystack.toLowerCase().includes(normalized);
      const matchesCategory =
        selectedCategory === 'all' || product.category_ids.some((categoryId) => String(categoryId) === selectedCategory);
      const matchesPrice = matchesPriceRange(product, priceFilter);
      return matchesSearch && matchesCategory && matchesPrice;
    });

    return sortProducts(result, sortBy);
  }, [deferredQuery, priceFilter, products, selectedCategory, sortBy]);

  const activeFilterCount = [selectedCategory !== 'all', priceFilter !== 'all', sortBy !== 'featured'].filter(Boolean).length;

  function resetFilters() {
    setPriceFilter('all');
    setSortBy('featured');
    handleCategoryChange('all');
  }

  return (
    <div className="topix-page space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="topix-kicker">Catalogo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">Productos</h1>
          </div>
          <span className="hidden rounded-full border border-white/50 bg-white/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-ink/58 sm:inline-flex">
            {filteredProducts.length} resultados
          </span>
        </div>

        <GlassCard className="hidden p-3 sm:block sm:p-4">
          <div className="flex items-center gap-3 lg:flex-nowrap">
            <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
              <Search size={18} className="text-ink/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar productos"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              />
            </div>

            <div className="flex min-w-[190px] items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
              <Tag size={17} className="text-ink/45" />
              <select
                value={selectedCategory}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className="w-full bg-transparent text-sm text-ink outline-none"
              >
                <option value="all">Todas las categorias</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-[190px] items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
              <SlidersHorizontal size={17} className="text-ink/45" />
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value as PriceFilterOption)}
                className="w-full bg-transparent text-sm text-ink outline-none"
              >
                <option value="all">Todos los precios</option>
                <option value="under-100">Menos de $100</option>
                <option value="100-300">$100 a $300</option>
                <option value="300-600">$300 a $600</option>
                <option value="over-600">Mas de $600</option>
              </select>
            </div>

            <div className="flex min-w-[210px] items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
              <ArrowDownUp size={17} className="text-ink/45" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="w-full bg-transparent text-sm text-ink outline-none"
              >
                <option value="featured">Ordenar: destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name-asc">Nombre: A a Z</option>
              </select>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-3 sm:hidden">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
              <Search size={18} className="shrink-0 text-ink/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar productos"
                className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="relative inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[20px] border border-white/45 bg-white/60 text-ink shadow-glass"
              aria-label="Abrir filtros"
              aria-haspopup="dialog"
              aria-expanded={isMobileFiltersOpen}
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount ? (
                <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-moss px-1.5 text-center text-[10px] font-semibold leading-5 text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.22em] text-ink/48">
            <span>{filteredProducts.length} resultados</span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-ink/54 transition hover:text-moss"
            >
              Limpiar
            </button>
          </div>
        </GlassCard>
      </section>

      {filteredProducts.length ? (
        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      ) : (
        <GlassCard className="p-10 text-center">
          <p className="topix-kicker">Sin resultados</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">No encontramos productos para esos filtros.</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-ink/62">
            Proba otra combinacion de busqueda, categoria, precio u orden para volver a ver el catalogo completo.
          </p>
        </GlassCard>
      )}

      <AnimatePresence>
        {isMobileFiltersOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar filtros"
              className="fixed inset-0 z-[60] bg-[#314236]/20 backdrop-blur-[2px] sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros de productos"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-[61] sm:hidden"
            >
              <div className="rounded-t-[32px] border border-white/70 bg-[#f7efe4]/96 p-5 shadow-[0_-30px_80px_rgba(49,66,54,0.18)] backdrop-blur-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="topix-kicker">Filtros</p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">Personaliza el catalogo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-white/65 text-ink shadow-glass"
                    aria-label="Cerrar filtros"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
                    <Tag size={17} className="text-ink/45" />
                    <select
                      value={selectedCategory}
                      onChange={(event) => handleCategoryChange(event.target.value)}
                      className="w-full bg-transparent text-sm text-ink outline-none"
                    >
                      <option value="all">Todas las categorias</option>
                      {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
                    <SlidersHorizontal size={17} className="text-ink/45" />
                    <select
                      value={priceFilter}
                      onChange={(event) => setPriceFilter(event.target.value as PriceFilterOption)}
                      className="w-full bg-transparent text-sm text-ink outline-none"
                    >
                      <option value="all">Todos los precios</option>
                      <option value="under-100">Menos de $100</option>
                      <option value="100-300">$100 a $300</option>
                      <option value="300-600">$300 a $600</option>
                      <option value="over-600">Mas de $600</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 rounded-[22px] border border-white/45 bg-white/60 px-4 py-3">
                    <ArrowDownUp size={17} className="text-ink/45" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="w-full bg-transparent text-sm text-ink outline-none"
                    >
                      <option value="featured">Ordenar: destacados</option>
                      <option value="price-asc">Precio: menor a mayor</option>
                      <option value="price-desc">Precio: mayor a menor</option>
                      <option value="name-asc">Nombre: A a Z</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="topix-button-secondary flex-1 px-5 py-3"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="topix-button flex-1 px-5 py-3"
                  >
                    Ver {filteredProducts.length}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
