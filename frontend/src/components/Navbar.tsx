import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Instagram, Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { fetchCategories } from 'api/shop';
import { useAuth } from 'context/AuthContext';
import { useCart } from 'context/CartContext';
import type { Category } from 'types';

const instagramHref = 'https://instagram.com/TU_USUARIO';

function TopixLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 577.27 301.98"
      aria-label="Topix"
      role="img"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M414.54,134.04c-.14.14-.29.27-.43.4h-61.22l-122.12-94.72,36.13-23.68,147.64,118.01Z" fill="#354237" />
      <path d="M266.9 16.03 230.77 39.72 142.3 16.03 266.9 16.03Z" fill="#49594b" />
      <path d="M414.11,134.44C200.45,333.27,0,299.87,0,299.87c186.87-32.14,352.89-165.43,352.89-165.43h61.22Z" fill="#354237" />
      <path d="M577.27 0 424.72 124.6 411.98 97.4 514.82 20.93 577.27 0Z" fill="#2a332b" />
      <path d="M424.37,124.32l-58.47-46.21s0-.03.02-.03l46.06,19.31,12.55,26.8c.05.1-.07.19-.16.13Z" fill="#252d26" />
      <path d="M577.26 0 514.82 20.93 475.02 0 577.26 0Z" fill="#49594b" />
      <path d="M514.82 20.93 411.98 97.4 365.81 78.04 475.02 0 514.82 20.93Z" fill="#354237" />
      <path d="M501.41 257.38 445.21 257.38 365.81 192.32 404.37 179.24 501.41 257.38Z" fill="#1d231e" />
      <path d="M577.27 257.38 501.41 257.38 404.37 179.24 427.04 142.88 577.27 257.38Z" fill="#2a332b" />
      <path d="M426.92,143.09l-22.54,36.15-38.42,13.04s-.05-.03-.02-.05l60.93-49.19s.08.01.06.05Z" fill="#252d26" />
      <path d="M297.96,137.65l34.69-2.03-101.88-95.91h0l122.12,94.72S186.87,267.73,0,299.87c149.08-50.18,297.96-162.22,297.96-162.22Z" fill="#252d26" />
      <path d="M352.89 134.44 297.96 137.65 142.3 16.03 230.77 39.72 352.89 134.44Z" fill="#252d26" />
    </svg>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const isHome = location.pathname === '/';
  const isOverlay = false;
  const isShopActive = location.pathname === '/shop' || location.pathname.startsWith('/product/');
  const menuGlassClass = 'border-[#ebe1d2]/88 bg-[#f6eee2]/76 shadow-soft backdrop-blur-xl';
  const dropdownGlassClass = 'bg-white/90 border border-black/5';
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-sm font-medium tracking-[0.16em] uppercase transition-colors duration-300',
      isOverlay
        ? isActive
          ? 'text-white'
          : 'text-white/82 hover:text-white'
        : isActive
          ? 'text-moss'
          : 'text-ink/68 hover:text-moss',
    ].join(' ');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (location.hash !== '#contacto') {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    let isMounted = true;

    void fetchCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsProductsOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8">
      <header
        className={[
          'mx-auto mt-4 flex w-full max-w-6xl items-center justify-between rounded-full border px-5 py-3.5 transition-all duration-300 sm:px-6',
          scrolled ? menuGlassClass : menuGlassClass,
        ].join(' ')}
      >
        <Link to="/" className="flex items-center">
          <TopixLogo className="h-9 w-auto sm:h-10" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <div
            className="relative"
            onMouseEnter={() => setIsProductsOpen(true)}
            onMouseLeave={() => setIsProductsOpen(false)}
          >
            <button
              type="button"
              className={[
                'flex items-center gap-1 text-sm font-medium uppercase tracking-[0.16em] transition-colors duration-300',
                isOverlay
                  ? isShopActive
                    ? 'text-white'
                    : 'text-white/82 hover:text-white'
                  : isShopActive || isProductsOpen
                    ? 'text-moss'
                    : 'text-ink/68 hover:text-moss',
              ].join(' ')}
              aria-haspopup="menu"
              aria-expanded={isProductsOpen}
              onFocus={() => setIsProductsOpen(true)}
            >
              <span>Productos</span>
              <ChevronDown size={15} className={['transition-transform duration-300', isProductsOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
            </button>

            <div
              className={[
                'absolute left-1/2 top-full z-50 w-[18.5rem] -translate-x-1/2 pt-3 transition-all duration-200',
                isProductsOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
              ].join(' ')}
              onFocus={() => setIsProductsOpen(true)}
            >
              <div className={`relative overflow-hidden rounded-[30px] ${dropdownGlassClass} shadow-[0_10px_30px_rgba(0,0,0,0.1)]`}>
                <div className="space-y-1 p-3">
                <Link
                  to="/shop"
                  className="flex items-center justify-between rounded-[20px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition duration-200 hover:bg-white/14 hover:text-moss"
                >
                  <span>Ver todos</span>
                  {/* <span className="text-xs text-ink/45">Shop</span> */}
                </Link>

                <div className="mx-2 my-1 h-px bg-[#d8ccbc]/75" />

                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.id}`}
                      className="flex items-center justify-between rounded-[20px] px-4 py-3 text-sm font-medium text-ink/78 transition duration-200 hover:bg-white/14 hover:text-moss"
                    >
                      <span>{category.name}</span>
                      {/* <span className="text-[11px] uppercase tracking-[0.18em] text-ink/34">Categoria</span> */}
                    </Link>
                  ))}

                  {categories.length === 0 ? (
                    <div className="rounded-[18px] px-4 py-3 text-sm text-ink/52">No hay categorias disponibles.</div>
                  ) : null}
                </div>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/#contacto"
            className={[
              'text-sm font-medium uppercase tracking-[0.16em] transition-colors duration-300',
              isOverlay ? 'text-white/82 hover:text-white' : 'text-ink/68 hover:text-moss',
            ].join(' ')}
          >
            Contacto
          </Link>
          {user?.is_admin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Instagram"
            className="rounded-full p-2 text-ink/70 transition duration-300 hover:-translate-y-0.5 hover:text-moss"
          >
            <Instagram size={18} />
          </a>
          {user ? (
            <>
              <span className={['hidden text-sm lg:block', isOverlay ? 'text-white/72' : 'text-ink/55'].join(' ')}>{user.full_name}</span>
              <button
                className={[
                  'hidden rounded-full px-4 py-2 text-sm font-medium transition-colors md:inline-flex',
                  isOverlay ? 'text-white hover:text-white/80' : 'text-moss hover:text-olive',
                ].join(' ')}
                onClick={logout}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={[
                'hidden rounded-full border px-4 py-2 text-sm font-medium shadow-[0_16px_40px_rgba(49,66,54,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:inline-flex',
                isOverlay
                  ? 'border-white/24 bg-white/12 text-white hover:bg-white/20'
                  : 'border-white/26 bg-white/14 text-ink hover:bg-white/24',
              ].join(' ')}
            >
              Login
            </Link>
          )}
          <Link
            to="/cart"
            className={[
              'relative rounded-full border p-3 shadow-[0_16px_40px_rgba(49,66,54,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5',
              isOverlay
                ? 'border-white/24 bg-white/12 text-white hover:bg-white/20'
                : 'border-white/26 bg-white/14 text-ink hover:bg-white/24',
            ].join(' ')}
            aria-label="Abrir carrito"
          >
            <ShoppingBag size={18} />
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-moss px-1.5 text-center text-[10px] font-semibold leading-5 text-white">
              {items.length}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex rounded-full border border-white/26 bg-white/14 p-3 text-ink shadow-[0_16px_40px_rgba(49,66,54,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/24 md:hidden"
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar menu"
              className="fixed inset-0 z-40 bg-[#314236]/18 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              id="mobile-navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed bottom-0 right-0 top-0 z-50 w-[min(88vw,24rem)] md:hidden"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-l-[32px] border-l border-t border-[#ebe1d2]/88 bg-[#f6eee2]/92 p-4 shadow-[-24px_0_70px_rgba(49,66,54,0.14)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between px-1 pb-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-ink/42">Navegacion</p>
                    <p className="mt-1 text-base font-semibold text-ink">Topix Market</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex rounded-full border border-white/40 bg-white/45 p-2.5 text-ink shadow-glass transition hover:bg-white/70"
                    aria-label="Cerrar menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) => [
                      'flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] transition',
                      isActive ? 'bg-white/68 text-moss shadow-glass' : 'text-ink/74 hover:bg-white/48 hover:text-moss',
                    ].join(' ')}
                  >
                    <span>Home</span>
                  </NavLink>

                  <div className="rounded-[24px] border border-white/45 bg-white/34 p-1.5 shadow-glass">
                    <button
                      type="button"
                      onClick={() => setIsMobileProductsOpen((current) => !current)}
                      className={[
                        'flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.16em] transition',
                        isShopActive || isMobileProductsOpen ? 'text-moss' : 'text-ink/74 hover:text-moss',
                      ].join(' ')}
                      aria-expanded={isMobileProductsOpen}
                    >
                      <span>Productos</span>
                      <ChevronDown size={16} className={['transition-transform duration-300', isMobileProductsOpen ? 'rotate-180' : 'rotate-0'].join(' ')} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isMobileProductsOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 px-1 pb-1 pt-1">
                            <Link
                              to="/shop"
                              className="flex items-center justify-between rounded-[18px] px-3 py-3 text-sm font-medium text-ink/78 transition hover:bg-white/56 hover:text-moss"
                            >
                              <span>Ver todos</span>
                            </Link>
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                to={`/shop?category=${category.id}`}
                                className="flex items-center justify-between rounded-[18px] px-3 py-3 text-sm font-medium text-ink/72 transition hover:bg-white/56 hover:text-moss"
                              >
                                <span>{category.name}</span>
                              </Link>
                            ))}
                            {categories.length === 0 ? <div className="px-3 py-3 text-sm text-ink/52">No hay categorias disponibles.</div> : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  <Link
                    to="/#contacto"
                    className="flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-ink/74 transition hover:bg-white/48 hover:text-moss"
                  >
                    <span>Contacto</span>
                  </Link>

                  {user?.is_admin ? (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => [
                        'flex items-center justify-between rounded-[22px] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] transition',
                        isActive ? 'bg-white/68 text-moss shadow-glass' : 'text-ink/74 hover:bg-white/48 hover:text-moss',
                      ].join(' ')}
                    >
                      <span>Admin</span>
                    </NavLink>
                  ) : null}
                </div>

                <div className="mt-4 rounded-[24px] border border-white/45 bg-white/38 p-4 shadow-glass">
                  {user ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.26em] text-ink/42">Cuenta</p>
                        <p className="mt-2 text-base font-semibold text-ink">{user.full_name}</p>
                      </div>
                      <button type="button" onClick={logout} className="topix-button-secondary w-full justify-center">
                        Salir
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm leading-6 text-ink/62">Ingresá para gestionar tu cuenta y continuar con tu compra.</p>
                      <Link to="/login" className="topix-button-secondary w-full justify-center">
                        Login
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
