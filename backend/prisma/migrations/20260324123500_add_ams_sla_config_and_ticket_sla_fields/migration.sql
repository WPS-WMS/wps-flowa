-- SLA por prioridade para projetos AMS
ALTER TABLE "Project"
ADD COLUMN "slaRespostaBaixa" INTEGER,
ADD COLUMN "slaSolucaoBaixa" INTEGER,
ADD COLUMN "slaRespostaMedia" INTEGER,
ADD COLUMN "slaSolucaoMedia" INTEGER,
ADD COLUMN "slaRespostaAlta" INTEGER,
ADD COLUMN "slaSolucaoAlta" INTEGER,
ADD COLUMN "slaRespostaCritica" INTEGER,
ADD COLUMN "slaSolucaoCritica" INTEGER;

-- Snapshot do SLA aplicado na criação do ticket
ALTER TABLE "Ticket"
ADD COLUMN "slaRespostaHoras" INTEGER,
ADD COLUMN "slaSolucaoHoras" INTEGER;
