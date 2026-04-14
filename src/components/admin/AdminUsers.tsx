"use client";

import { useState, useEffect } from "react";
import type { AdminUser } from "@/components/admin/admin-types";

type AdminUsersProps = {
  stats: {
    totalUsers: number;
    totalAdmins: number;
    activePassports: number;
  };
  currentUserId: string;
};

export function AdminUsers({ stats, currentUserId }: AdminUsersProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); 
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const url = new URL("/api/admin/users", window.location.origin);
        if (debouncedSearch) url.searchParams.set("search", debouncedSearch);
        if (roleFilter) url.searchParams.set("role", roleFilter);
        url.searchParams.set("page", page.toString());
        url.searchParams.set("limit", limit.toString());

        const res = await fetch(url.toString());
        const data = await res.json();
        
        if (res.ok) {
          setUsers(data.users || []);
          setTotal(data.total || 0);
        } else {
          setUsers([]);
        }
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [debouncedSearch, roleFilter, page]);

  const handleRoleChange = async (id: string, newRole: "ADMIN" | "CUSTOMER") => {
    if (id === currentUserId) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        setMessage({ text: "Rol actualizado correctamente", type: "success" });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error al actualizar rol", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de conexión", type: "error" });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserId) return;
    if (!window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        setTotal(t => t - 1);
        setMessage({ text: "Usuario eliminado", type: "success" });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error al eliminar", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Error de conexión", type: "error" });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 bg-[#f6f7fb] min-h-screen p-8">
      <div className="flex flex-col gap-4 sm:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">Administra los usuarios y sus permisos.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Total usuarios</p>
          <p className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Administradores</p>
          <p className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{stats.totalAdmins}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Passport activos</p>
          <p className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-slate-900">{stats.activePassports}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            >
              <option value="">Todos los roles</option>
              <option value="CUSTOMER">Clientes</option>
              <option value="ADMIN">Administradores</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Mostrando {total > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} de {total}
          </div>
        </div>

        {message && (
          <div className={`px-6 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Usuario</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Passport</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Órdenes</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Registrado</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    const isPassportActive = user.passport?.status === "ACTIVE" && new Date(user.passport.endDate) > new Date();
                    const initial = (user.name || user.email).charAt(0).toUpperCase();

                    return (
                      <tr key={user.id}>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-semibold">
                                {initial}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-slate-900">{user.name || "Sin nombre"}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "ADMIN" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isPassportActive && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Passport ✓
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-slate-700">
                          {user._count.orders}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-slate-700">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                          {isSelf ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Tú</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button type="button"
                                onClick={() => handleRoleChange(user.id, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}
                                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                              >
                                Cambiar a {user.role === "ADMIN" ? "Cliente" : "Admin"}
                              </button>
                              <button type="button"
                                onClick={() => handleDelete(user.id)}
                                className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isPassportActive = user.passport?.status === "ACTIVE" && new Date(user.passport.endDate) > new Date();
                const initial = (user.name || user.email).charAt(0).toUpperCase();

                return (
                  <div key={user.id} className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-semibold">
                          {initial}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{user.name || "Sin nombre"}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                      {isSelf && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Tú</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"
                      }`}>
                        {user.role}
                      </span>
                      {isPassportActive && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Passport ✓
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Órdenes: <span className="font-medium text-slate-900">{user._count.orders}</span></span>
                      <span>{formatDate(user.createdAt)}</span>
                    </div>

                    {!isSelf && (
                      <div className="flex gap-2 pt-2">
                        <button type="button"
                          onClick={() => handleRoleChange(user.id, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN")}
                          className="flex-1 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          Hacer {user.role === "ADMIN" ? "Cliente" : "Admin"}
                        </button>
                        <button type="button"
                          onClick={() => handleDelete(user.id)}
                          className="flex-1 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {users.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No se encontraron usuarios.
                </div>
              )}
            </div>

            {total > limit && (
              <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <button type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-500">
                  Página {page} de {totalPages}
                </span>
                <button type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
