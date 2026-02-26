import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  // Busca ou cria o tenant padrão
  const tenant = await prisma.tenant.upsert({
    where: { slug: "wps-consult" },
    update: {},
    create: {
      name: "WPS Consult",
      slug: "wps-consult",
    },
  });

  console.log("Criando os 4 tipos de usuário...\n");

  // 1. ADMIN
  const admin = await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@wpsconsult.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      email: "admin@wpsconsult.com.br",
      name: "Administrador",
      passwordHash: hash,
      role: "ADMIN",
      tenantId: tenant.id,
      cargo: "Administrador",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: true,
      permitirFimDeSemana: true,
      permitirOutroPeriodo: true,
      mustChangePassword: false,
    },
  });
  console.log("✓ ADMIN criado: admin@wpsconsult.com.br");

  // 2. GESTOR_PROJETOS
  const gestor = await prisma.user.upsert({
    where: { email_tenantId: { email: "gestor@wpsconsult.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      email: "gestor@wpsconsult.com.br",
      name: "Gestor de Projetos",
      passwordHash: hash,
      role: "GESTOR_PROJETOS",
      tenantId: tenant.id,
      cargo: "Gestor de Projetos",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: true,
      permitirFimDeSemana: false,
      permitirOutroPeriodo: false,
      mustChangePassword: false,
    },
  });
  console.log("✓ GESTOR_PROJETOS criado: gestor@wpsconsult.com.br");

  // 3. CONSULTOR
  const consultor = await prisma.user.upsert({
    where: { email_tenantId: { email: "consultor@wpsconsult.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      email: "consultor@wpsconsult.com.br",
      name: "Consultor",
      passwordHash: hash,
      role: "CONSULTOR",
      tenantId: tenant.id,
      cargo: "Consultor",
      cargaHorariaSemanal: 40,
      permitirMaisHoras: false,
      permitirFimDeSemana: false,
      permitirOutroPeriodo: false,
      diasPermitidos: '["seg","ter","qua","qui","sex"]',
      mustChangePassword: false,
    },
  });
  console.log("✓ CONSULTOR criado: consultor@wpsconsult.com.br");

  // 4. CLIENTE
  const cliente = await prisma.user.upsert({
    where: { email_tenantId: { email: "cliente@wpsconsult.com.br", tenantId: tenant.id } },
    update: {},
    create: {
      email: "cliente@wpsconsult.com.br",
      name: "Cliente",
      passwordHash: hash,
      role: "CLIENTE",
      tenantId: tenant.id,
      cargo: "Gestor",
      mustChangePassword: false,
    },
  });
  console.log("✓ CLIENTE criado: cliente@wpsconsult.com.br");

  console.log("\n✅ Todos os 4 tipos de usuário foram criados com sucesso!");
  console.log("\n📧 Credenciais:");
  console.log("   - ADMIN: admin@wpsconsult.com.br");
  console.log("   - GESTOR_PROJETOS: gestor@wpsconsult.com.br");
  console.log("   - CONSULTOR: consultor@wpsconsult.com.br");
  console.log("   - CLIENTE: cliente@wpsconsult.com.br");
  console.log("\n🔑 Senha padrão para todos: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar usuários:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
