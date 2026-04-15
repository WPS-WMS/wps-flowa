"use client";

import { useCallback, useState } from "react";
import { FileText, Download, ExternalLink } from "lucide-react";
import { type ProjectForCard } from "@/components/ProjectCard";
import { apiFetch, API_BASE_URL } from "@/lib/api";

function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tipoArquivoLabel(tipo: string | null | undefined): string {
  if (!tipo?.trim()) return "";
  const t = tipo.toLowerCase();
  if (t.includes("pdf")) return "PDF";
  if (t.includes("wordprocessingml") || t.includes("docx")) return "DOCX";
  return tipo;
}

function getAttachmentFullUrl(anexoUrl: string | null | undefined): string | null {
  const u = anexoUrl?.trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${API_BASE_URL}${u.startsWith("/") ? u : `/${u}`}`;
}

type Props = {
  project: ProjectForCard;
};

export function ProjectPropostaComercialReadonly({ project }: Props) {
  const hasFile = !!project.anexoUrl?.trim();
  // Preferir endpoint autenticado para proposta comercial (evita exposição direta via /uploads).
  const fullUrl = hasFile && project.id ? `${API_BASE_URL}/api/projects/${project.id}/proposal` : getAttachmentFullUrl(project.anexoUrl);
  const displayName =
    project.anexoNomeArquivo?.trim() ||
    (project.anexoUrl?.includes("/") ? project.anexoUrl.split("/").pop() : null) ||
    "Proposta comercial";
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);

  const handleOpen = useCallback(async () => {
    if (!hasFile || !fullUrl) return;
    setOpening(true);
    try {
      // Usa request autenticada e abre com objectURL (evita 401 ao abrir /api/... direto).
      const res = await apiFetch(`/api/projects/${project.id}/proposal`, { method: "GET" });
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const w = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        // fallback: se popup for bloqueado, tenta download
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = displayName || "proposta-comercial";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      // Revoga depois para não invalidar cedo (alguns browsers demoram a carregar).
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      // fallback best-effort
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpening(false);
    }
  }, [hasFile, fullUrl, project.id, displayName]);

  const handleDownload = useCallback(async () => {
    if (!hasFile || !fullUrl) return;
    const name = displayName || "proposta-comercial";
    setDownloading(true);
    try {
      const downloadUrl = fullUrl.includes("?") ? `${fullUrl}&download=1` : `${fullUrl}?download=1`;
      const res = await apiFetch(`/api/projects/${project.id}/proposal?download=1`, { method: "GET" });
      if (!res.ok) throw new Error("fetch");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }, [hasFile, fullUrl, displayName, project.id]);

  return (
    <section
      className="rounded-2xl border p-4 md:p-5 space-y-3 w-full bg-[color:var(--surface)]/80 backdrop-blur"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0" style={{ color: "var(--muted-foreground)" }} aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
          Proposta comercial
        </h2>
      </div>
      {!hasFile ? (
        <div className="rounded-xl border px-4 py-3 text-sm text-[color:var(--muted-foreground)]" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          Sem anexos
        </div>
      ) : (
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border px-4 py-3"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[color:var(--foreground)] truncate" title={displayName}>
              {displayName}
            </p>
            {(project.anexoTamanho != null && project.anexoTamanho > 0) || project.anexoTipo ? (
              <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                {[tipoArquivoLabel(project.anexoTipo), formatFileSize(project.anexoTamanho ?? undefined)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpen}
              disabled={opening || downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: "var(--border)",
                background: "rgba(0,0,0,0.06)",
                color: "var(--foreground)",
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              {opening ? "Abrindo…" : "Visualizar"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || opening}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 hover:opacity-95 transition-opacity"
              style={{ background: "var(--primary)" }}
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {downloading ? "Baixando…" : "Baixar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
