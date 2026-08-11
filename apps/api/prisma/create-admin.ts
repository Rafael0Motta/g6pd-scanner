// Cria (ou atualiza a senha de) o admin do painel oculto.
// Uso: npx tsx prisma/create-admin.ts "email@exemplo.com" "SenhaForte123" "Nome do Admin"
//
// Nao ha tela de cadastro de admin no app - este script e o unico jeito de
// provisionar a credencial que protege o CRUD da base clinica.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const [, , email, senha, nome] = process.argv;

  if (!email || !senha) {
    console.error('Uso: npx tsx prisma/create-admin.ts "email@exemplo.com" "SenhaForte123" "Nome"');
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { senhaHash, nome: nome ?? email },
    create: { email, senhaHash, nome: nome ?? email },
  });

  console.log(`Admin pronto: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
