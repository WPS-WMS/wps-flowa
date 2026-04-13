import type { Metadata } from "next";
import { Baumans, DM_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const oneWordmarkFallback = Baumans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-one-fallback",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WPS One - Gestão de Projetos",
  description: "Sistema de gestão de projetos com apontamento de horas",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${montserrat.variable} ${oneWordmarkFallback.variable}`}
    >
      <body className="antialiased">
        <AuthProvider>
          <ThemeToggle />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
