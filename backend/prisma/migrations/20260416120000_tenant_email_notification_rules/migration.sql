-- Regras de envio de e-mail por tipo de projeto + gatilho (tenant).
-- Idempotente.

DO $$
BEGIN
  IF to_regclass('public."Tenant"') IS NOT NULL THEN
    IF to_regclass('public."tenant_email_notification_rules"') IS NULL THEN
      EXECUTE '
        CREATE TABLE "tenant_email_notification_rules" (
          "id" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "projectType" TEXT NOT NULL,
          "trigger" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "tenant_email_notification_rules_pkey" PRIMARY KEY ("id")
        )
      ';
      -- Nomes <= 63 caracteres (limite do Postgres para identificadores)
      EXECUTE 'CREATE UNIQUE INDEX "ten_email_rules_tpt_trig_uq" ON "tenant_email_notification_rules"("tenantId", "projectType", "trigger")';
      EXECUTE 'CREATE INDEX "ten_email_rules_tenant_idx" ON "tenant_email_notification_rules"("tenantId")';
      EXECUTE 'ALTER TABLE "tenant_email_notification_rules" ADD CONSTRAINT "tenant_email_notification_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE';
    END IF;
  END IF;
END $$;
