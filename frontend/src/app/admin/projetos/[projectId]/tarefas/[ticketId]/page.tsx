"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EditTaskModalFull } from "@/components/EditTaskModalFull";
import type { PackageTicket } from "@/components/PackageCard";

type PageProps = {
  params: Promise<{ projectId: string; ticketId: string }>;
};

export default function TarefaDetalhePage({ params }: PageProps) {
  const { projectId: routeProjectId, ticketId: routeTicketId } = use(params);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const basePath = pathname.startsWith("/gestor")
    ? "/gestor"
    : pathname.startsWith("/consultor")
      ? "/consultor"
      : "/admin";

  const projectId = searchParams.get("projectId") ?? routeProjectId;
  const ticketId = searchParams.get("ticketId") ?? routeTicketId;
  const from = searchParams.get("from") ?? "";

  const [ticket, setTicket] = useState<PackageTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    if (from === "lista-tarefas") {
      router.push(`${basePath}/projetos/lista-tarefas`);
      return;
    }
    router.push(`${basePath}/projetos/_?projectId=${encodeURIComponent(projectId)}`);
  }, [router, basePath, from, projectId]);

  const loadTicket = useCallback(async () => {
    if (!ticketId) {
      setError("Tarefa não encontrada");
      setTicket(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/tickets/${ticketId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao carregar tarefa");
      }
      const data = (await res.json()) as PackageTicket;
      setTicket(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar tarefa");
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  const headerTitle = useMemo(() => {
    if (!ticket) return "Tarefa";
    return ticket.type === "SUBPROJETO" ? ticket.title : `#${ticket.code} · ${ticket.title}`;
  }, [ticket]);

  const headerSubtitle = useMemo(() => {
    if (!ticket) return "";
    const projectName = ticket.project?.name ? `Projeto: ${ticket.project.name}` : "";
    const clientName = ticket.project?.client?.name ? `Cliente: ${ticket.project.client.name}` : "";
    return [projectName, clientName].filter(Boolean).join(" · ");
  }, [ticket]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Carregando tarefa...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 flex flex-col gap-4 p-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <p className="text-sm text-red-600">{error ?? "Tarefa não encontrada"}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[color:var(--background)]">
      <header className="flex-shrink-0 bg-[color:var(--surface)]/60 backdrop-blur border-b border-[color:var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-semibold text-[color:var(--foreground)] truncate">
              {headerTitle}
            </h1>
            {headerSubtitle ? (
              <p className="text-xs md:text-sm text-[color:var(--muted-foreground)] mt-1 truncate">
                {headerSubtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            title="Voltar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border transition hover:opacity-90"
            style={{
              borderColor: "var(--border)",
              background: "rgba(0,0,0,0.06)",
              color: "var(--foreground)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <EditTaskModalFull
            ticket={ticket}
            projectId={String(ticket.projectId ?? projectId ?? "")}
            projectName={ticket.project?.name}
            onClose={handleBack}
            onSaved={() => void loadTicket()}
          />
        </div>
      </main>
    </div>
  );
}

