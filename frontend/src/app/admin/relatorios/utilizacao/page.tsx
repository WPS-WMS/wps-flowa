"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type Row = { id: string; name: string; cargaHorariaSemanal: number; workedHours: number; expectedHours: number; utilization: number };

export default function RelatorioUtilizacaoPage() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ list: Row[]; workingDays: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ start, end });
    apiFetch(`/api/reports/utilization?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [start, end]);

  const list = data?.list ?? [];
  const workingDays = data?.workingDays ?? 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Utilização</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Horas trabalhadas vs. capacidade no período (dias úteis: {workingDays}).
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
          </div>

          {loading ? (
            <p className="text-slate-500">Carregando...</p>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Consultor</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Carga semanal (h)</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Horas trabalhadas</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Horas esperadas</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Utilização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-900">{r.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-700 text-right">{r.cargaHorariaSemanal}</td>
                      <td className="px-6 py-3 text-sm text-slate-700 text-right">{r.workedHours.toFixed(1)}</td>
                      <td className="px-6 py-3 text-sm text-slate-700 text-right">{r.expectedHours.toFixed(1)}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={r.utilization > 100 ? "text-amber-600" : r.utilization >= 80 ? "text-green-600" : "text-slate-600"}>
                          {r.utilization}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {list.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum dado.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
