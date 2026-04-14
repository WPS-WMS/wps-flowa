-- Enable Row Level Security (RLS) on all public tables for Supabase Security Advisor.
-- Backend uses role postgres (superuser), so RLS is bypassed and app keeps working.

DO $$
BEGIN
  -- Torna a migration idempotente para shadow DB (Prisma).
  -- Habilita RLS apenas se a tabela existir.
  IF to_regclass('public."Tenant"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."Client"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."ClientContact"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "ClientContact" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."ClientUser"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "ClientUser" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."Ticket"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TicketResponsible"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TicketResponsible" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."ProjectResponsible"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "ProjectResponsible" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."Project"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."Activity"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "Activity" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TimeEntry"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TimeEntry" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TicketComment"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TicketComment" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TicketHistory"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TicketHistory" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TicketCommentAttachment"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TicketCommentAttachment" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TicketAttachment"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TicketAttachment" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."TimeEntryPermissionRequest"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "TimeEntryPermissionRequest" ENABLE ROW LEVEL SECURITY'; END IF;
  IF to_regclass('public."HourBankRecord"') IS NOT NULL THEN EXECUTE 'ALTER TABLE "HourBankRecord" ENABLE ROW LEVEL SECURITY'; END IF;

  -- User table (table name in DB is "users")
  IF to_regclass('public.users') IS NOT NULL THEN EXECUTE 'ALTER TABLE "users" ENABLE ROW LEVEL SECURITY'; END IF;
END $$;
