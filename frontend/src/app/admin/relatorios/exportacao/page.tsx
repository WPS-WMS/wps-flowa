"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type ExportRow = { data: string; consultor: string; cliente: string; projeto: string; atividade: string; horas: number; descricao: string };

function downloadCsv(rows: ExportRow[]) {
  const headers = ["Data", "Consultor", "Cliente", "Projeto", "Atividade", "Horas", "Descrição"];
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const line = (row: ExportRow) => [row.data, row.consultor, row.cliente, row.projeto, row.atividade, row.horas, row.descricao].map(escape).join(",");
  const csv = [headers.join(","), ...rows.map(line)].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `horas-faturamento-${rows[0]?.data ?? "inicio"}-${rows[rows.length - 1]?.data ?? "fim"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatorioExportacaoPage() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  function handleExport() {
    setLoading(true);
    const params = new URLSearchParams({ start, end });
    apiFetch(`/api/reports/export/hours?${params}`)
      .then((r) => r.json())
      .then((body: { rows?: ExportRow[] }) => {
        const rows = body.rows ?? [];
        if (rows.length === 0) {
          alert("Nenhum apontamento no período para exportar.");
          return;
        }
        downloadCsv(rows);
      })
      .catch(() => alert("Erro ao exportar. Tente novamente."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Exportar faturamento</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Baixe as horas apontadas no período em CSV (UTF-8) para cobrança ou integração.
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
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Baixar CSV"}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            O arquivo inclui: data, consultor, cliente, projeto, atividade, horas e descrição. Pode ser aberto no Excel ou importado em sistemas de faturamento.
          </p>
        </div>
      </main>
    </div>
  );
}
