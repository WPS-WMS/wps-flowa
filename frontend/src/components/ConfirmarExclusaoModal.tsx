"use client";

import { useState } from "react";

type ConfirmarExclusaoModalProps = {
  userName: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmarExclusaoModal({
  userName,
  onClose,
  onConfirm,
}: ConfirmarExclusaoModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--surface)] rounded-2xl border border-[color:var(--border)] w-full max-w-md shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-2">Confirmar exclusão</h3>
          <p className="text-sm text-[color:var(--muted-foreground)] mb-6">
            Tem certeza que deseja excluir <strong className="text-[color:var(--foreground)]">{userName}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm font-medium text-[color:var(--foreground)] hover:opacity-90 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
