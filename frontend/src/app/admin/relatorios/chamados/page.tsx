"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function RelatorioChamadosPage() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<{ byStatus: Record<string, number>; total: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ start, end });
    apiFetch(`/api/reports/tickets?${params}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [start, end]);

  const byStatus = data?.byStatus ?? {};
  const total = data?.total ?? 0;
  const entries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Chamados / tickets</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Quantidade de chamados por status no período.
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
            <>
              <div className="text-sm font-medium text-slate-700">Total no período: <span className="text-blue-600">{total}</span> chamados</div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {entries.map(([status, count]) => (
                      <tr key={status} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm text-slate-900">{status}</td>
                        <td className="px-6 py-3 text-sm text-slate-700 text-right">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {entries.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">Nenhum chamado no período.</p>}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
