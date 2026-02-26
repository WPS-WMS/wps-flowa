"use client";

import { useState, useEffect } from "react";

const ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "GERENTE", label: "Gerente de projetos" },
  { value: "CONSULTOR", label: "Profissional" },
  { value: "CLIENTE", label: "Cliente" },
];

const DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  cargo?: string;
  cargaHorariaSemanal?: number;
  permitirMaisHoras?: boolean;
  permitirFimDeSemana?: boolean;
  permitirOutroPeriodo?: boolean;
  diasPermitidos?: string;
};

export function UsuariosClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONSULTOR",
    cargo: "",
    cargaHorariaSemanal: 40,
    permitirMaisHoras: false,
    permitirFimDeSemana: false,
    permitirOutroPeriodo: false,
    diasPermitidos: ["seg", "ter", "qua", "qui", "sex"],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function loadUsers() {
    setLoading(true);
    fetch(`/api/users?q=${encodeURIComponent(search)}`)
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, [search]);

  function openCreate() {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "CONSULTOR",
      cargo: "",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: false,
      permitirFimDeSemana: false,
      permitirOutroPeriodo: false,
      diasPermitidos: ["seg", "ter", "qua", "qui", "sex"],
    });
    setModal("create");
    setError("");
  }

  function toggleDia(dia: string) {
    setForm((f) => ({
      ...f,
      diasPermitidos: f.diasPermitidos.includes(dia)
        ? f.diasPermitidos.filter((d) => d !== dia)
        : [...f.diasPermitidos, dia],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar");
        return;
      }
      setModal(null);
      loadUsers();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome de usuário"
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 w-64"
        />
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-medium"
        >
          Criar
        </button>
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-sm">
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Cargo</th>
              <th className="px-4 py-3 text-right">Carga horária</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-white">{u.name}</td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {ROLES.find((r) => r.value === u.role)?.label || u.role}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.cargo || "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {u.cargaHorariaSemanal ?? 40}h/sem
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal === "create" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Criar usuário
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Senha</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Tipo de usuário
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cargo</label>
                  <input
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Carga horária planejada semanal
                  </label>
                  <input
                    type="number"
                    value={form.cargaHorariaSemanal}
                    onChange={(e) =>
                      setForm({ ...form, cargaHorariaSemanal: parseFloat(e.target.value) || 40 })
                    }
                    min={1}
                    max={60}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-400">
                    <input
                      type="checkbox"
                      checked={form.permitirMaisHoras}
                      onChange={(e) =>
                        setForm({ ...form, permitirMaisHoras: e.target.checked })
                      }
                      className="rounded"
                    />
                    Permitido apontar mais horas que o planejado?
                  </label>
                  <label className="flex items-center gap-2 text-slate-400">
                    <input
                      type="checkbox"
                      checked={form.permitirFimDeSemana}
                      onChange={(e) =>
                        setForm({ ...form, permitirFimDeSemana: e.target.checked })
                      }
                      className="rounded"
                    />
                    Permitido apontar em final de semana e feriado?
                  </label>
                  <label className="flex items-center gap-2 text-slate-400">
                    <input
                      type="checkbox"
                      checked={form.permitirOutroPeriodo}
                      onChange={(e) =>
                        setForm({ ...form, permitirOutroPeriodo: e.target.checked })
                      }
                      className="rounded"
                    />
                    Permitido apontar em outro período?
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Dias permitidos para apontamento
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DIAS.map((d) => (
                      <label
                        key={d}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.diasPermitidos.includes(d)}
                          onChange={() => toggleDia(d)}
                          className="rounded"
                        />
                        <span className="text-slate-300 capitalize">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-medium disabled:opacity-50"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
