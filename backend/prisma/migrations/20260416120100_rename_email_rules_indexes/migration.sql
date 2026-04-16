-- Se a tabela já foi criada com o índice único de nome longo, o Postgres trunca (>63 chars).
-- Renomeia para o nome curto alinhado ao Prisma (map: ten_email_rules_tpt_trig_uq).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'tenant_email_notification_rules_tenantId_projectType_trigger_ke'
  ) THEN
    EXECUTE 'ALTER INDEX public."tenant_email_notification_rules_tenantId_projectType_trigger_ke" RENAME TO "ten_email_rules_tpt_trig_uq"';
  ELSIF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'tenant_email_notification_rules_tenantId_projectType_trigger_key'
  ) THEN
    EXECUTE 'ALTER INDEX public."tenant_email_notification_rules_tenantId_projectType_trigger_key" RENAME TO "ten_email_rules_tpt_trig_uq"';
  END IF;
END $$;
