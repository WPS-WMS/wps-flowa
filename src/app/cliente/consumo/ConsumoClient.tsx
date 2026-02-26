"use client";

import { useState, useEffect } from "react";

export function ConsumoClient() {
  const [entries, setEntries] = useState<
    Array<{
      id: string;
      date: string;
      totalHoras: number;
      description?: string;
      project: { name: string; client: { name: string } };
      ticket?: { code: string; title: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    setLoading(true);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    fetch(
      `/api/time-entries?start=${start.toISOString()}&end=${end.toISOString()}&view=client`
    )
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [year, month]);

  const fmt = (n: number) => {
    const h = Math.floor(n);
    const m = Math.round((n - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Mês</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
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
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-sm">
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Cliente / Projeto</th>
              <th className="px-4 py-3 text-left">Chamado</th>
              <th className="px-4 py-3 text-right">Horas</th>
              <th className="px-4 py-3 text-left">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Carregando...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum apontamento neste período
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-700">
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(e.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {e.project?.client?.name} - {e.project?.name}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {e.ticket ? `${e.ticket.code}: ${e.ticket.title}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400">
                    {fmt(e.totalHoras)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm max-w-xs truncate">
                    {e.description || "-"}
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
