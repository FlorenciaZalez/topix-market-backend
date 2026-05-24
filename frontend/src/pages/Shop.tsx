import { motion } from 'framer-motion';
import { ArrowDownUp, Search, SlidersHorizontal, Tag } from 'lucide-react';
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
      const matchesCategory = selectedCategory === 'all' || String(product.category_id) === selectedCategory;
      const matchesPrice = matchesPriceRange(product, priceFilter);
      return matchesSearch && matchesCategory && matchesPrice;
    });

    return sortProducts(result, sortBy);
  }, [deferredQuery, priceFilter, products, selectedCategory, sortBy]);

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

        <GlassCard className="overflow-x-auto p-3 sm:p-4">
          <div className="flex min-w-[980px] items-center gap-3">
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
      </section>

      {filteredProducts.length ? (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
