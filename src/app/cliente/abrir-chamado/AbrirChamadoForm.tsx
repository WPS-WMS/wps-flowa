"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
};

export function AbrirChamadoForm({
  clients,
  tipos,
  criticidades,
}: {
  clients: Client[];
  tipos: string[];
  criticidades: string[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [criticidade, setCriticidade] = useState("");
  const [tipo, setTipo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find((c) => c.id === clientId);
  const projects = selectedClient?.projects ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!projectId || !tipo || !description.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: description.slice(0, 100),
          description: description,
          type: tipo,
          criticidade: criticidade || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar chamado");
        return;
      }
      router.push("/cliente");
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-medium text-white mb-4">Abrir chamado</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId("");
            }}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">Selecione</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Projeto</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            required
          >
            <option value="">Selecione</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            required
          >
            <option value="">Selecione (ex: Suporte em PRD, melhoria, dúvida)</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Criticidade</label>
          <select
            value={criticidade}
            onChange={(e) => setCriticidade(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="">Selecione</option>
            {criticidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Descreva o chamado com o máximo de detalhes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            placeholder="Descreva detalhadamente o problema ou solicitação..."
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Anexar (em breve)</label>
          <div className="px-4 py-2 bg-slate-800 border border-dashed border-slate-600 rounded-lg text-slate-500 text-sm">
            Funcionalidade de anexos em desenvolvimento
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-medium disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
