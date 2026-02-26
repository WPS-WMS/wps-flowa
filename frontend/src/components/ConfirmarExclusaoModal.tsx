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
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200/70 w-full max-w-md shadow-[0_24px_80px_rgba(15,23,42,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirmar exclusão</h3>
          <p className="text-sm text-slate-600 mb-6">
            Tem certeza que deseja excluir <strong>{userName}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-red-600 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
