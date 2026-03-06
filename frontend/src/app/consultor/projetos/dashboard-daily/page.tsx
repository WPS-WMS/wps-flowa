"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Search, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { KanbanWithFilters } from "@/components/KanbanWithFilters";
import { type PackageTicket } from "@/components/PackageCard";
import { type ProjectForCard } from "@/components/ProjectCard";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardDailyConsultorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Gestor de Projetos deve usar a versão de admin do Dashboard Daily (mesmo layout)
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role === "GESTOR_PROJETOS") {
      router.replace("/admin/projetos/dashboard-daily");
    }
  }, [user, loading, router]);

  const [projects, setProjects] = useState<ProjectForCard[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [topics, setTopics] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [tickets, setTickets] = useState<PackageTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProjects = () => {
    setLoading(true);
    apiFetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar projetos");
        return r.json();
      })
      .then((data: ProjectForCard[]) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar projetos:", err);
        setLoading(false);
      });
  };

  // Carregar projetos
  useEffect(() => {
    loadProjects();
  }, []);

  // Carregar tópicos quando projeto é selecionado
  useEffect(() => {
    if (!selectedProjectId) {
      setTopics([]);
      setTickets([]);
      return;
    }

    apiFetch(`/api/tickets?projectId=${selectedProjectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Erro ao carregar tópicos");
        return r.json();
      })
      .then((allTickets: PackageTicket[]) => {
        // Extrair tópicos (SUBPROJETO)
        const topicList = allTickets
          .filter((t) => t.type === "SUBPROJETO")
          .map((t) => ({ id: t.id, code: t.code, title: t.title }));
        setTopics(topicList);

        // Carregar todas as tarefas do projeto (excluindo tópicos e subtarefas)
        const tasksOnly = allTickets.filter((t) => t.type !== "SUBPROJETO" && t.type !== "SUBTAREFA");
        setTickets(tasksOnly);
      })
      .catch((err) => {
        console.error("Erro ao carregar tópicos:", err);
      });
  }, [selectedProjectId]);

  // Filtrar tarefas por tópico se selecionado
  const filteredTickets = selectedTopicId
    ? tickets.filter((t) => t.parentTicketId === selectedTopicId)
    : tickets;

  // Filtrar por busca
  const filteredBySearch = searchQuery.trim()
    ? filteredTickets.filter(
        (t) =>
          t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredTickets;

  const refetchTickets = async () => {
    if (!selectedProjectId) return;
    const res = await apiFetch(`/api/tickets?projectId=${selectedProjectId}`);
    if (res.ok) {
      const allTickets: PackageTicket[] = await res.json();
      const tasksOnly = allTickets.filter((t) => t.type !== "SUBPROJETO" && t.type !== "SUBTAREFA");
      setTickets(tasksOnly);
    }
  };

  const handleDeleteTicket = async (ticket: PackageTicket) => {
    try {
      const res = await apiFetch(`/api/tickets/${ticket.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        await refetchTickets();
      } else {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          alert(data?.error ?? "Erro ao excluir tarefa.");
        } else {
          alert("Erro ao excluir tarefa.");
        }
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir tarefa. Verifique se o backend está rodando.");
    }
  };

  // Enquanto estiver carregando ou redirecionando gestor de projetos, mostra apenas loader simples
  if (loading || user?.role === "GESTOR_PROJETOS") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100">
      {/* Cabeçalho azul */}
      <header className="flex-shrink-0 bg-blue-600 px-6 py-4 flex items-center gap-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white truncate">Dashboard Daily</h1>
        </div>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar"
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/15 border border-white/20 text-white placeholder:text-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            />
          </div>
        </div>
      </header>

      {/* Filtros de projeto e tópico */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Projeto</label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedTopicId(""); // Reset tópico ao mudar projeto
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="">Selecione um projeto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.client?.name ?? "—"} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={loadProjects}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar projetos
          </button>
          {selectedProjectId && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tópico</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="">Todos os tópicos</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Kanban */}
      <main className="flex-1 p-4 md:p-6 min-h-0 overflow-auto">
        {selectedProjectId ? (
          <div className="w-full">
            <KanbanWithFilters
              tickets={filteredBySearch}
              projectId={selectedProjectId}
              onTicketClick={() => {}}
              onTicketDelete={handleDeleteTicket}
              onTicketCreated={refetchTickets}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">Selecione um projeto para visualizar o Kanban</p>
          </div>
        )}
      </main>
    </div>
  );
}
