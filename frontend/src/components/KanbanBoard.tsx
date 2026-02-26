"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, LayoutGrid, FileText, Clock, Calendar, User, Check } from "lucide-react";
import { PackageTicket } from "./PackageCard";
import { CreateTaskModalFull } from "./CreateTaskModalFull";
import { CreateColumnModal } from "./CreateColumnModal";
import { ConfirmModal } from "./ConfirmModal";
import { EditTaskModalFull } from "./EditTaskModalFull";
import { apiFetch } from "@/lib/api";

// Mapeamento de status para as 3 colunas do Kanban
const STATUS_TO_COLUMN: Record<string, string> = {
  ABERTO: "BACKLOG",
  EM_ANALISE: "BACKLOG",
  APROVADO: "BACKLOG",
  EXECUCAO: "EM_EXECUCAO",
  TESTE: "EM_EXECUCAO",
  ENCERRADO: "FINALIZADAS",
};

const DEFAULT_COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "bg-slate-500" },
  { id: "EM_EXECUCAO", label: "Em execução", color: "bg-blue-500" },
  { id: "FINALIZADAS", label: "Finalizadas", color: "bg-emerald-500" },
];

// Estilo do badge de criticidade nos cards
const CRITICIDADE_BADGE: Record<string, string> = {
  Baixa: "bg-blue-100 text-blue-700 border-blue-200",
  BAIXA: "bg-blue-100 text-blue-700 border-blue-200",
  Média: "bg-amber-100 text-amber-700 border-amber-200",
  MEDIA: "bg-amber-100 text-amber-700 border-amber-200",
  Alta: "bg-orange-100 text-orange-700 border-orange-200",
  ALTA: "bg-orange-100 text-orange-700 border-orange-200",
  Urgente: "bg-red-100 text-red-700 border-red-200",
  URGENTE: "bg-red-100 text-red-700 border-red-200",
};
// Cor da barra lateral do card (borda esquerda)
const CRITICIDADE_BORDER: Record<string, string> = {
  Baixa: "border-l-blue-500",
  BAIXA: "border-l-blue-500",
  Média: "border-l-amber-500",
  MEDIA: "border-l-amber-500",
  Alta: "border-l-orange-500",
  ALTA: "border-l-orange-500",
  Urgente: "border-l-red-500",
  URGENTE: "border-l-red-500",
};
function getCriticidadeBadgeClass(criticidade: string | null | undefined): string {
  if (!criticidade) return "bg-slate-100 text-slate-600 border-slate-200";
  return CRITICIDADE_BADGE[criticidade] ?? "bg-slate-100 text-slate-600 border-slate-200";
}
function getCriticidadeBorderClass(criticidade: string | null | undefined): string {
  if (!criticidade) return "border-l-slate-300";
  return CRITICIDADE_BORDER[criticidade] ?? "border-l-slate-300";
}

// Cor do círculo de prioridade no card (estilo referência)
function getPriorityDotClass(criticidade: string | null | undefined): string {
  if (!criticidade) return "bg-slate-400";
  const map: Record<string, string> = {
    Urgente: "bg-red-500", URGENTE: "bg-red-500",
    Alta: "bg-orange-500", ALTA: "bg-orange-500",
    Média: "bg-amber-500", MEDIA: "bg-amber-500",
    Baixa: "bg-blue-500", BAIXA: "bg-blue-500",
  };
  return map[criticidade] ?? "bg-slate-400";
}

// Fundo da coluna por tipo (Backlog neutro, Em execução azul, Finalizadas verde)
function getColumnBodyBg(columnId: string): string {
  if (columnId === "BACKLOG") return "bg-slate-100/40";
  if (columnId === "EM_EXECUCAO") return "bg-blue-50/70";
  if (columnId === "FINALIZADAS") return "bg-emerald-50/70";
  return "bg-slate-50/50";
}

function formatDateShort(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const d = new Date(value);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return null;
  }
}

type Column = {
  id: string;
  label: string;
  color: string;
};

type KanbanBoardProps = {
  tickets: PackageTicket[];
  projectId: string;
  parentTicketId?: string;
  initialCreateStatus?: string | null;
  onCreateModalClose?: () => void;
  onTicketClick?: (ticket: PackageTicket) => void;
  onTicketDelete?: (ticket: PackageTicket) => void;
  onTicketCreated?: () => void;
};

export function KanbanBoard({
  tickets,
  projectId,
  parentTicketId,
  initialCreateStatus,
  onCreateModalClose,
  onTicketClick,
  onTicketDelete,
  onTicketCreated,
}: KanbanBoardProps) {
  const [createModalStatus, setCreateModalStatus] = useState<string | null>(null);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [customColumns, setCustomColumns] = useState<Column[]>([]);
  const [deleteTicketTarget, setDeleteTicketTarget] = useState<PackageTicket | null>(null);
  const [deleteColumnTarget, setDeleteColumnTarget] = useState<string | null>(null);
  const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<PackageTicket | null>(null);
  const [hoursByTicket, setHoursByTicket] = useState<Record<string, number>>({});
  const [topicsMap, setTopicsMap] = useState<Record<string, string>>({});

  // Abrir modal de nova tarefa quando o header "+ Novo Card" for clicado
  useEffect(() => {
    if (initialCreateStatus) setCreateModalStatus(initialCreateStatus);
  }, [initialCreateStatus]);

  // Carrega colunas customizadas do localStorage
  useEffect(() => {
    const storageKey = `kanban_columns_${projectId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomColumns(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCustomColumns([]);
      }
    }
  }, [projectId]);

  // Buscar tópicos do projeto para mapear parentTicketId -> nome do tópico
  useEffect(() => {
    if (!projectId) {
      setTopicsMap({});
      return;
    }

    apiFetch(`/api/tickets?projectId=${projectId}`)
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((allTickets: PackageTicket[]) => {
        const topics: Record<string, string> = {};
        allTickets
          .filter((t) => t.type === "SUBPROJETO")
          .forEach((topic) => {
            topics[topic.id] = topic.title;
          });
        setTopicsMap(topics);
      })
      .catch((err) => {
        console.error("Erro ao buscar tópicos:", err);
        setTopicsMap({});
      });
  }, [projectId]);

  // Buscar horas apontadas para cada ticket
  useEffect(() => {
    if (tickets.length === 0) {
      setHoursByTicket({});
      return;
    }

    const fetchHours = async () => {
      const hoursMap: Record<string, number> = {};
      
      // Buscar horas para cada ticket em paralelo
      const promises = tickets.map(async (ticket) => {
        try {
          const res = await apiFetch(`/api/time-entries?ticketId=${ticket.id}`);
          if (res.ok) {
            const entries = await res.json();
            const total = entries.reduce((sum: number, e: any) => sum + (e.totalHoras || 0), 0);
            hoursMap[ticket.id] = total;
          }
        } catch (err) {
          console.error(`Erro ao buscar horas do ticket ${ticket.id}:`, err);
          hoursMap[ticket.id] = 0;
        }
      });

      await Promise.all(promises);
      setHoursByTicket(hoursMap);
    };

    void fetchHours();
  }, [tickets]);

  // Combina colunas padrão com customizadas
  const allColumns: Column[] = [...DEFAULT_COLUMNS, ...customColumns];

  // Salva colunas customizadas no localStorage
  const saveCustomColumns = (columns: Column[]) => {
    const storageKey = `kanban_columns_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(columns));
    setCustomColumns(columns);
  };

  // Adiciona uma nova coluna customizada
  const handleColumnCreated = (newColumn: Column) => {
    const updated = [...customColumns, newColumn];
    saveCustomColumns(updated);
  };

  // Remove uma coluna customizada
  const handleDeleteColumn = (columnId: string) => {
    setDeleteColumnTarget(columnId);
  };
  
  const confirmDeleteColumn = async () => {
    if (!deleteColumnTarget) return;
    
    const updated = customColumns.filter((c) => c.id !== deleteColumnTarget);
    saveCustomColumns(updated);
    
    // Move tarefas desta coluna para BACKLOG (ABERTO)
    const ticketsToMove = tickets.filter((t) => t.status === deleteColumnTarget);
    for (const ticket of ticketsToMove) {
      try {
        await apiFetch(`/api/tickets/${ticket.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ABERTO" }),
        });
      } catch (err) {
        console.error(`Erro ao mover ticket ${ticket.id}:`, err);
      }
    }
    
    setDeleteColumnTarget(null);
    onTicketCreated?.();
  };
  
  // Agrupa tickets por coluna baseado no mapeamento de status
  const ticketsByColumn = allColumns.reduce(
    (acc, col) => {
      // Para colunas padrão, usa o mapeamento STATUS_TO_COLUMN
      // Para colunas customizadas, usa o ID da coluna diretamente como status
      if (DEFAULT_COLUMNS.some((dc) => dc.id === col.id)) {
        acc[col.id] = tickets.filter((t) => STATUS_TO_COLUMN[t.status] === col.id);
      } else {
        acc[col.id] = tickets.filter((t) => t.status === col.id);
      }
      return acc;
    },
    {} as Record<string, PackageTicket[]>
  );

  const getStatusForColumn = (columnId: string, currentStatus: string = "ABERTO"): string => {
    // Colunas customizadas usam o próprio ID como status
    if (!DEFAULT_COLUMNS.some((dc) => dc.id === columnId)) {
      return columnId;
    }

    if (columnId === "BACKLOG") {
      return "ABERTO";
    }
    if (columnId === "EM_EXECUCAO") {
      return "EXECUCAO";
    }
    if (columnId === "FINALIZADAS") {
      return "ENCERRADO";
    }

    // Fallback para não quebrar caso futuramente existam outras colunas padrão
    return currentStatus;
  };

  const handleDropTicket = async (columnId: string) => {
    if (!draggingTicketId) return;
    const ticket = tickets.find((t) => t.id === draggingTicketId);
    if (!ticket) {
      setDraggingTicketId(null);
      return;
    }

    const newStatus = getStatusForColumn(columnId, ticket.status);

    // Se o status não mudou, não faz nada
    if (!newStatus || newStatus === ticket.status) {
      setDraggingTicketId(null);
      return;
    }

    try {
      await apiFetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onTicketCreated?.();
    } catch (err) {
      console.error("Erro ao mover tarefa no kanban:", err);
      alert("Não foi possível mover a tarefa. Verifique se o backend está rodando.");
    } finally {
      setDraggingTicketId(null);
    }
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 pt-1" style={{ scrollbarGutter: "stable" }}>
      {allColumns.map((column) => {
        const isCustomColumn = !DEFAULT_COLUMNS.some((dc) => dc.id === column.id);
        const columnTickets = ticketsByColumn[column.id] || [];
        const isDropTarget = draggingTicketId && columnTickets.every((t) => t.id !== draggingTicketId);
        const isFinalizadas = column.id === "FINALIZADAS";
        const columnHeaderBg =
          column.id === "BACKLOG"
            ? "bg-slate-50"
            : column.id === "EM_EXECUCAO"
            ? "bg-blue-50/80"
            : column.id === "FINALIZADAS"
            ? "bg-emerald-50/80"
            : "bg-slate-50/80";

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-[280px] rounded-xl border overflow-hidden shadow-sm transition-shadow ${
              column.id === "BACKLOG"
                ? "bg-slate-50 border-slate-200"
                : column.id === "EM_EXECUCAO"
                ? "bg-blue-50/30 border-blue-100"
                : column.id === "FINALIZADAS"
                ? "bg-emerald-50/30 border-emerald-100"
                : "bg-white border-slate-200"
            } ${draggingTicketId ? "shadow-md" : ""}`}
          >
            {/* Cabeçalho da coluna - estilo referência */}
            <div className={`${columnHeaderBg} border-b border-slate-200/80 px-4 py-3`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isFinalizadas && (
                    <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" aria-hidden />
                  )}
                  <h3 className="text-sm font-semibold text-slate-800 truncate">
                    {column.label}
                  </h3>
                  <span className="flex-shrink-0 text-xs font-medium text-slate-500">
                    ({columnTickets.length})
                  </span>
                  {isCustomColumn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteColumn(column.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Excluir coluna"
                      aria-label="Excluir coluna"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const statusToCreate = getStatusForColumn(column.id);
                    setCreateModalStatus(statusToCreate);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Nova tarefa"
                  aria-label="Nova tarefa"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div
                className={`p-3 space-y-3 min-h-[180px] max-h-[calc(100vh-320px)] overflow-y-auto transition-colors ${getColumnBodyBg(column.id)} ${
                  isDropTarget ? "ring-1 ring-inset ring-blue-200" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  void handleDropTicket(column.id);
                }}
              >
                {columnTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-slate-400">Nenhuma tarefa</p>
                    <p className="text-xs text-slate-400 mt-0.5">Arraste cards aqui ou crie uma nova</p>
                  </div>
                ) : (
                  columnTickets.map((ticket) => {
                    const isDragging = draggingTicketId === ticket.id;
                    const dateStr = formatDateShort(ticket.dataFimPrevista);
                    const estimativaHoras = ticket.estimativaHoras != null ? ticket.estimativaHoras : null;
                    const horasApontadas = hoursByTicket[ticket.id] ?? 0;
                    return (
                      <div
                        key={ticket.id}
                        className={`relative rounded-xl bg-white border border-slate-200 p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                          isDragging
                            ? "opacity-50 scale-[0.98] shadow-lg ring-2 ring-blue-300"
                            : "hover:shadow-md hover:border-slate-300"
                        }`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", ticket.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggingTicketId(ticket.id);
                        }}
                        onDragEnd={() => setDraggingTicketId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onTicketClick?.(ticket);
                            setEditingTicket(ticket);
                          }}
                          className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-lg pr-8"
                        >
                          {/* Primeira linha: ID + nome da tarefa */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-semibold text-slate-600 shrink-0">#{ticket.code}</span>
                            <span className="text-sm font-semibold text-slate-800 line-clamp-2 truncate" title={ticket.title}>
                              {ticket.title}
                            </span>
                          </div>
                          {/* Segunda linha: prioridade (bolinha + nome) — só se tiver prioridade */}
                          {ticket.criticidade != null && ticket.criticidade !== "" && (
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getPriorityDotClass(ticket.criticidade)}`}
                                aria-hidden
                              />
                              <span className="text-xs font-medium text-slate-700">{ticket.criticidade}</span>
                            </div>
                          )}
                          {/* Linha: tópico/tipo, Orçado/Executado, data, responsável */}
                          <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500">
                            {ticket.parentTicketId && topicsMap[ticket.parentTicketId] ? (
                              <span className="inline-flex items-center gap-1" title={topicsMap[ticket.parentTicketId]}>
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                <span className="truncate max-w-[150px]">{topicsMap[ticket.parentTicketId]}</span>
                              </span>
                            ) : ticket.type ? (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                {ticket.type}
                              </span>
                            ) : null}
                            {(estimativaHoras != null || horasApontadas > 0) && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {estimativaHoras != null && horasApontadas > 0 ? (
                                  <span>Orçado {estimativaHoras}h · Executado {horasApontadas.toFixed(1)}h</span>
                                ) : estimativaHoras != null ? (
                                  <span>Orçado {estimativaHoras}h</span>
                                ) : (
                                  <span>Executado {horasApontadas.toFixed(1)}h</span>
                                )}
                              </span>
                            )}
                            {dateStr && (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {dateStr}
                              </span>
                            )}
                            {ticket.assignedTo && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[100px]" title={ticket.assignedTo.name}>
                                <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{ticket.assignedTo.name}</span>
                              </span>
                            )}
                          </div>
                        </button>
                        {onTicketDelete && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTicketTarget(ticket);
                            }}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Excluir tarefa"
                            aria-label="Excluir tarefa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Botão para adicionar nova coluna */}
      <div className="flex-shrink-0 w-[280px]">
        <button
          type="button"
          onClick={() => setShowCreateColumnModal(true)}
          className="w-full h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-600 group"
        >
          <div className="rounded-full bg-slate-200/80 p-3 group-hover:bg-blue-100 transition-colors">
            <LayoutGrid className="h-6 w-6 text-slate-500 group-hover:text-blue-600" />
          </div>
          <span className="text-sm font-semibold">Nova coluna</span>
          <span className="text-xs text-slate-400 group-hover:text-blue-500">Adicione um status personalizado</span>
        </button>
      </div>
      
      {createModalStatus && (
        <CreateTaskModalFull
          projectId={projectId}
          initialStatus={createModalStatus}
          parentTicketId={parentTicketId}
          onClose={() => {
            setCreateModalStatus(null);
            onCreateModalClose?.();
          }}
          onSaved={() => {
            setCreateModalStatus(null);
            onCreateModalClose?.();
            onTicketCreated?.();
          }}
        />
      )}
      
      {showCreateColumnModal && (
        <CreateColumnModal
          projectId={projectId}
          onClose={() => setShowCreateColumnModal(false)}
          onSaved={(newColumn) => {
            handleColumnCreated(newColumn);
            setShowCreateColumnModal(false);
          }}
        />
      )}
      
      {deleteTicketTarget && (
        <ConfirmModal
          title="Excluir tarefa"
          message={`Tem certeza que deseja excluir a tarefa "${deleteTicketTarget.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={() => {
            onTicketDelete?.(deleteTicketTarget);
            setDeleteTicketTarget(null);
          }}
          onCancel={() => setDeleteTicketTarget(null)}
        />
      )}
      
      {deleteColumnTarget && (
        <ConfirmModal
          title="Excluir coluna"
          message="Tem certeza que deseja excluir esta coluna? As tarefas nesta coluna serão movidas para Backlog."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmDeleteColumn}
          onCancel={() => setDeleteColumnTarget(null)}
        />
      )}

      {editingTicket && (
        <EditTaskModalFull
          ticket={editingTicket}
          projectId={projectId}
          onClose={() => setEditingTicket(null)}
          onSaved={() => {
            setEditingTicket(null);
            onTicketCreated?.();
          }}
        />
      )}
    </div>
  );
}
