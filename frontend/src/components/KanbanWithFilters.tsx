"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { X, Filter, ChevronDown, ChevronLeft } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { PackageTicket } from "./PackageCard";
import { apiFetch } from "@/lib/api";

// Prioridades fixas para o filtro (com bolinha colorida)
const PRIORIDADES_FILTRO = ["Baixa", "Média", "Alta", "Urgente"] as const;

function getPrioridadeDotClass(prioridade: string): string {
  if (!prioridade) return "bg-slate-400";
  const map: Record<string, string> = {
    Urgente: "bg-red-500", URGENTE: "bg-red-500",
    Alta: "bg-orange-500", ALTA: "bg-orange-500",
    Média: "bg-amber-500", MEDIA: "bg-amber-500",
    Baixa: "bg-blue-500", BAIXA: "bg-blue-500",
  };
  return map[prioridade] ?? "bg-slate-400";
}

// Converte a cor da coluna (ex: bg-slate-500) para uma versão de fundo mais clara
function getStatusBgClass(color: string): string {
  if (color.includes("slate")) return "bg-slate-100";
  if (color.includes("blue")) return "bg-blue-100";
  if (color.includes("emerald")) return "bg-emerald-100";
  if (color.includes("green")) return "bg-green-100";
  if (color.includes("red")) return "bg-red-100";
  if (color.includes("orange")) return "bg-orange-100";
  if (color.includes("amber")) return "bg-amber-100";
  if (color.includes("purple")) return "bg-purple-100";
  if (color.includes("pink")) return "bg-pink-100";
  if (color.includes("indigo")) return "bg-indigo-100";
  if (color.includes("cyan")) return "bg-cyan-100";
  if (color.includes("teal")) return "bg-teal-100";
  if (color.includes("lime")) return "bg-lime-100";
  if (color.includes("yellow")) return "bg-yellow-100";
  return "bg-slate-100";
}

type KanbanWithFiltersProps = {
  tickets: PackageTicket[];
  projectId: string;
  openNewCard?: boolean;
  onCloseNewCard?: () => void;
  onBack?: () => void;
  onTicketClick?: (ticket: PackageTicket) => void;
  onTicketDelete?: (ticket: PackageTicket) => void;
  onTicketCreated?: () => void;
  onClose?: () => void;
};

export function KanbanWithFilters({
  tickets,
  projectId,
  openNewCard = false,
  onCloseNewCard,
  onBack,
  onTicketClick,
  onTicketDelete,
  onTicketCreated,
  onClose,
}: KanbanWithFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterSubproject, setFilterSubproject] = useState<string>("");
  const [filterTicketId, setFilterTicketId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>(""); // Agora será o ID da coluna (BACKLOG, EM_EXECUCAO, FINALIZADAS ou ID de coluna customizada)
  const [filterType, setFilterType] = useState<string>("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("");
  const [filterAssignedTo, setFilterAssignedTo] = useState<string>("");
  const [customColumns, setCustomColumns] = useState<Array<{ id: string; label: string; color: string }>>([]);
  const [showPrioridadeOpen, setShowPrioridadeOpen] = useState(false);
  const [showStatusOpen, setShowStatusOpen] = useState(false);
  const prioridadeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (prioridadeDropdownRef.current && !prioridadeDropdownRef.current.contains(e.target as Node)) {
        setShowPrioridadeOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusOpen(false);
      }
    }
    if (showPrioridadeOpen || showStatusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPrioridadeOpen, showStatusOpen]);

  // Filtra apenas tarefas, excluindo tópicos (SUBPROJETO) e subtarefas (SUBTAREFA)
  const tasksOnly = useMemo(() => {
    return tickets.filter((t) => t.type !== "SUBPROJETO" && t.type !== "SUBTAREFA");
  }, [tickets]);

  // Extrai tópicos disponíveis do projeto para filtrar tarefas
  const [subprojects, setSubprojects] = useState<Array<{ id: string; code: string; title: string }>>([]);
  
  // Carrega colunas customizadas do localStorage (igual ao KanbanBoard)
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
  
  useEffect(() => {
    // Busca todos os tópicos do projeto
    apiFetch(`/api/tickets?projectId=${projectId}`)
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error("Erro ao carregar tópicos");
      })
      .then((allTickets: PackageTicket[]) => {
        const subs = allTickets
          .filter((t) => t.type === "SUBPROJETO")
          .map((t) => ({ id: t.id, code: t.code, title: t.title }));
        setSubprojects(subs);
      })
      .catch((err) => {
        console.error("Erro ao carregar tópicos:", err);
      });
  }, [projectId]);

  // Mapeamento de status para colunas (igual ao KanbanBoard)
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

  // Opções de Status baseadas nas colunas (padrão + customizadas), com cor da coluna
  const statusOptions = useMemo(() => {
    const allColumns = [...DEFAULT_COLUMNS, ...customColumns];
    return allColumns.map((col) => ({ id: col.id, label: col.label, color: col.color }));
  }, [customColumns]);

  const types = useMemo(() => {
    const unique = new Set<string>();
    tasksOnly.forEach((t) => {
      if (t.type && t.type !== "SUBPROJETO") unique.add(t.type);
    });
    return Array.from(unique).sort();
  }, [tasksOnly]);

  const assignedToUsers = useMemo(() => {
    const unique = new Map<string, string>();
    tasksOnly.forEach((t) => {
      if (t.assignedTo) {
        unique.set(t.assignedTo.id, t.assignedTo.name);
      }
    });
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [tasksOnly]);

  // Filtra os tickets baseado nos filtros aplicados (apenas tarefas, não tópicos)
  const filteredTickets = useMemo(() => {
    return tasksOnly.filter((ticket) => {
      // Filtro por tópico: usa parentTicketId
      if (filterSubproject && ticket.parentTicketId !== filterSubproject) return false;
      if (filterTicketId && !ticket.code.toLowerCase().includes(filterTicketId.toLowerCase()) && !ticket.id.toLowerCase().includes(filterTicketId.toLowerCase())) return false;
      
      // Filtro por Status (coluna do Kanban)
      if (filterStatus) {
        const isCustomColumn = !DEFAULT_COLUMNS.some((dc) => dc.id === filterStatus);
        if (isCustomColumn) {
          // Coluna customizada: compara diretamente com o status da tarefa
          if (ticket.status !== filterStatus) return false;
        } else {
          // Coluna padrão: usa o mapeamento STATUS_TO_COLUMN
          const ticketColumn = STATUS_TO_COLUMN[ticket.status] || "";
          if (ticketColumn !== filterStatus) return false;
        }
      }
      
      if (filterType && ticket.type !== filterType) return false;
      if (filterPrioridade) {
        const t = (ticket.criticidade || "").trim();
        if (!t) return false;
        const norm = (s: string) => {
          const u = s.toUpperCase();
          if (u === "BAIXA") return "Baixa";
          if (u === "MEDIA" || u === "MÉDIA") return "Média";
          if (u === "ALTA") return "Alta";
          if (u === "URGENTE") return "Urgente";
          return s;
        };
        if (norm(t) !== filterPrioridade) return false;
      }
      if (filterAssignedTo && ticket.assignedTo?.id !== filterAssignedTo) return false;
      return true;
    });
  }, [tasksOnly, filterSubproject, filterTicketId, filterStatus, filterType, filterPrioridade, filterAssignedTo]);

  const hasActiveFilters =
    filterSubproject || filterTicketId || filterStatus || filterType || filterPrioridade || filterAssignedTo;

  const clearFilters = () => {
    setFilterSubproject("");
    setFilterTicketId("");
    setFilterStatus("");
    setFilterType("");
    setFilterPrioridade("");
    setFilterAssignedTo("");
  };

  return (
    <div className="w-full">
      {/* Barra de filtros */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-0.5 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-white/20">
                {[filterSubproject, filterTicketId, filterStatus, filterType, filterPrioridade, filterAssignedTo].filter(Boolean).length}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Fechar Kanban"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Painel de filtros expandido */}
      {showFilters && (
        <div className="mb-5 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtro por Tópico */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tópico</label>
              <select
                value={filterSubproject}
                onChange={(e) => setFilterSubproject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="">Todos</option>
                {subprojects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por ID da Tarefa */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">ID da Tarefa</label>
              <input
                type="text"
                value={filterTicketId}
                onChange={(e) => setFilterTicketId(e.target.value)}
                placeholder="Ex: 338, 339..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            {/* Filtro por Status (colunas do Kanban, com fundo colorido) */}
            <div ref={statusDropdownRef} className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <button
                type="button"
                onClick={() => setShowStatusOpen((v) => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-left ${
                  filterStatus
                    ? (() => {
                        const col = statusOptions.find((c) => c.id === filterStatus);
                        return col ? `${getStatusBgClass(col.color)} text-slate-800` : "bg-white text-slate-800";
                      })()
                    : "bg-white text-slate-800"
                }`}
              >
                {filterStatus ? (
                  (() => {
                    const col = statusOptions.find((c) => c.id === filterStatus);
                    return col ? <span>{col.label}</span> : <span>{filterStatus}</span>;
                  })()
                ) : (
                  <span className="text-slate-500">Todos</span>
                )}
                <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0 text-slate-400" />
              </button>
              {showStatusOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus("");
                      setShowStatusOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Todos
                  </button>
                  {statusOptions.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        setFilterStatus(col.id);
                        setShowStatusOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm ${getStatusBgClass(col.color)} ${
                        filterStatus === col.id ? "ring-2 ring-blue-400" : ""
                      } text-slate-800 hover:opacity-80`}
                    >
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="">Todos</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Prioridade (bolinha + cor) */}
            <div ref={prioridadeDropdownRef} className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Prioridade</label>
              <button
                type="button"
                onClick={() => setShowPrioridadeOpen((v) => !v)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-left"
              >
                {filterPrioridade ? (
                  <>
                    <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getPrioridadeDotClass(filterPrioridade)}`} aria-hidden />
                    <span>{filterPrioridade}</span>
                  </>
                ) : (
                  <span className="text-slate-500">Todas</span>
                )}
                <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0 text-slate-400" />
              </button>
              {showPrioridadeOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterPrioridade("");
                      setShowPrioridadeOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Todas
                  </button>
                  {PRIORIDADES_FILTRO.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setFilterPrioridade(p);
                        setShowPrioridadeOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm ${filterPrioridade === p ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getPrioridadeDotClass(p)}`} aria-hidden />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filtro por Responsável */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Responsável</label>
              <select
                value={filterAssignedTo}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="">Todos</option>
                {assignedToUsers.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Informação sobre resultados filtrados */}
      {hasActiveFilters && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-800">{filteredTickets.length}</span> de <span className="font-semibold text-slate-800">{tasksOnly.length}</span> tarefa(s)
        </div>
      )}

      {/* Kanban Board */}
      <KanbanBoard
        tickets={filteredTickets}
        projectId={projectId}
        initialCreateStatus={openNewCard ? "ABERTO" : null}
        onCreateModalClose={onCloseNewCard}
        onTicketClick={onTicketClick}
        onTicketDelete={onTicketDelete}
        onTicketCreated={onTicketCreated}
      />
    </div>
  );
}
