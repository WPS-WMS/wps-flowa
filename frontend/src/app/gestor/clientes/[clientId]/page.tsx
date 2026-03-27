"use client";

import ClienteDetalhePage from "@/app/admin/clientes/[clientId]/page";

export default function GestorClienteDetalhePage(props: { params: Promise<{ clientId: string }> }) {
  return <ClienteDetalhePage {...props} />;
}

