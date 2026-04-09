"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Usuário já autenticado continua indo direto para o seu dashboard / portal.
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const allowed = user.allowedFeatures;
    const hasPortal = Array.isArray(allowed) && allowed.includes("portal.corporativo");
    if (user.role === "CLIENTE") router.replace("/cliente");
    else if (hasPortal) router.replace("/portal");
    else if (user.role === "SUPER_ADMIN") router.replace("/admin");
    else if (user.role === "GESTOR_PROJETOS") router.replace("/gestor");
    else router.replace("/consultor");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] flex flex-col">
      <header className="w-full border-b border-[color:var(--border)] bg-[color:var(--surface)]/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-[color:var(--primary)] flex items-center justify-center text-[color:var(--primary-foreground)] font-bold text-sm shadow-md">
              W
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">WPS One</p>
              <p className="text-[11px] text-[color:var(--muted-foreground)] leading-tight">
                Gestão de projetos, horas e SLA em um só lugar.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-1.5 text-sm font-medium text-[color:var(--foreground)] shadow-sm hover:opacity-90 transition"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center lg:py-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)]/70 px-3 py-1 text-xs font-medium text-[color:var(--muted-foreground)]">
              Plataforma para consultorias, PMOs e times de serviço
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl lg:text-5xl">
              Centralize projetos, chamados e horas em uma experiência moderna.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[color:var(--muted-foreground)] sm:text-base">
              O WPS One centraliza o dia a dia de times de serviço: projetos, chamados, tarefas,
              horas apontadas, contratos e indicadores de SLA em um só lugar, com uma experiência
              moderna pensada para uso contínuo.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-md hover:opacity-90 transition"
              >
                Entrar e começar a usar
              </Link>
              <p className="text-xs text-[color:var(--muted-foreground)] max-w-xs">
                Acesso segmentado por tipos de perfil: cada pessoa vê apenas o que precisa, com
                áreas específicas para gestão, operação e clientes.
              </p>
            </div>
            <dl className="grid gap-4 text-sm text-[color:var(--foreground)] sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Gestão de projetos
                </dt>
                <dd className="mt-1 text-sm">
                  Modele projetos internos, Fixed Price, AMS e T&amp;M, com horas contratadas,
                  banco de horas e escopo.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Chamados &amp; tarefas
                </dt>
                <dd className="mt-1 text-sm">
                  Backlog, em execução e finalizados, com status claros, histórico, comentários
                  públicos/internos e anexos.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                  Horas, SLA e relatórios
                </dt>
                <dd className="mt-1 text-sm">
                  Apontamento diário, consumo de horas, SLA por prioridade, relatórios para gestão e
                  faturamento.
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex-1">
            <div className="relative mx-auto max-w-md rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl overflow-hidden">
              <div className="flex h-64">
                {/* Sidebar semelhante ao menu lateral do sistema */}
                <div className="w-24 border-r border-[color:var(--border)] bg-[color:var(--surface)]/60 p-3 flex flex-col gap-2 text-[10px] text-[color:var(--muted-foreground)]">
                  <div className="rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-2 py-1.5 shadow-sm">
                    <p className="text-[9px] opacity-80">Início</p>
                    <p className="text-xs font-semibold">Resumo</p>
                  </div>
                  <div className="rounded-lg px-2 py-1.5 hover:opacity-90">
                    <p className="text-[9px] opacity-80">Projetos</p>
                    <p className="text-xs text-[color:var(--foreground)]">Kanban</p>
                  </div>
                  <div className="rounded-lg px-2 py-1.5 hover:opacity-90">
                    <p className="text-[9px] opacity-80">Chamados</p>
                    <p className="text-xs text-[color:var(--foreground)]">Backlog</p>
                  </div>
                  <div className="rounded-lg px-2 py-1.5 hover:opacity-90">
                    <p className="text-[9px] opacity-80">Relatórios</p>
                    <p className="text-xs text-[color:var(--foreground)]">Horas &amp; SLA</p>
                  </div>
                </div>
                {/* Conteúdo principal simulando a home atual */}
                <div className="flex-1 p-4 space-y-3 bg-[color:var(--surface)]/50">
                  <div className="flex items-center justify-between text-[10px] text-[color:var(--muted-foreground)]">
                    <div>
                      <p className="text-xs font-semibold text-[color:var(--foreground)]">Seu resumo</p>
                      <p>Visão geral de projetos, tarefas e horas.</p>
                    </div>
                    <span className="rounded-full bg-[color:var(--primary)] px-2 py-0.5 text-[10px] text-[color:var(--primary-foreground)]">
                      Semana atual • 03
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm">
                      <p className="text-[color:var(--muted-foreground)]">Horas apontadas</p>
                      <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)] tabular-nums">32,5 h</p>
                      <p className="mt-1 text-[10px] text-[color:var(--muted-foreground)]">Últimos 7 dias.</p>
                    </div>
                    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm">
                      <p className="text-[color:var(--muted-foreground)]">Tarefas</p>
                      <p className="mt-1 text-lg font-semibold text-[color:var(--foreground)] tabular-nums">18</p>
                      <p className="mt-1 text-[10px] text-[color:var(--muted-foreground)]">Backlog, em execução e finalizadas.</p>
                    </div>
                    <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm">
                      <p className="text-[color:var(--muted-foreground)]">SLA clientes</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-600 tabular-nums">90%</p>
                      <p className="mt-1 text-[10px] text-[color:var(--muted-foreground)]">
                        Chamados encerrados dentro do prazo combinado.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-sm">
                    <p className="text-[11px] font-medium text-[color:var(--foreground)]">Chamados do dia</p>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-[color:var(--muted-foreground)]">
                      <div className="rounded px-2 py-1 border border-[color:var(--border)] bg-[color:var(--surface)]/60">
                        <p className="text-[color:var(--muted-foreground)]">Backlog</p>
                        <p className="font-semibold tabular-nums text-[color:var(--foreground)]">6</p>
                      </div>
                      <div className="rounded bg-amber-50 px-2 py-1 border border-amber-100">
                        <p className="text-amber-600">Em execução</p>
                        <p className="font-semibold tabular-nums text-amber-700">4</p>
                      </div>
                      <div className="rounded bg-emerald-50 px-2 py-1 border border-emerald-100">
                        <p className="text-emerald-600">Finalizados</p>
                        <p className="font-semibold tabular-nums text-emerald-700">12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)]/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-xs text-[color:var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WPS One. Todos os direitos reservados.</p>
          <p className="text-[11px]">
            Plataforma focada em consultorias e times de serviço que precisam controlar projetos,
            SLA e horas utilizadas pelos clientes.
          </p>
        </div>
      </footer>
    </div>
  );
}
