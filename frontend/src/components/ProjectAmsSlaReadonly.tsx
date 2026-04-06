"use client";

import { type ProjectForCard } from "@/components/ProjectCard";

function fmtHoras(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(Number(v))) return "—";
  return `${Number(v)} h`;
}

type Props = {
  project: ProjectForCard;
};

export function ProjectAmsSlaReadonly({ project }: Props) {
  if (project.tipoProjeto !== "AMS") return null;

  const rows = [
    { label: "Baixa", r: project.slaRespostaBaixa, s: project.slaSolucaoBaixa },
    { label: "Média", r: project.slaRespostaMedia, s: project.slaSolucaoMedia },
    { label: "Alta", r: project.slaRespostaAlta, s: project.slaSolucaoAlta },
    { label: "Urgente", r: project.slaRespostaCritica, s: project.slaSolucaoCritica },
  ];

  const hasAny = rows.some((row) => row.r != null || row.s != null);

  return (
    <section className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 md:p-5 space-y-3 w-full">
      <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">SLA configurado (AMS)</h2>
      <p className="text-xs text-slate-500">
        Tempos em horas por prioridade de chamado (conforme cadastro do projeto).
      </p>
      {!hasAny ? (
        <p className="text-sm text-slate-600">Nenhum SLA por prioridade foi cadastrado para este projeto.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-emerald-200/60 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">Prioridade</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">Tempo de resposta</th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">Tempo de solução</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-700">{fmtHoras(row.r)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-700">{fmtHoras(row.s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
