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
    <section
      className="rounded-2xl border p-4 md:p-5 space-y-3 w-full bg-[color:var(--surface)]/80 backdrop-blur"
      style={{ borderColor: "var(--border)" }}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
        SLA configurado (AMS)
      </h2>
      <p className="text-xs text-[color:var(--muted-foreground)]">
        Tempos em horas por prioridade de chamado (conforme cadastro do projeto).
      </p>
      {!hasAny ? (
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Nenhum SLA por prioridade foi cadastrado para este projeto.
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <table className="min-w-full text-sm">
            <thead
              className="border-b"
              style={{
                borderColor: "var(--border)",
                background: "rgba(0,0,0,0.04)",
              }}
            >
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-[color:var(--muted-foreground)]">
                  Prioridade
                </th>
                <th className="px-3 py-2 text-right font-semibold text-[color:var(--muted-foreground)]">
                  Tempo de resposta
                </th>
                <th className="px-3 py-2 text-right font-semibold text-[color:var(--muted-foreground)]">
                  Tempo de solução
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-2 text-[color:var(--foreground)]">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-[color:var(--foreground)]">
                    {fmtHoras(row.r)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-[color:var(--foreground)]">
                    {fmtHoras(row.s)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
