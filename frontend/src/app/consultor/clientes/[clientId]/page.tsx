"use client";

import ClienteDetalhePage from "@/app/admin/clientes/[clientId]/page";

export default function ConsultorClienteDetalhePage(props: { params: Promise<{ clientId: string }> }) {
  return <ClienteDetalhePage {...props} />;
}

