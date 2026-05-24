import { useMemo, useState } from 'react';

import { translations } from '../i18n/es';
import type { Order, OrderStatus } from 'types';
import { formatCurrency } from 'utils/currency';

type OrdersManagerProps = {
  orders: Order[];
  loading: boolean;
  updatingOrderId: number | null;
  onUpdateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
};

const t = translations.es;

const statusOptions: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

function getStatusLabel(status: OrderStatus) {
  if (status === 'pending') return t.statusPending;
  if (status === 'paid') return t.statusPaid;
  if (status === 'shipped') return t.statusShipped;
  return t.statusDelivered;
}

function getPaymentMethodLabel(order: Order) {
  return order.payment_method === 'bank_transfer' ? t.transferLabel : t.mercadoPagoLabel;
}

function getShippingMethodLabel(order: Order) {
  return order.shipping_method === 'flat_rate' ? t.fixedRateLabel : t.arrangedShippingLabel;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function toDateInputValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function OrdersManager({ orders, loading, updatingOrderId: _updatingOrderId, onUpdateStatus: _onUpdateStatus }: OrdersManagerProps) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = toDateInputValue(order.created_at);
      if (fromDate && orderDate < fromDate) {
        return false;
      }
      if (toDate && orderDate > toDate) {
        return false;
      }
      return true;
    });
  }, [orders, fromDate, toDate]);

  if (!orders.length && !loading) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.orders}</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{t.noOrdersYet}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/35">{t.filterFromDate}</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded-[22px] border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/35">{t.filterToDate}</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded-[22px] border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/40"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/76 transition hover:border-white/20 hover:bg-white/[0.04]"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      {!filteredOrders.length ? (
        <div className="rounded-[28px] border border-dashed border-white/12 bg-white/[0.03] p-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/35">{t.orders}</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">{t.noOrdersForFilters}</h3>
        </div>
      ) : null}

      {filteredOrders.length ? (
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#1a1a1a]">
          <div className="max-h-[62vh] overflow-auto">
            <table className="min-w-full table-fixed divide-y divide-white/8 text-left text-sm text-white/72">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[36%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                <tr>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">Pedido</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.customerSummary}</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.orderDateLabel}</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">Total</th>
                  <th className="sticky top-0 z-20 bg-[#222222] px-6 py-4 text-right font-medium shadow-[0_14px_28px_rgba(10,10,10,0.38)]">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-5 align-top">
                      <div>
                        <p className="font-medium text-white">#{order.id}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/32">{t.orderSummary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white" title={order.user?.full_name || '-'}>{order.user?.full_name || '-'}</p>
                        <p className="mt-1 truncate text-xs text-white/46" title={order.user?.email || '-'}>{order.user?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-white/72">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-5 align-top font-medium text-white">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:border-white/20 hover:bg-white/[0.04]"
                        >
                          {t.viewOrderDetail}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#101010] p-6 text-white shadow-[0_32px_100px_rgba(0,0,0,0.45)] sm:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">{t.orderSummary}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Pedido #{selectedOrder.id}</h3>
                <p className="mt-2 text-sm text-white/52">{t.orderDateLabel}: {formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/76 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                {t.closeLabel}
              </button>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-[#151515] p-4 text-sm leading-7 text-white/70">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{t.customerSummary}</p>
                  <p className="mt-3 font-medium text-white">{selectedOrder.user?.full_name || '-'}</p>
                  <p className="text-white/58">{selectedOrder.user?.email || '-'}</p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#151515] p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{t.orderItemsLabel}</p>
                  <div className="mt-3 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-white/72">
                        <span>
                          {item.product.name} · {item.variant.color} x{item.quantity}
                        </span>
                        <span className="shrink-0 font-medium text-white">{formatCurrency(item.unit_price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-[#151515] p-4 text-sm leading-7 text-white/70">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{t.deliveryAddressLabel}</p>
                  <p className="mt-3 whitespace-pre-line text-white/78">{selectedOrder.delivery_address || '-'}</p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[#151515] p-4 text-sm leading-7 text-white/70">
                  <div className="flex items-center justify-between gap-4">
                    <span>{t.paymentMethodLabel}</span>
                    <span className="font-medium text-white">{getPaymentMethodLabel(selectedOrder)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span>{t.shippingMethodLabel}</span>
                    <span className="font-medium text-white">{getShippingMethodLabel(selectedOrder)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span>{t.orderStatusLabel}</span>
                    <span className="font-medium text-white">{getStatusLabel(selectedOrder.status)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span>Envio</span>
                    <span className="font-medium text-white">{formatCurrency(selectedOrder.shipping_price)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span>Total</span>
                    <span className="text-lg font-semibold text-white">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}