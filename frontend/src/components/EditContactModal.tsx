"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type ClientContact = {
  id: string;
  name: string;
  email?: string | null;
  telefone?: string | null;
};

type EditContactModalProps = {
  contact: ClientContact;
  onClose: () => void;
  onSaved: () => void;
};

export function EditContactModal({ contact, onClose, onSaved }: EditContactModalProps) {
  const [name, setName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email || "");
  const [telefone, setTelefone] = useState(contact.telefone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  function formatarTelefone(value: string) {
    const numeros = value.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Record<string, boolean> = {};
    const missingFields: string[] = [];

    if (!name.trim()) {
      errors.name = true;
      missingFields.push("Nome do contato");
    }

    if (Object.keys(errors).length > 0) {
      const errorMessage = `Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(", ")}.`;
      setFieldErrors(errors);
      setError(errorMessage);
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        email: email.trim() || null,
        telefone: telefone.replace(/\D/g, "") || null,
      };

      const res = await apiFetch(`/api/client-contacts/${contact.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao atualizar contato");
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  const getInputClass = (hasError: boolean) => {
    const baseClass = "w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2";
    const errorClass = hasError 
      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
      : "border-slate-200 focus:ring-blue-500 focus:border-blue-500";
    return `${baseClass} ${errorClass}`;
  };
  const labelClass = "block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide";

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/70 w-full max-w-2xl shadow-[0_24px_80px_rgba(15,23,42,0.45)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">Editar contato</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Atualize as informações do contato. O campo marcado é obrigatório.
          </p>
        </div>

        {/* Conteúdo */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          {error ? (
            <div className="px-6 pt-4 pb-2 bg-white">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          ) : null}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto bg-slate-50">
            <div>
              <label className={labelClass}>Nome do contato *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: false }));
                  }
                }}
                className={getInputClass(!!fieldErrors.name)}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={getInputClass(false)}
                placeholder="Ex: joao.silva@empresa.com.br"
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  setTelefone(formatted);
                }}
                className={getInputClass(false)}
                placeholder="Ex: (11) 98765-4321"
                maxLength={15}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-6 py-4 bg-white flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-full bg-blue-600 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
