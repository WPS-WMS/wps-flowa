-- Horas quitadas em pagamento (não acumuladas no banco)
ALTER TABLE "HourBankRecord" ADD COLUMN IF NOT EXISTS "horasPagas" DOUBLE PRECISION;
