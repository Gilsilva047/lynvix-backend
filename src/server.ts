/**
 * Servidor HTTP
 */

import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = parseInt(env.PORT) || 3333;

/**
 * Inicia o servidor
 */
const startServer = async () => {
  try {
    // Testa conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');

    // Inicia o servidor HTTP
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📝 Ambiente: ${env.NODE_ENV}`);
      console.log(`📊 API: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais de encerramento
process.on('SIGINT', async () => {
  console.log('\n⚠️  Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Banco de dados desconectado');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Encerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Banco de dados desconectado');
  process.exit(0);
});

// Inicia o servidor
startServer();
