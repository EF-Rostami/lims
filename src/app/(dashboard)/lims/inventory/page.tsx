"use client";

import { useState } from "react";
import {
  FlaskConical, Package, Truck, AlertTriangle, PlusCircle,
  Loader2, Trash2, Edit3, Check, X, ChevronDown, ChevronUp,
  Clock, TrendingDown, Beaker, TestTube2, Wrench, ShoppingCart,
} from "lucide-react";
import {
  useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
  useInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem,
  useInventoryLots, useCreateInventoryLot, useRecordUsage,
  useInventoryAlerts,
} from "@/features/lims/inventory/inventory.queries";
import type {
  SupplierRead, InventoryItemRead, InventoryLotRead,
  ItemCategory, LotStatus,
} from "@/features/lims/inventory/inventory.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<ItemCategory, { label: string; color: string; icon: React.ElementType }> = {
  chemical:   { label: "Chemical",   color: "bg-purple-100 text-purple-700", icon: Beaker },
  reagent:    { label: "Reagent",    color: "bg-blue-100 text-blue-700",     icon: TestTube2 },
  kit:        { label: "Kit",        color: "bg-green-100 text-green-700",   icon: Package },
  consumable: { label: "Consumable", color: "bg-orange-100 text-orange-700", icon: ShoppingCart },
  equipment:  { label: "Equipment",  color: "bg-slate-100 text-slate-700",   icon: Wrench },
};

const LOT_STATUS_META: Record<LotStatus, { label: string; color: string }> = {
  active:     { label: "Active",     color: "bg-green-100 text-green-700" },
  expired:    { label: "Expired",    color: "bg-red-100 text-red-700" },
  depleted:   { label: "Depleted",   color: "bg-slate-100 text-slate-500" },
  quarantine: { label: "Quarantine", color: "bg-yellow-100 text-yellow-700" },
};

function expiryBadgeClass(days: number | null | undefined): string {
  if (days == null) return "bg-slate-100 text-slate-400";
  if (days < 0)  return "bg-red-100 text-red-700";
  if (days <= 7)  return "bg-red-100 text-red-700";
  if (days <= 30) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

type Tab = "overview" | "items" | "lots" | "suppliers";

// ── Sub-pages ─────────────────────────────────────────────────────────────────

// --- Alerts / Overview -------------------------------------------------------

function OverviewTab() {
  const { data: alerts, isLoading } = useInventoryAlerts();

  if (isLoading) return <Spinner />;

  const expiry = alerts?.expiry_alerts ?? [];
  const stock  = alerts?.stock_alerts  ?? [];
  const total  = expiry.length + stock.length;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl p-5 border-2 ${expiry.length > 0 ? "border-yellow-300 bg-yellow-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className={expiry.length > 0 ? "text-yellow-600" : "text-slate-400"} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expiry Alerts</span>
          </div>
          <p className={`text-3xl font-black ${expiry.length > 0 ? "text-yellow-700" : "text-slate-400"}`}>{expiry.length}</p>
          <p className="text-xs text-slate-500 mt-1">lots expiring within 30 days</p>
        </div>
        <div className={`rounded-xl p-5 border-2 ${stock.length > 0 ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={18} className={stock.length > 0 ? "text-red-600" : "text-slate-400"} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock</span>
          </div>
          <p className={`text-3xl font-black ${stock.length > 0 ? "text-red-700" : "text-slate-400"}`}>{stock.length}</p>
          <p className="text-xs text-slate-500 mt-1">items below minimum level</p>
        </div>
      </div>

      {total === 0 && (
        <div className="text-center py-12 text-slate-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No alerts — all stock levels and expiry dates are within limits.</p>
        </div>
      )}

      {/* Expiry alerts */}
      {expiry.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-yellow-500" /> Expiry Alerts
          </h3>
          <div className="space-y-2">
            {expiry.map((a) => (
              <div key={a.lot_id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 shadow-sm">
                <div>
                  <p className="font-semibold text-sm text-slate-800">{a.item_name}</p>
                  <p className="text-xs text-slate-500">Lot: {a.lot_number} &bull; {a.quantity_remaining} {a.unit} remaining</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${expiryBadgeClass(a.days_until_expiry)}`}>
                    {a.days_until_expiry < 0
                      ? `Expired ${Math.abs(a.days_until_expiry)}d ago`
                      : a.days_until_expiry === 0
                      ? "Expires today"
                      : `${a.days_until_expiry}d left`}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{a.expiry_date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stock alerts */}
      {stock.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-red-500" /> Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {stock.map((a) => {
              const pct = Math.round((a.current_stock / a.min_stock_level) * 100);
              return (
                <div key={a.item_id} className="bg-white border rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{a.item_name}</p>
                      <p className="text-xs text-slate-500">{a.item_code} &bull; {CATEGORY_META[a.category].label}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {a.current_stock.toFixed(1)} / {a.min_stock_level} {a.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct < 25 ? "bg-red-500" : "bg-yellow-400"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// --- Items Tab ---------------------------------------------------------------

const CATEGORIES: ItemCategory[] = ["chemical", "reagent", "kit", "consumable", "equipment"];
const BLANK_ITEM = { name: "", code: "", category: "reagent" as ItemCategory, unit: "", description: "", cas_number: "", min_stock_level: "" as number | "", supplier_id: "" as number | "" };

function ItemsTab() {
  const { data: items = [], isLoading } = useInventoryItems(undefined, false);
  const { data: suppliers = [] } = useSuppliers();
  const createItem = useCreateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const [form, setForm] = useState(BLANK_ITEM);
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState<ItemCategory | "">("");

  const filtered = catFilter ? items.filter(i => i.category === catFilter) : items;

  function handleCreate() {
    if (!form.name || !form.code || !form.unit) return;
    createItem.mutate(
      {
        ...form,
        min_stock_level: form.min_stock_level === "" ? null : Number(form.min_stock_level),
        supplier_id: form.supplier_id === "" ? null : Number(form.supplier_id),
      },
      { onSuccess: () => { setForm(BLANK_ITEM); setShowForm(false); } }
    );
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white border rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setCatFilter("")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${catFilter === "" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(catFilter === c ? "" : c)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${catFilter === c ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              {CATEGORY_META[c].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="ml-auto flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <PlusCircle size={14} /> Add Item
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-slate-50 border rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase text-slate-400">New Inventory Item</p>
          <div className="grid grid-cols-3 gap-3">
            <input className={INPUT} placeholder="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className={INPUT} placeholder="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            <input className={INPUT} placeholder="Unit * (mL, g, unit…)" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select className={INPUT} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as ItemCategory }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
            </select>
            <input className={INPUT} placeholder="CAS Number (optional)" value={form.cas_number} onChange={e => setForm(p => ({ ...p, cas_number: e.target.value }))} />
            <input type="number" className={INPUT} placeholder="Min Stock Level (alert threshold)" value={form.min_stock_level} onChange={e => setForm(p => ({ ...p, min_stock_level: e.target.value === "" ? "" : Number(e.target.value) }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className={INPUT} value={form.supplier_id} onChange={e => setForm(p => ({ ...p, supplier_id: e.target.value === "" ? "" : Number(e.target.value) }))}>
              <option value="">No Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className={INPUT} placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={createItem.isPending || !form.name || !form.code || !form.unit}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createItem.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save Item"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {filtered.length === 0 && <EmptyState icon={FlaskConical} text="No inventory items yet. Add items to start tracking." />}
          {filtered.map((item) => (
            <ItemRow key={item.id} item={item} onDelete={() => window.confirm(`Delete ${item.name}?`) && deleteItem.mutate(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onDelete }: { item: InventoryItemRead; onDelete: () => void }) {
  const { label, color, icon: Icon } = CATEGORY_META[item.category];
  const stockPct = item.min_stock_level ? Math.min((item.current_stock / item.min_stock_level) * 100, 100) : null;
  const isLow = item.min_stock_level != null && item.current_stock < item.min_stock_level;

  return (
    <div className={`bg-white border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition group ${isLow ? "border-red-200" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Icon size={20} className={`${isLow ? "text-red-400" : "text-slate-400"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm text-slate-800">{item.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{label}</span>
            {!item.is_active && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">Inactive</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono">{item.code}</span>
            {item.cas_number && <span>CAS: {item.cas_number}</span>}
            {item.supplier && <span>Supplier: {item.supplier.name}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0 min-w-[120px]">
          <p className={`text-lg font-black ${isLow ? "text-red-600" : "text-slate-800"}`}>
            {item.current_stock.toFixed(1)}<span className="text-xs font-normal text-slate-400 ml-1">{item.unit}</span>
          </p>
          {item.min_stock_level != null && (
            <p className="text-[10px] text-slate-400">min: {item.min_stock_level} {item.unit}</p>
          )}
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity ml-2">
          <Trash2 size={16} />
        </button>
      </div>
      {stockPct !== null && (
        <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-blue-400"}`} style={{ width: `${stockPct}%` }} />
        </div>
      )}
    </div>
  );
}

// --- Lots Tab ----------------------------------------------------------------

const BLANK_LOT = { item_id: "" as number | "", lot_number: "", supplier_lot_number: "", quantity_received: "" as number | "", expiry_date: "", notes: "" };
const BLANK_USAGE = { quantity_used: "" as number | "", test_reference: "", notes: "" };

function LotsTab() {
  const { data: items = [] } = useInventoryItems(undefined, false);
  const { data: lots = [], isLoading } = useInventoryLots();
  const createLot = useCreateInventoryLot();
  const recordUsage = useRecordUsage();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_LOT);
  const [filterItemId, setFilterItemId] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<LotStatus | "">("");
  const [expandedLot, setExpandedLot] = useState<number | null>(null);
  const [usageForm, setUsageForm] = useState<Record<number, typeof BLANK_USAGE>>({});

  const filtered = lots.filter(l =>
    (!filterItemId || l.item_id === filterItemId) &&
    (!filterStatus || l.status === filterStatus)
  );

  function handleCreateLot() {
    if (!form.item_id || !form.lot_number || !form.quantity_received) return;
    const qty = Number(form.quantity_received);
    createLot.mutate(
      {
        item_id: Number(form.item_id),
        lot_number: form.lot_number,
        supplier_lot_number: form.supplier_lot_number || null,
        quantity_received: qty,
        quantity_remaining: qty,
        received_date: new Date().toISOString().split("T")[0],
        expiry_date: form.expiry_date || null,
        notes: form.notes || null,
      },
      { onSuccess: () => { setForm(BLANK_LOT); setShowForm(false); } }
    );
  }

  function handleRecordUsage(lotId: number) {
    const u = usageForm[lotId];
    if (!u?.quantity_used) return;
    recordUsage.mutate(
      { lotId, data: { lot_id: lotId, quantity_used: Number(u.quantity_used), test_reference: u.test_reference || null, notes: u.notes || null } },
      { onSuccess: () => setUsageForm(p => ({ ...p, [lotId]: BLANK_USAGE })) }
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters + Add */}
      <div className="flex items-center gap-3 flex-wrap">
        <select className={`${INPUT} w-48`} value={filterItemId} onChange={e => setFilterItemId(e.target.value === "" ? "" : Number(e.target.value))}>
          <option value="">All Items</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select className={`${INPUT} w-36`} value={filterStatus} onChange={e => setFilterStatus(e.target.value as LotStatus | "")}>
          <option value="">All Status</option>
          {(["active", "expired", "depleted", "quarantine"] as LotStatus[]).map(s => (
            <option key={s} value={s}>{LOT_STATUS_META[s].label}</option>
          ))}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="ml-auto flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition">
          <PlusCircle size={14} /> Receive Lot
        </button>
      </div>

      {/* Receive form */}
      {showForm && (
        <div className="bg-slate-50 border rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase text-slate-400">Receive New Lot</p>
          <div className="grid grid-cols-3 gap-3">
            <select className={INPUT} value={form.item_id} onChange={e => setForm(p => ({ ...p, item_id: Number(e.target.value) }))}>
              <option value="">Select Item *</option>
              {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input className={INPUT} placeholder="Lot Number *" value={form.lot_number} onChange={e => setForm(p => ({ ...p, lot_number: e.target.value }))} />
            <input className={INPUT} placeholder="Supplier Lot No (optional)" value={form.supplier_lot_number} onChange={e => setForm(p => ({ ...p, supplier_lot_number: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className={INPUT} placeholder="Qty Received *" value={form.quantity_received} onChange={e => setForm(p => ({ ...p, quantity_received: e.target.value === "" ? "" : Number(e.target.value) }))} />
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase ml-0.5">Expiry Date</label>
              <input type="date" className={`${INPUT} mt-0.5`} value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} />
            </div>
            <input className={INPUT} placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreateLot}
              disabled={createLot.isPending || !form.item_id || !form.lot_number || !form.quantity_received}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createLot.isPending ? <Loader2 size={14} className="animate-spin" /> : "Receive"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {filtered.length === 0 && <EmptyState icon={Package} text="No lots found. Receive a lot to begin tracking." />}
          {filtered.map((lot) => {
            const expanded = expandedLot === lot.id;
            const u = usageForm[lot.id] ?? BLANK_USAGE;
            const item = items.find(i => i.id === lot.item_id);
            return (
              <div key={lot.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {/* Lot header */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-50 transition"
                  onClick={() => setExpandedLot(expanded ? null : lot.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-slate-800">{lot.item?.name ?? item?.name ?? `Item #${lot.item_id}`}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${LOT_STATUS_META[lot.status].color}`}>{LOT_STATUS_META[lot.status].label}</span>
                      {lot.days_until_expiry != null && lot.status === "active" && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${expiryBadgeClass(lot.days_until_expiry)}`}>
                          {lot.days_until_expiry < 0 ? "Expired" : lot.days_until_expiry === 0 ? "Today" : `${lot.days_until_expiry}d`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Lot: <span className="font-mono font-medium">{lot.lot_number}</span>{lot.supplier_lot_number ? ` · Supplier: ${lot.supplier_lot_number}` : ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    <p className="text-sm font-bold text-slate-800">
                      {lot.quantity_remaining.toFixed(1)} <span className="text-xs text-slate-400">/ {lot.quantity_received} {lot.item?.unit ?? item?.unit}</span>
                    </p>
                    {lot.expiry_date && <p className="text-[10px] text-slate-400">Exp: {lot.expiry_date}</p>}
                  </div>
                  {/* Stock bar */}
                  <div className="w-20 flex-shrink-0">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${lot.quantity_remaining / lot.quantity_received < 0.2 ? "bg-red-400" : "bg-blue-400"}`}
                        style={{ width: `${Math.round((lot.quantity_remaining / lot.quantity_received) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>

                {/* Usage panel */}
                {expanded && lot.status === "active" && (
                  <div className="border-t bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Record Usage</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className={`${INPUT} w-32`}
                        placeholder={`Qty (${lot.item?.unit ?? item?.unit})`}
                        value={u.quantity_used}
                        onChange={e => setUsageForm(p => ({ ...p, [lot.id]: { ...u, quantity_used: e.target.value === "" ? "" : Number(e.target.value) } }))}
                      />
                      <input
                        className={`${INPUT} flex-1`}
                        placeholder="Test / sample reference (optional)"
                        value={u.test_reference}
                        onChange={e => setUsageForm(p => ({ ...p, [lot.id]: { ...u, test_reference: e.target.value } }))}
                      />
                      <input
                        className={`${INPUT} flex-1`}
                        placeholder="Notes (optional)"
                        value={u.notes}
                        onChange={e => setUsageForm(p => ({ ...p, [lot.id]: { ...u, notes: e.target.value } }))}
                      />
                      <button
                        onClick={() => handleRecordUsage(lot.id)}
                        disabled={!u.quantity_used || recordUsage.isPending}
                        className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
                      >
                        Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Suppliers Tab -----------------------------------------------------------

const BLANK_SUPPLIER = { name: "", code: "", contact_person: "", email: "", phone: "" };

function SuppliersTab() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [form, setForm] = useState(BLANK_SUPPLIER);
  const [showForm, setShowForm] = useState(false);

  function handleCreate() {
    if (!form.name || !form.code) return;
    createSupplier.mutate(
      { ...form, contact_person: form.contact_person || null, email: form.email || null, phone: form.phone || null },
      { onSuccess: () => { setForm(BLANK_SUPPLIER); setShowForm(false); } }
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-700 transition">
          <PlusCircle size={14} /> Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 border rounded-xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase text-slate-400">New Supplier</p>
          <div className="grid grid-cols-2 gap-3">
            <input className={INPUT} placeholder="Supplier Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input className={INPUT} placeholder="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            <input className={INPUT} placeholder="Contact Person" value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
            <input type="email" className={INPUT} placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input className={INPUT} placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={createSupplier.isPending || !form.name || !form.code}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createSupplier.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save Supplier"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-slate-500 px-3 py-2">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {suppliers.length === 0 && <EmptyState icon={Truck} text="No suppliers yet. Add one to link to inventory items." />}
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white border rounded-xl px-4 py-3 shadow-sm flex items-center justify-between group hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">{s.name}</span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{s.code}</span>
                  {!s.is_active && <span className="text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full font-bold">Inactive</span>}
                </div>
                <div className="flex items-center gap-4 mt-0.5 text-xs text-slate-500">
                  {s.contact_person && <span>{s.contact_person}</span>}
                  {s.email && <span>{s.email}</span>}
                  {s.phone && <span>{s.phone}</span>}
                </div>
              </div>
              <button onClick={() => window.confirm(`Delete ${s.name}?`) && deleteSupplier.mutate(s.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const INPUT = "border p-2 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full";

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
      <Loader2 size={20} className="animate-spin text-blue-400" />
      <span className="text-sm">Loading…</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <Icon size={40} className="opacity-20" />
      <p className="text-sm text-center">{text}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",   label: "Alerts",    icon: AlertTriangle },
  { id: "items",      label: "Items",     icon: FlaskConical  },
  { id: "lots",       label: "Lots",      icon: Package       },
  { id: "suppliers",  label: "Suppliers", icon: Truck         },
];

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const { data: alerts } = useInventoryAlerts();
  const alertCount = (alerts?.expiry_alerts.length ?? 0) + (alerts?.stock_alerts.length ?? 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="border-b pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LIMS</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <FlaskConical size={28} className="text-blue-600" />
          Inventory &amp; Reagents
        </h1>
        <p className="text-gray-500 mt-1 italic">Track chemicals, reagents, kits, and consumables used in testing.</p>
      </header>

      {/* Tab navigation */}
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all",
              tab === id ? "bg-white shadow-sm text-blue-700" : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            <Icon size={16} />
            {label}
            {id === "overview" && alertCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview"  && <OverviewTab />}
        {tab === "items"     && <ItemsTab />}
        {tab === "lots"      && <LotsTab />}
        {tab === "suppliers" && <SuppliersTab />}
      </div>
    </div>
  );
}
