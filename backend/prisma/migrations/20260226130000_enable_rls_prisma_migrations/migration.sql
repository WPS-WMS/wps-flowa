-- Enable RLS on Prisma's internal migrations table (fixes Security Advisor "RLS Disabled in Public" for public._prisma_migrations).
-- The app connects as postgres (superuser), so Prisma Migrate continues to work.

DO $$
BEGIN
  -- Idempotente para shadow DB (Prisma).
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;
