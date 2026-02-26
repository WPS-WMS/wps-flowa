import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wpsconsult.com.br" },
    update: {},
    create: {
      email: "admin@wpsconsult.com.br",
      name: "Administrador",
      passwordHash: hash,
      role: "ADMIN",
      cargo: "Administrador",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: true,
      permitirFimDeSemana: true,
      permitirOutroPeriodo: true,
    },
  });

  const consultor = await prisma.user.upsert({
    where: { email: "andre.nunes@wpsconsult.com.br" },
    update: {},
    create: {
      email: "andre.nunes@wpsconsult.com.br",
      name: "André Nunes",
      passwordHash: hash,
      role: "CONSULTOR",
      cargo: "Consultor",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: false,
      permitirFimDeSemana: false,
      permitirOutroPeriodo: false,
      diasPermitidos: '["seg","ter","qua","qui","sex"]',
    },
  });

  const cliente = await prisma.user.upsert({
    where: { email: "almir@dellamed.com.br" },
    update: {},
    create: {
      email: "almir@dellamed.com.br",
      name: "Almir",
      passwordHash: hash,
      role: "CLIENTE",
      cargo: "Gestor",
    },
  });

  let dellamed = await prisma.client.findFirst({ where: { name: "Dellamed" } });
  if (!dellamed) {
    dellamed = await prisma.client.create({ data: { name: "Dellamed" } });
  }

  let herc = await prisma.client.findFirst({ where: { name: "HERC" } });
  if (!herc) {
    herc = await prisma.client.create({ data: { name: "HERC" } });
  }

  await prisma.clientUser.upsert({
    where: { userId_clientId: { userId: cliente.id, clientId: dellamed.id } },
    update: {},
    create: {
      userId: cliente.id,
      clientId: dellamed.id,
    },
  });

  let projetoAms = await prisma.project.findFirst({
    where: { name: "03/2024 - Projeto AMS", clientId: dellamed.id },
  });
  if (!projetoAms) {
    projetoAms = await prisma.project.create({
      data: {
        name: "03/2024 - Projeto AMS",
        clientId: dellamed.id,
        createdById: admin.id,
      },
    });
  }

  let projeto09 = await prisma.project.findFirst({
    where: { name: "PRJ 09/2026 - EF", clientId: herc.id },
  });
  if (!projeto09) {
    projeto09 = await prisma.project.create({
      data: {
        name: "PRJ 09/2026 - EF",
        clientId: herc.id,
        createdById: admin.id,
      },
    });
  }

  // Atividades permitidas (apenas esta lista)
  const atividadesNomes = [
    "Reunião com cliente",
    "Mapeamento de Processo",
    "Configuração",
    "Desenvolvimento ABAP",
    "Desenvolvimento Fiori",
    "Debug de apoio ao funcional",
    "Teste funcional",
    "Documentação de Configuração",
    "Documentação de teste funcional",
    "Especificação técnica",
    "Especificação Funcional",
    "Suporte GO LIVE",
    "Suporte em PRD",
    "Atividade de cutover",
    "Atividades de garantia",
    "Estudos (Somente IDLE)",
    "Atividades de marketing",
    "Atividades Administrativas",
    "Atividades de Gestão",
    "Plantão",
  ];
  const atividadesExistentes = await prisma.activity.findMany({ select: { id: true, name: true } });
  const nomesDesejados = new Set(atividadesNomes);
  const idsParaRemover = atividadesExistentes.filter((a) => !nomesDesejados.has(a.name)).map((a) => a.id);
  if (idsParaRemover.length > 0) {
    await prisma.timeEntry.updateMany({ where: { activityId: { in: idsParaRemover } }, data: { activityId: null } });
    await prisma.activity.deleteMany({ where: { id: { in: idsParaRemover } } });
  }
  for (const nome of atividadesNomes) {
    const existe = await prisma.activity.findFirst({ where: { name: nome } });
    if (!existe) await prisma.activity.create({ data: { name: nome } });
  }

  let t338 = await prisma.ticket.findFirst({ where: { code: "338", projectId: projetoAms.id } });
  if (!t338) {
    await prisma.ticket.create({
      data: {
        code: "338",
        title: "DELLAMED - PRJ AMS - Configurar depósito MM",
        type: "Configuração",
      status: "EXECUCAO",
        projectId: projetoAms.id,
        assignedToId: consultor.id,
      },
    });
  }
  let t339 = await prisma.ticket.findFirst({ where: { code: "339", projectId: projetoAms.id } });
  if (!t339) {
    await prisma.ticket.create({
      data: {
        code: "339",
        title: "DELLAMED - PRJ AMS - Configurar estratégia de armazenagem",
        type: "Configuração",
      status: "EXECUCAO",
        projectId: projetoAms.id,
        assignedToId: consultor.id,
      },
    });
  }
  let t391 = await prisma.ticket.findFirst({ where: { code: "391", projectId: projeto09.id } });
  if (!t391) {
    await prisma.ticket.create({
      data: {
        code: "391",
        title: "HERC - PRJ 09/2026 - EF",
        type: "Desenvolvimento",
        status: "ABERTO",
        projectId: projeto09.id,
      },
    });
  }

  console.log("Seed executado com sucesso!");
  console.log("Usuários: admin@wpsconsult.com.br, andre.nunes@wpsconsult.com.br, almir@dellamed.com.br");
  console.log("Senha padrão para todos: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
