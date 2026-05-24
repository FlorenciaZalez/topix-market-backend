import { translations } from '../i18n/es';
import type { User } from 'types';

type CustomersManagerProps = {
  users: User[];
  loading: boolean;
};

const t = translations.es;

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function CustomersManager({ users, loading }: CustomersManagerProps) {
  if (!users.length && !loading) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.customers}</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{t.noCustomersYet}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <section key={user.id} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_220px] lg:items-center">
            <div>
              <p className="text-xl font-semibold tracking-[-0.03em] text-white">{user.full_name}</p>
              <p className="mt-2 text-sm text-white/58">{user.email}</p>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-[#151515] px-4 py-3 text-sm text-white/72">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{t.registeredOnLabel}</p>
              <p className="mt-2 text-white/82">{formatDate(user.created_at)}</p>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-[#151515] px-4 py-3 text-sm text-white/72">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{t.roleLabel}</p>
              <p className="mt-2 font-medium text-white">{user.is_admin ? t.adminLabel : t.customerLabel}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}