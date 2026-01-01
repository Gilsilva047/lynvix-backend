/**
 * Script para criar um usuário ativo para testes
 * Execute com: npx tsx create-active-user.ts
 */

import { PrismaClient, UserStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function createActiveUser() {
  try {
    console.log('🔄 Criando usuário ativo para testes...\n');

    // Hash da senha
    const hashedPassword = await bcryptjs.hash('senha123', 10);

    // Cria ou atualiza o usuário
    const user = await prisma.user.upsert({
      where: { email: 'teste.ativo@example.com' },
      update: {
        status: UserStatus.ACTIVE,
      },
      create: {
        name: 'Usuário Teste Ativo',
        email: 'teste.ativo@example.com',
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    });

    console.log('✅ Usuário ativo criado com sucesso!\n');
    console.log('📧 Email:', user.email);
    console.log('🔑 Senha: senha123');
    console.log('✨ Status:', user.status);
    console.log('\n🚀 Use estas credenciais para fazer login na API!\n');
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createActiveUser();
