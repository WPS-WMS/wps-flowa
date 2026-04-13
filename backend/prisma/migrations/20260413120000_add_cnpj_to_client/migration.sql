-- Add CNPJ field to Client
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "cnpj" TEXT;

