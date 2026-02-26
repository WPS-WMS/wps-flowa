"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type GroupItem = { id: string; name: string; hours: number; count: number; totalHours: number };

export default function RelatorioHorasPage() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [groupBy, setGroupBy] = useState<"user" | "project" | "client">("project");
  const [data, setData] = useState<{ groups?: GroupItem[]; totalHours?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ start, end, groupBy });
    apiFetch(`/api/reports/hours?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [start, end, groupBy]);

  const groups = data?.groups ?? [];
  const totalHours = data?.totalHours ?? 0;
  const label = groupBy === "user" ? "Consultor" : groupBy === "project" ? "Projeto" : "Cliente";

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Horas por período / projeto / cliente</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Total de horas apontadas com filtro de datas e agrupamento.
          </p>
        </div>
      </header>
      <main className="flex-1 px-4 md:px-6 py-4 min-h-0 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-600">De</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Até</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Agrupar por</span>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as "user" | "project" | "client")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="user">Consultor</option>
                <option value="project">Projeto</option>
                <option value="client">Cliente</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <>
              <div className="text-sm font-medium text-slate-700">Total no período: <span className="text-blue-600">{totalHours.toFixed(1)} h</span></div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{label}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Horas</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Apontamentos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groups.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm text-slate-900">{g.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-700 text-right">{g.totalHours.toFixed(1)}</td>
                        <td className="px-6 py-3 text-sm text-slate-500 text-right">{g.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {groups.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum dado no período.</p>}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
