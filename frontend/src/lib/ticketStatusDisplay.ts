export type KanbanColumn = {
  id: string;
  label: string;
  color: string; // ex: "bg-blue-500"
};

const BASE_STATUS_LABEL: Record<string, string> = {
  ABERTO: "Em aberto",
  EM_ANALISE: "Em análise",
  APROVADO: "Aprovado",
  EXECUCAO: "Em execução",
  TESTE: "Teste",
  ENCERRADO: "Finalizado",
};

const BASE_STATUS_COLOR: Record<string, string> = {
  ABERTO: "bg-slate-500",
  EM_ANALISE: "bg-amber-500",
  APROVADO: "bg-cyan-500",
  EXECUCAO: "bg-blue-500",
  TESTE: "bg-purple-500",
  ENCERRADO: "bg-emerald-500",
};

const DEFAULT_COLUMN_LABEL: Record<string, string> = {
  BACKLOG: "Em aberto",
  EM_EXECUCAO: "Em execução",
  FINALIZADAS: "Finalizadas",
};

const DEFAULT_COLUMN_COLOR: Record<string, string> = {
  BACKLOG: "bg-slate-500",
  EM_EXECUCAO: "bg-blue-500",
  FINALIZADAS: "bg-emerald-500",
};

export function loadKanbanCustomColumns(projectId: string): KanbanColumn[] {
  if (!projectId) return [];
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`kanban_columns_${projectId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (c) =>
          c &&
          typeof c === "object" &&
          "id" in c &&
          "label" in c &&
          "color" in c &&
          typeof (c as any).id === "string" &&
          typeof (c as any).label === "string" &&
          typeof (c as any).color === "string",
      )
      .map((c) => ({ id: (c as any).id, label: (c as any).label, color: (c as any).color }));
  } catch {
    return [];
  }
}

function isPastDue(dateIso: string): boolean {
  const todayStr = new Date().toISOString().slice(0, 10);
  const fimStr = String(dateIso).slice(0, 10);
  return fimStr < todayStr;
}

export function getTicketStatusDisplay(input: {
  status: unknown;
  projectId?: string;
  dataFimPrevista?: string | null;
  /**
   * Quando true e a tarefa não está encerrada, sobrescreve para "Atrasado"
   * (mantém o comportamento do Kanban, mas usando o status real no resto).
   */
  allowOverdue?: boolean;
}): { label: string; color: string; sortBucket: number } {
  const statusRaw = String(input.status ?? "").trim();
  const s = statusRaw.toUpperCase();

  const isClosed = s === "ENCERRADO" || s === "FINALIZADAS";
  if (input.allowOverdue && input.dataFimPrevista && !isClosed && isPastDue(input.dataFimPrevista)) {
    return { label: "Atrasado", color: "bg-rose-500", sortBucket: 0 };
  }

  // Status padrão (enum legado)
  if (BASE_STATUS_LABEL[s]) {
    const bucket = s === "ENCERRADO" ? 2 : s === "ABERTO" ? 1 : 0;
    return { label: BASE_STATUS_LABEL[s], color: BASE_STATUS_COLOR[s] ?? "bg-slate-400", sortBucket: bucket };
  }

  // Colunas padrão do Kanban (quando o status foi salvo como id de coluna)
  if (DEFAULT_COLUMN_LABEL[s]) {
    const bucket = s === "FINALIZADAS" ? 2 : s === "BACKLOG" ? 1 : 0;
    return { label: DEFAULT_COLUMN_LABEL[s], color: DEFAULT_COLUMN_COLOR[s] ?? "bg-slate-400", sortBucket: bucket };
  }

  // Coluna customizada do Kanban (status = id da coluna)
  const pid = input.projectId ? String(input.projectId) : "";
  if (pid) {
    const custom = loadKanbanCustomColumns(pid).find((c) => c.id === statusRaw);
    if (custom) {
      return { label: custom.label, color: custom.color || "bg-slate-400", sortBucket: 0 };
    }
  }

  // Fallback: exibe o próprio status (sem forçar backlog/em execução)
  return { label: statusRaw || "—", color: "bg-slate-400", sortBucket: 0 };
}

