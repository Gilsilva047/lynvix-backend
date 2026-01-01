/**
 * Seed do banco de dados
 * Popula categorias padrão brasileiras
 *
 * Execute com: npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Alimentação
  {
    name: 'Alimentação',
    icon: 'utensils',
    color: '#E74C3C',
    isDefault: true,
    subcategories: ['Supermercado', 'Restaurante', 'Delivery', 'Padaria', 'Lanchonete'],
  },
  // Moradia
  {
    name: 'Moradia',
    icon: 'home',
    color: '#3498DB',
    isDefault: true,
    subcategories: ['Aluguel', 'Condomínio', 'IPTU', 'Água', 'Luz', 'Gás', 'Internet', 'Telefone'],
  },
  // Transporte
  {
    name: 'Transporte',
    icon: 'car',
    color: '#9B59B6',
    isDefault: true,
    subcategories: [
      'Combustível',
      'Uber/Taxi',
      'Transporte Público',
      'Estacionamento',
      'IPVA',
      'Seguro do Carro',
      'Manutenção',
    ],
  },
  // Saúde
  {
    name: 'Saúde',
    icon: 'heart',
    color: '#E67E22',
    isDefault: true,
    subcategories: ['Plano de Saúde', 'Farmácia', 'Consultas', 'Exames', 'Dentista', 'Academia'],
  },
  // Educação
  {
    name: 'Educação',
    icon: 'book',
    color: '#1ABC9C',
    isDefault: true,
    subcategories: ['Mensalidade', 'Cursos', 'Livros', 'Material Escolar'],
  },
  // Lazer
  {
    name: 'Lazer',
    icon: 'smile',
    color: '#F39C12',
    isDefault: true,
    subcategories: ['Streaming', 'Cinema', 'Shows', 'Viagens', 'Hobbies', 'Jogos'],
  },
  // Vestuário
  {
    name: 'Vestuário',
    icon: 'shopping-bag',
    color: '#E91E63',
    isDefault: true,
    subcategories: ['Roupas', 'Calçados', 'Acessórios'],
  },
  // Beleza e Cuidados Pessoais
  {
    name: 'Beleza e Cuidados',
    icon: 'sparkles',
    color: '#FF6B9D',
    isDefault: true,
    subcategories: ['Cabelereiro', 'Cosméticos', 'Perfumes', 'Spa'],
  },
  // Investimentos
  {
    name: 'Investimentos',
    icon: 'trending-up',
    color: '#27AE60',
    isDefault: true,
    subcategories: ['Ações', 'Fundos', 'Tesouro', 'Criptomoedas', 'Previdência'],
  },
  // Impostos e Taxas
  {
    name: 'Impostos e Taxas',
    icon: 'file-text',
    color: '#95A5A6',
    isDefault: true,
    subcategories: ['IRPF', 'INSS', 'Taxas Bancárias', 'Cartório'],
  },
  // Pets
  {
    name: 'Pets',
    icon: 'dog',
    color: '#8D6E63',
    isDefault: true,
    subcategories: ['Ração', 'Veterinário', 'Petshop', 'Banho e Tosa'],
  },
  // Outros
  {
    name: 'Outros',
    icon: 'more-horizontal',
    color: '#607D8B',
    isDefault: true,
    subcategories: [],
  },
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Cria um usuário dummy para vincular as categorias padrão
  // Em produção, as categorias padrão devem estar disponíveis para todos os usuários
  const dummyUser = await prisma.user.upsert({
    where: { email: 'system@financasbr.com' },
    update: {},
    create: {
      name: 'Sistema',
      email: 'system@financasbr.com',
      password: 'dummy', // Senha dummy, este usuário nunca será usado para login
    },
  });

  console.log(`✅ Usuário sistema criado: ${dummyUser.id}\n`);

  // Cria as categorias padrão
  for (const category of defaultCategories) {
    const { subcategories, ...categoryData } = category;

    const createdCategory = await prisma.category.upsert({
      where: {
        userId_name_parentId: {
          userId: dummyUser.id,
          name: categoryData.name,
          parentId: null,
        },
      },
      update: categoryData,
      create: {
        ...categoryData,
        userId: dummyUser.id,
      },
    });

    console.log(`✅ Categoria criada: ${createdCategory.name}`);

    // Cria as subcategorias
    if (subcategories.length > 0) {
      for (const subName of subcategories) {
        await prisma.category.upsert({
          where: {
            userId_name_parentId: {
              userId: dummyUser.id,
              name: subName,
              parentId: createdCategory.id,
            },
          },
          update: {},
          create: {
            name: subName,
            userId: dummyUser.id,
            parentId: createdCategory.id,
            isDefault: true,
          },
        });
        console.log(`   ↳ Subcategoria: ${subName}`);
      }
    }
    console.log('');
  }

  console.log('✅ Seed finalizado com sucesso!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
