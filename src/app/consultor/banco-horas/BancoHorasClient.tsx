"use client";

import { useState, useEffect } from "react";

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function BancoHorasClient({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<
    Array<{
      month: number;
      year: number;
      horasPrevistas: number;
      horasTrabalhadas: number;
      horasComplementares: number;
      observacao: string | null;
    }>
  >([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((list: Array<{ id: string; name: string }>) =>
          setUsers(list)
        );
    }
  }, [isAdmin]);

  useEffect(() => {
    setLoading(true);
    const url = `/api/hour-bank?year=${year}${isAdmin && selectedUserId ? `&userId=${selectedUserId}` : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [year, selectedUserId, isAdmin]);

  const fmt = (n: number) => {
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Ano</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {isAdmin && users.length > 0 && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">Usuário</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white min-w-[200px]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-sm">
              <th className="px-4 py-3 text-left">Mês</th>
              <th className="px-4 py-3 text-right">Horas previstas</th>
              <th className="px-4 py-3 text-right">Horas trabalhadas</th>
              <th className="px-4 py-3 text-right">Complementares</th>
              <th className="px-4 py-3 text-left">Observação</th>
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
              data.map((row) => (
                <tr key={`${row.year}-${row.month}`} className="border-t border-slate-700">
                  <td className="px-4 py-3 text-white">{MESES[row.month - 1]}/{row.year}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    {fmt(row.horasPrevistas)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">
                    {fmt(row.horasTrabalhadas)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span
                      className={
                        row.horasComplementares >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {fmt(Math.abs(row.horasComplementares))}
                      {row.horasComplementares >= 0 ? " +" : " -"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {row.observacao || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
