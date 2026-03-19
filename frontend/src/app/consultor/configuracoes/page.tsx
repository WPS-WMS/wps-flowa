"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ConsultorConfiguracoesPage() {
  const { user, loading, can } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!can("configuracoes")) {
      router.replace("/consultor");
    }
  }, [loading, user, can, router]);

  if (loading || !user) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Configurações</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Acesse as configurações disponíveis para o seu perfil.
          </p>
        </div>
      </header>
      <main className="flex-1 px-4 md:px-6 py-4 min-h-0 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Nenhuma configuração adicional está disponível para este perfil no momento.
          </div>
        </div>
      </main>
    </div>
  );
}
