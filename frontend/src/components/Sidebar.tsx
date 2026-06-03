import { FolderTree, ImageIcon, Landmark, LayoutGrid, Package, Truck, Users } from 'lucide-react';

import { translations } from '../i18n/es';

export type AdminSection = 'products' | 'categories' | 'shipping-rates' | 'bank-details' | 'home-content' | 'orders' | 'customers';

type SidebarProps = {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
};

const t = translations.es;

const items: Array<{
  id: AdminSection;
  label: string;
  icon: typeof Package;
  description: string;
}> = [
  {
    id: 'products',
    label: t.products,
    icon: Package,
    description: t.catalogManagement,
  },
  {
    id: 'categories',
    label: t.categoriesManager,
    icon: FolderTree,
    description: t.categoryManagement,
  },
  {
    id: 'shipping-rates',
    label: t.shippingRates,
    icon: Truck,
    description: t.shippingRatesManagement,
  },
  {
    id: 'bank-details',
    label: t.bankDetails,
    icon: Landmark,
    description: t.paymentSettings,
  },
  {
    id: 'home-content',
    label: t.homeContent,
    icon: ImageIcon,
    description: t.homeContentManagement,
  },
  {
    id: 'orders',
    label: t.orders,
    icon: LayoutGrid,
    description: t.ordersManagement,
  },
  {
    id: 'customers',
    label: t.customers,
    icon: Users,
    description: t.customersManagement,
  },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[#141414] p-4 text-white shadow-[0_32px_80px_rgba(0,0,0,0.35)] lg:p-5">
      <div className="border-b border-white/10 px-3 pb-5 pt-2">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">{t.topixMarket}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{t.adminPanel}</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">{t.manageCatalog}</p>
      </div>

      <nav className="mt-5 flex gap-3 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`min-w-[156px] rounded-[20px] border px-3.5 py-2 text-left transition lg:min-w-0 ${
                isActive
                  ? 'border-blue-400/40 bg-gradient-to-br from-blue-500/20 to-violet-500/10 text-white shadow-[0_20px_60px_rgba(59,130,246,0.14)]'
                  : 'border-white/10 bg-white/[0.03] text-white/72 hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex min-h-[46px] items-center gap-2.5">
                <span
                  className={`rounded-xl p-1 ${
                    isActive ? 'bg-blue-500/16 text-blue-200' : 'bg-white/6 text-white/70'
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div className="flex min-h-full items-center">
                  <p className="text-[15px] font-medium">{item.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}