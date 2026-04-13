"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, UserRound } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const el = document.documentElement;
    const getTheme = () =>
      (el.getAttribute("data-theme") === "dark" ? "dark" : "light") as "dark" | "light";
    setTheme(getTheme());
    const obs = new MutationObserver(() => setTheme(getTheme()));
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const isDark = theme === "dark";
  const surface = useMemo(
    () => (isDark ? "rgba(12, 8, 18, 0.55)" : "rgba(255, 255, 255, 0.65)"),
    [isDark],
  );
  const navText = useMemo(() => (isDark ? "rgba(244,242,255,0.78)" : "rgba(17,24,39,0.70)"), [isDark]);
  const bg = useMemo(() => (isDark ? "#000000" : "#f7f7fb"), [isDark]);

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
    <div className="min-h-screen flex flex-col" style={{ background: bg, color: isDark ? "#ffffff" : "#0b0b12" }}>
      {/* topo */}
      <header className="w-full">
        <div className="mx-auto max-w-6xl px-6 pt-7">
          <div className="relative flex items-center">
            <nav
              className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-24 text-sm font-medium"
              style={{ color: navText }}
            >
              <a href="#home" className="hover:opacity-90 transition-opacity">
                Home
              </a>
              <a href="#sobre" className="hover:opacity-90 transition-opacity">
                Sobre
              </a>
              <a href="#contato" className="hover:opacity-90 transition-opacity">
                Contato
              </a>
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
                style={{ background: "#5c00e1" }}
              >
                Entrar
              </Link>
              <Link
                href="/login"
                aria-label="Entrar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: surface, border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.14)"}` }}
              >
                <UserRound className="h-5 w-5" style={{ color: isDark ? "rgba(244,242,255,0.70)" : "rgba(17,24,39,0.60)" }} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* hero */}
      <main className="flex-1">
        <section id="home" className="mx-auto max-w-6xl px-6 pt-12 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-12 lg:gap-14">
            <div className="space-y-10">
              {/* lockup */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div
                    className="px-4 py-2.5"
                    style={{
                      border: `2px solid rgba(92,0,225,0.85)`,
                      background: "transparent",
                    }}
                  >
                    <span className="text-6xl font-black tracking-tight leading-none" style={{ color: isDark ? "#ffffff" : "#0b0b12" }}>
                      WPS
                    </span>
                  </div>
                </div>
                <img
                  src="/WPS One 2.png"
                  alt="One"
                  className="h-[56px] w-auto select-none"
                  draggable={false}
                />
              </div>

              {/* card */}
              <div className="max-w-xl rounded-[22px] px-8 py-7 text-white" style={{ background: "#5c00e1" }}>
                <h2 className="text-xl font-bold">Gestão de projetos</h2>
                <p className="mt-3 text-base leading-relaxed opacity-95">
                  Modele projetos internos, Fixed Price, AMS e T&amp;M, com horas contratadas,
                  banco de horas e escopo
                </p>
              </div>

              {/* CTA */}
              <div className="flex justify-center sm:justify-start pt-1">
                <a
                  href="#sobre"
                  className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
                  style={{ background: "#5c00e1" }}
                >
                  Próximo &gt;
                </a>
              </div>
            </div>

            {/* seta */}
            <div className="relative flex items-center justify-center">
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background: isDark
                    ? "radial-gradient(780px 420px at 65% 35%, rgba(92,0,225,0.18), transparent 62%)"
                    : "radial-gradient(780px 420px at 65% 35%, rgba(92,0,225,0.10), transparent 64%)",
                }}
                aria-hidden
              />
              <img
                src="/WPS One seta.png"
                alt=""
                className="w-full max-w-[680px] select-none"
                style={{ filter: isDark ? "drop-shadow(0 28px 80px rgba(0,0,0,0.55))" : "drop-shadow(0 28px 80px rgba(17,24,39,0.20))" }}
                draggable={false}
              />
            </div>
          </div>
        </section>

        {/* blocos simples p/ navegação (mantém âncoras do topo) */}
        <section id="sobre" className="mx-auto max-w-6xl px-6 pb-10">
          <div
            className="rounded-2xl px-6 py-6 md:px-8 md:py-7"
            style={{
              background: surface,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.12)"}`,
              color: isDark ? "rgba(244,242,255,0.80)" : "rgba(17,24,39,0.75)",
            }}
          >
            <h3 className="text-base font-semibold" style={{ color: isDark ? "#fff" : "#0b0b12" }}>
              Sobre
            </h3>
            <p className="mt-2 text-sm leading-relaxed max-w-3xl">
              Plataforma para gestão de projetos, chamados e horas, com experiência moderna e acesso segmentado por perfil.
            </p>
          </div>
        </section>

        <section id="contato" className="mx-auto max-w-6xl px-6 pb-16">
          <div
            className="rounded-2xl px-6 py-6 md:px-8 md:py-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: surface,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.12)"}`,
              color: isDark ? "rgba(244,242,255,0.80)" : "rgba(17,24,39,0.75)",
            }}
          >
            <div>
              <h3 className="text-base font-semibold" style={{ color: isDark ? "#fff" : "#0b0b12" }}>
                Contato
              </h3>
              <p className="mt-2 text-sm">Para acessar, utilize suas credenciais ou fale com a equipe responsável.</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
              style={{ background: "#5c00e1" }}
            >
              Entrar no sistema
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(17,24,39,0.12)" }}>
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs" style={{ color: isDark ? "rgba(244,242,255,0.55)" : "rgba(17,24,39,0.55)" }}>
          © {new Date().getFullYear()} WPS One. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
