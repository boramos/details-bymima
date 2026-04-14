"use client";

import { useEffect, useState } from "react";

interface StoreCredit {
  id: string;
  userId: string;
  amountUsd: number;
  remainingUsd: number;
  reason: string;
  note: string | null;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  userTotalActiveUsd?: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function AdminStoreCredits() {
  const [credits, setCredits] = useState<StoreCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalActiveCredits = credits.filter(c => c.status === "ACTIVE").length;
  const totalActiveUsd = credits
    .filter(c => c.status === "ACTIVE")
    .reduce((acc, curr) => acc + curr.remainingUsd, 0);

  const [emailQuery, setEmailQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string | null; email: string | null } | null>(null);
  const [amountUsd, setAmountUsd] = useState<number>(10);
  const [reason, setReason] = useState<string>("REFUND");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  
  const [formBusy, setFormBusy] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "error" | "success", text: string } | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch("/api/admin/store-credits");
        const data = await res.json();
        if (data.success) {
          setCredits(data.data);
        } else {
          setError(data.error || "Failed to load credits");
        }
      } catch {
        setError("Failed to load credits");
      } finally {
        setLoading(false);
      }
    }
    void fetchCredits();
  }, []);

  async function handleLookupUser() {
    if (!emailQuery.trim()) return;
    setLookupBusy(true);
    setFormMessage(null);
    setSelectedUser(null);
    try {
      const res = await fetch(`/api/admin/store-credits/user-lookup?email=${encodeURIComponent(emailQuery)}`);
      const data = await res.json();
      if (data.success) {
        setSelectedUser(data.data);
      } else {
        setFormMessage({ type: "error", text: "Usuario no encontrado" });
      }
    } catch {
      setFormMessage({ type: "error", text: "Error buscando usuario" });
    } finally {
      setLookupBusy(false);
    }
  }

  async function handleAssignCredit() {
    if (!selectedUser) {
      setFormMessage({ type: "error", text: "Debes seleccionar un usuario primero" });
      return;
    }
    if (amountUsd < 1) {
      setFormMessage({ type: "error", text: "El monto debe ser mayor a 0" });
      return;
    }

    setFormBusy(true);
    setFormMessage(null);

    try {
      const payload = {
        userId: selectedUser.id,
        amountUsd,
        reason,
        note: note.trim() || undefined,
        expiresAt: expiresAt || undefined,
      };

      const res = await fetch("/api/admin/store-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setCredits(prev => [data.data, ...prev]);
        setFormMessage({ type: "success", text: "Crédito asignado correctamente" });
        setSelectedUser(null);
        setEmailQuery("");
        setNote("");
        setExpiresAt("");
      } else {
        setFormMessage({ type: "error", text: data.error || "Error asignando crédito" });
      }
    } catch {
      setFormMessage({ type: "error", text: "Error asignando crédito" });
    } finally {
      setFormBusy(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("¿Estás seguro de que quieres revocar este crédito?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/store-credits/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCredits(prev => prev.map(c => 
          c.id === id ? { ...c, status: "EXPIRED", remainingUsd: 0 } : c
        ));
      } else {
        alert("Error: " + (data.error || "Failed to revoke"));
      }
    } catch {
      alert("Error revoking credit");
    }
  }

  const statusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          ACTIVO
        </span>
      );
    }
    if (status === "USED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
          USADO
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
        EXPIRADO
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando créditos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-rose-500">{error}</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Store Credits</h2>
            <p className="mt-1 text-sm text-slate-600">
              Gestiona el saldo a favor de los usuarios.
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Créditos Activos</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{totalActiveCredits}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Valor Total</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">${totalActiveUsd}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h3 className="font-semibold text-slate-900">Asignar Crédito</h3>
          
          {formMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium ${formMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {formMessage.text}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="flex gap-2">
                <input
                  id="email"
                  type="email"
                  value={emailQuery}
                  onChange={(e) => {
                    setEmailQuery(e.target.value);
                    setSelectedUser(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleLookupUser();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="ejemplo@correo.com"
                />
                <button
                  type="button"
                  onClick={() => void handleLookupUser()}
                  disabled={lookupBusy || !emailQuery.trim()}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  {lookupBusy ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {selectedUser && (
                <p className="mt-2 text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Usuario encontrado: {selectedUser.name || "Sin nombre"} ({selectedUser.email})
                </p>
              )}
            </div>

            <div>
              <input
                id="amount"
                type="number"
                min={1}
                value={amountUsd}
                onChange={(e) => setAmountUsd(Number(e.target.value))}
                placeholder="Monto (USD)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="REFUND">Refund / Devolución</option>
                <option value="PROMOTION">Promoción / Regalo</option>
                <option value="REFERRAL">Referido</option>
                <option value="MANUAL">Ajuste Manual</option>
              </select>
            </div>

            <div>
              <input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                placeholder="Fecha de Expiración"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Detalles adicionales..."
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={formBusy || !selectedUser}
              onClick={() => void handleAssignCredit()}
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {formBusy ? "Asignando..." : "Asignar Crédito"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 px-2">Historial de Créditos</h3>
          {credits.map((credit) => (
            <article key={credit.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">{credit.user.name || "Usuario"}</p>
                    {statusBadge(credit.status)}
                  </div>
                  <p className="text-sm text-slate-500">{credit.user.email}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-500">Motivo:</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium">{credit.reason}</span>
                    </div>
                    {credit.note && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-500">Nota:</span>
                        <span>{credit.note}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-4">
                    <span>Creado: {new Date(credit.createdAt).toLocaleDateString()}</span>
                    {credit.expiresAt && (
                      <span>Expira: {new Date(credit.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 text-right shrink-0">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">${credit.remainingUsd}</p>
                    <p className="text-xs text-slate-500">de ${credit.amountUsd}</p>
                  </div>
                  {credit.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => void handleRevoke(credit.id)}
                      className="text-sm font-medium text-rose-600 transition hover:text-rose-800"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {credits.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="text-sm text-slate-500">No hay créditos emitidos aún.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
