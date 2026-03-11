"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Download, FileText } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-day-picker/style.css";

type UserOption = { id: string; name: string };
type ProjectOption = { id: string; name: string; clientId?: string; client?: { id: string; name: string } };
type EntryRow = {
  id: string;
  date: string;
  horaInicio: string;
  horaFim: string;
  totalHoras: number;
  description?: string | null;
  user?: { id: string; name: string };
  project?: { id: string; name: string; client?: { id: string; name: string } };
  ticket?: { id: string; code: string; title: string } | null;
};

function fmtHours(n: number): string {
  const h = Math.floor(n);
  const m = Math.round((n - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatDateOnly(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function downloadCsv(rows: EntryRow[]) {
  const headers = [
    "Data",
    "Colaborador",
    "Projeto",
    "ID Tarefa",
    "Tarefa",
    "Início",
    "Fim",
    "Hora total",
  ];
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const line = (row: EntryRow) =>
    [
      formatDateOnly(row.date),
      row.user?.name ?? "",
      row.project?.name ?? "",
      row.ticket?.code ?? "",
      row.ticket?.title ?? "",
      row.horaInicio,
      row.horaFim,
      fmtHours(row.totalHoras),
    ].map(escape).join(",");
  const csv = [headers.join(","), ...rows.map(line)].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gestao-horas-${rows[0]?.date ?? "inicio"}-${rows[rows.length - 1]?.date ?? "fim"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatorioGestaoHorasPage() {
  const [userId, setUserId] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = new Date();
    from.setDate(1);
    const to = new Date();
    return { from, to };
  });
  const [projectId, setProjectId] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);

  const startStr = range?.from ? range.from.toISOString().slice(0, 10) : "";
  const endStr = range?.to
    ? range.to.toISOString().slice(0, 10)
    : range?.from
    ? range.from.toISOString().slice(0, 10)
    : "";

  useEffect(() => {
    apiFetch("/api/users/for-select")
      .then((r) => r.json())
      .then((data: UserOption[]) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    apiFetch("/api/projects")
      .then((r) => r.json())
      .then((data: ProjectOption[]) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  function handleFilter() {
    if (!startStr || !endStr) {
      alert("Selecione um período no calendário.");
      return;
    }
    setHasFiltered(true);
    setLoading(true);
    const params = new URLSearchParams({
      start: new Date(startStr).toISOString(),
      end: new Date(endStr + "T23:59:59.999Z").toISOString(),
    });
    if (userId) params.set("userId", userId);
    if (projectId) params.set("projectId", projectId);
    apiFetch(`/api/time-entries?${params}`)
      .then((r) => r.json())
      .then((data: EntryRow[]) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }

  const totalHoras = entries.reduce((s, e) => s + e.totalHoras, 0);

  function handleDownloadCsv() {
    if (entries.length === 0) {
      alert("Não há dados para exportar. Aplique os filtros primeiro.");
      return;
    }
    downloadCsv(entries);
  }

  function handleDownloadPdf() {
    if (entries.length === 0) {
      alert("Não há dados para exportar. Aplique os filtros primeiro.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }
    const rows = entries.map(
      (row) =>
        `<tr>
          <td>${formatDateOnly(row.date)}</td>
          <td>${(row.user?.name ?? "").replace(/</g, "&lt;")}</td>
          <td>${(row.project?.name ?? "").replace(/</g, "&lt;")}</td>
          <td>${(row.ticket?.code ?? "").replace(/</g, "&lt;")}</td>
          <td>${(row.ticket?.title ?? "").replace(/</g, "&lt;")}</td>
          <td>${row.horaInicio}</td>
          <td>${row.horaFim}</td>
          <td>${fmtHours(row.totalHoras)}</td>
        </tr>`
    ).join("");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Gestão de horas - ${startStr} a ${endStr}</title>
          <style>
            body { font-family: sans-serif; font-size: 12px; padding: 16px; }
            h1 { font-size: 18px; margin-bottom: 8px; }
            .meta { color: #666; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #1e3a5f; color: #fff; }
            tr:nth-child(even) { background: #f5f5f5; }
            .total { font-weight: bold; margin-top: 12px; }
          </style>
        </head>
        <body>
          <h1>Gestão de horas</h1>
          <p class="meta">Período: ${startStr ? formatDateOnly(startStr) : ""} a ${endStr ? formatDateOnly(endStr) : ""} | Total apontado: ${fmtHours(totalHoras)}</p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Colaborador</th>
                <th>Projeto</th>
                <th>ID Tarefa</th>
                <th>Tarefa</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Hora total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p class="total">Total: ${fmtHours(totalHoras)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Gestão de horas</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Lista de apontamentos com filtros por usuário, período e projeto. Exportar CSV ou PDF.
          </p>
        </div>
      </header>
      <main className="flex-1 px-4 md:px-6 py-4 min-h-0 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Usuário</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[180px]"
              >
                <option value="">Todos</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Período (de–até)</label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-600 mb-2">
                  {startStr && endStr
                    ? `De ${formatDateOnly(startStr)} até ${formatDateOnly(endStr)}`
                    : "Selecione um período no calendário abaixo."}
                </p>
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(r) => setRange(r ?? undefined)}
                  numberOfMonths={2}
                  locale={ptBR}
                  defaultMonth={range?.from}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Projeto</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[200px]"
              >
                <option value="">Todos os projetos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.client?.name ? `${p.client.name} – ` : ""}{p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleFilter}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Carregando..." : "Filtrar"}
            </button>
          </div>

          {/* Botões de download */}
          {hasFiltered && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={entries.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={entries.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {!hasFiltered ? (
              <p className="p-6 text-center text-slate-500 text-sm">Defina os filtros e clique em Filtrar para carregar os apontamentos.</p>
            ) : loading ? (
              <p className="p-6 text-center text-slate-500 text-sm">Carregando...</p>
            ) : entries.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-sm">Nenhum apontamento no período.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Colaborador</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Projeto</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarefa</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Início</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fim</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Hora total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entries.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{formatDateOnly(row.date)}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{row.user?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{row.project?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-mono">{row.ticket?.code ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-800 max-w-[200px] truncate" title={row.ticket?.title}>{row.ticket?.title ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{row.horaInicio}</td>
                          <td className="px-4 py-3 text-sm text-slate-700">{row.horaFim}</td>
                          <td className="px-4 py-3 text-sm text-slate-800 text-right font-mono">{fmtHours(row.totalHoras)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm font-medium text-slate-700">
                  Total apontado: {fmtHours(totalHoras)}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
