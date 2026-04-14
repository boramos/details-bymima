"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  product?: {
    imagePath: string | null;
    imageEmoji: string;
    gradientClass: string;
    slug: string;
  };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string | Date;
  deliveryMethod: string;
  totalCop: number;
  items: OrderItem[];
};

export default function OrdersTab({ initialOrders, locale }: { initialOrders: Order[]; locale: string }) {
  const isEs = locale === "es";
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        let url = `/api/orders?filter=${filter}`;
        if (filter === "custom" && customFrom && customTo) {
          url += `&from=${customFrom}&to=${customTo}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json() as { success: boolean; data: Order[] };
          setOrders(json.data ?? []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [filter, customFrom, customTo]);

  const statusMap: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PREPARING: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-[var(--color-dark)] mb-4">
        {isEs ? "Tus Pedidos" : "Your Orders"}
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "all", label: isEs ? "Todos" : "All" },
          { id: "3months", label: isEs ? "Últimos 3 meses" : "Last 3 months" },
          { id: "1year", label: isEs ? "Último año" : "Last year" },
          { id: "custom", label: isEs ? "Personalizado" : "Custom" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              filter === f.id
                ? "bg-[var(--color-primary)] text-white"
                : "bg-white border border-[var(--color-primary-pale)] text-[var(--color-dark)] hover:border-[var(--color-primary-light)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "custom" && (
        <div className="flex gap-4 mb-6">
          <div>
            <input
              id="from"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              placeholder={isEs ? "Desde" : "From"}
              className="px-4 py-2 border border-[var(--color-primary-pale)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--color-dark)]"
            />
          </div>
          <div>
            <input
              id="to"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              placeholder={isEs ? "Hasta" : "To"}
              className="px-4 py-2 border border-[var(--color-primary-pale)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--color-dark)]"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-[var(--color-muted)]">{isEs ? "Cargando..." : "Loading..."}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-cream)] border border-[var(--color-primary-pale)]">
          <p className="text-[var(--color-dark)] mb-4">{isEs ? "No tienes pedidos aún." : "No orders found."}</p>
          <Link
            href="/order"
            className="inline-block px-6 py-2 bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-light)] transition-colors"
          >
            {isEs ? "Ver catálogo" : "View catalog"}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-[var(--color-primary-pale)] p-6 bg-white">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-[var(--color-primary-pale)]">
                <div>
                  <h3 className="font-bold text-[var(--color-dark)]">#{order.orderNumber}</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusMap[order.status] || order.status}
                  </span>
                  <p className="text-sm font-semibold text-[var(--color-dark)] mt-1">{order.deliveryMethod}</p>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {item.product?.slug ? (
                      <Link href={`/product/${item.product.slug}`} className="relative shrink-0 h-12 w-12 overflow-hidden">
                        {item.product.imagePath ? (
                          <Image src={item.product.imagePath} alt={item.productName} fill className="object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-lg ${item.product.gradientClass ?? "bg-gradient-to-br from-pink-100 to-rose-100"}`}>
                            {item.product.imageEmoji ?? "🌸"}
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="shrink-0 h-12 w-12 overflow-hidden bg-[var(--color-cream)] flex items-center justify-center text-lg">
                        🌸
                      </div>
                    )}
                    <span className="text-[var(--color-dark)]">{item.quantity}x {item.productName}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-primary-pale)] flex justify-between items-center">
                <span className="font-bold text-[var(--color-dark)]">Total</span>
                <span className="font-bold text-[var(--color-primary)]">
                  ${(order.totalCop / 100).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
