import { Suspense } from "react";
import { ResetSenhaClient } from "./reset-senha-client";

export default function ResetSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
          <p className="text-blue-700">Carregando...</p>
        </div>
      }
    >
      <ResetSenhaClient />
    </Suspense>
  );
}

