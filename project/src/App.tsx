import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { supabase } from "./lib/supabase";

interface FlaggedOrder {
  order_id: number;
  customer_name: string;
  total_amount: number;
  stock_level: number;
  email: string;
}

function App() {
  const [orders, setOrders] = useState<FlaggedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof FlaggedOrder>("total_amount");
  const [sortDesc, setSortDesc] = useState(true);
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setError(null);
      const { data, error: supaError } = await supabase
        .from("flagged_orders")
        .select("order_id, customer_name, total_amount, stock_level, email");
      if (supaError) {
        setError(supaError.message);
        setLoading(false);
        return;
      }
      setOrders(data ?? []);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const handleSort = (key: keyof FlaggedOrder) => {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const handleResolve = async (id: number) => {
    setRemovedIds((prev) => new Set(prev).add(id));
    const { error: delError } = await supabase
      .from("flagged_orders")
      .delete()
      .eq("order_id", id);
    if (delError) {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setError(delError.message);
      return;
    }
    setTimeout(() => {
      setOrders((prev) => prev.filter((o) => o.order_id !== id));
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  };

  const filtered = orders.filter(
    (o) =>
      String(o.order_id).toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDesc ? bVal - aVal : aVal - bVal;
    }
    return sortDesc
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal));
  });

  const highValueCount = orders.filter((o) => o.total_amount > 5000).length;
  const lowStockCount = orders.filter((o) => o.stock_level <= 10).length;

  const stockBadge = (level: number) => {
    if (level <= 10)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
          <XCircle className="h-3 w-3" />
          Critical ({level})
        </span>
      );
    if (level <= 25)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <AlertTriangle className="h-3 w-3" />
          Low ({level})
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <CheckCircle2 className="h-3 w-3" />
        Adequate ({level})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Supply Chain Monitor
              </h1>
              <p className="text-xs text-slate-500">Flagged Orders Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 ring-1 ring-red-200 sm:flex">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {highValueCount} high-value alerts
              </span>
            </div>
            <div className="hidden items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 ring-1 ring-amber-200 sm:flex">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {lowStockCount} critical stock
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Flagged Orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {orders.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">High Value (&gt;$5,000)</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {highValueCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Critical Stock (&le;10)</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {lowStockCount}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <p className="text-sm text-slate-500">
            Showing {sorted.length} of {orders.length} orders
          </p>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60">
                    {(
                      [
                        ["order_id", "Order ID"],
                        ["customer_name", "Customer"],
                        ["total_amount", "Amount"],
                        ["stock_level", "Stock"],
                        ["email", "Email"],
                      ] as [keyof FlaggedOrder, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        className="cursor-pointer select-none px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortKey === key &&
                            (sortDesc ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                            ) : (
                              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                            ))}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3.5 text-right font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((order) => {
                    const isHigh = order.total_amount > 5000;
                    const isRemoving = removedIds.has(order.order_id);
                    return (
                      <tr
                        key={order.order_id}
                        className={`transition-all duration-300 ${
                          isRemoving
                            ? "translate-x-4 opacity-0"
                            : "opacity-100"
                        } ${
                          isHigh
                            ? "bg-red-50/40 hover:bg-red-50/70"
                            : "hover:bg-slate-50/70"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {isHigh && (
                              <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                            )}
                            <span className="font-mono text-xs tracking-wide">
                              #{order.order_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {order.customer_name}
                        </td>
                        <td
                          className={`px-6 py-4 font-mono font-semibold ${
                            isHigh ? "text-red-600" : "text-slate-900"
                          }`}
                        >
                          ${order.total_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {stockBadge(order.stock_level)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {order.email}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleResolve(order.order_id)}
                            disabled={isRemoving}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Resolve
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {sorted.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        No orders match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
