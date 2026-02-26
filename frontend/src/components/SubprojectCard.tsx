"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export type SubprojectTicket = {
  id: string;
  code: string;
  title: string;
  status: string;
  dataFimPrevista?: string | null;
  assignedTo?: { id: string; name: string } | null;
  responsibles?: { user: { id: string; name: string } }[];
};

type SubprojectCardProps = {
  ticket: SubprojectTicket;
  projectId: string;
  projectName?: string;
  onDelete: (ticket: SubprojectTicket) => void;
  onClick?: (ticket: SubprojectTicket) => void;
  userRole?: "CONSULTOR" | "ADMIN" | "GESTOR_PROJETOS";
};

function getTarefasFinalizadas(ticket: SubprojectTicket): { total: number; finalizadas: number } {
  const total = 1; // cada tópico conta como 1 tarefa (indicador derivado)
  const finalizadas = ticket.status === "ENCERRADO" ? 1 : 0;
  return { total, finalizadas };
}

function getTarefasAtrasadas(ticket: SubprojectTicket): number {
  if (!ticket.dataFimPrevista || ticket.status === "ENCERRADO") return 0;
  const fim = new Date(ticket.dataFimPrevista);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);
  return fim < hoje ? 1 : 0;
}

export function SubprojectCard({ ticket, projectId, projectName, onDelete, onClick, userRole }: SubprojectCardProps) {
  const router = useRouter();
  const { total, finalizadas } = getTarefasFinalizadas(ticket);
  const atrasadas = getTarefasAtrasadas(ticket);
  const percent = total > 0 ? Math.round((finalizadas / total) * 100) : 0;

  const responsibles = ticket.responsibles?.map((r) => r.user) ?? [];
  const displayResponsible = ticket.assignedTo ?? responsibles[0];

  const handleCardClick = () => {
    if (onClick) {
      onClick(ticket);
      return;
    }
    
    // Redirecionar para a página de kanban da subtarefa
    // Tenta determinar o caminho base baseado no userRole ou usa /consultor como padrão
    const basePath = userRole === "ADMIN" ? "/admin" : "/consultor";
    router.push(`${basePath}/projetos/${projectId}/subprojetos/${ticket.id}`);
  };

  return (
    <div 
      className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-4 flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-slate-800" title={ticket.title}>
            {ticket.title}
          </h4>
          {projectName && (
            <p className="text-sm font-normal text-slate-500 mt-0.5 truncate" title={projectName}>
              {projectName}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ticket);
          }}
          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
          title="Excluir tópico"
          aria-label="Excluir tópico"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Indicadores automáticos (derivados das tarefas) */}
      <div className="space-y-2 text-sm">
        <div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-slate-500 mt-1">
            {finalizadas} / {total} tarefas finalizadas (calculado)
          </p>
        </div>
        <p className={atrasadas > 0 ? "text-amber-600 font-medium" : "text-slate-500"}>
          {atrasadas} {atrasadas === 1 ? "tarefa atrasada" : "tarefas atrasadas"}
        </p>
      </div>

      {displayResponsible && (
        <p className="text-xs text-slate-500 mt-3 truncate" title={displayResponsible.name}>
          Responsável: {displayResponsible.name}
        </p>
      )}

    </div>
  );
}
