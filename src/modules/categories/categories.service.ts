/**
 * Service do módulo de categorias
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';

interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
  description?: string;
}

interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  description?: string;
}

class CategoriesService {
  /**
   * Lista todas as categorias do usuário
   */
  async getAllCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId, isDefault: false }, // Categorias do usuário
          { isDefault: true }, // Categorias padrão do sistema
        ],
      },
      include: {
        subcategories: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Busca uma categoria por ID
   */
  async getCategoryById(userId: string, categoryId: string) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
      include: {
        subcategories: true,
        parent: true,
      },
    });

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    return category;
  }

  /**
   * Cria uma nova categoria
   */
  async createCategory(userId: string, data: CreateCategoryData) {
    const { name, icon, color, parentId, description } = data;

    // Verifica se já existe uma categoria com esse nome para o usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId,
        parentId: parentId || null,
      },
    });

    if (existingCategory) {
      throw new AppError('Já existe uma categoria com esse nome', 409);
    }

    // Se tem parentId, verifica se a categoria pai existe e pertence ao usuário
    if (parentId) {
      const parentCategory = await prisma.category.findFirst({
        where: {
          id: parentId,
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!parentCategory) {
        throw new AppError('Categoria pai não encontrada', 404);
      }
    }

    // Cria a categoria
    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        parentId,
        description,
        userId,
        isDefault: false,
      },
      include: {
        parent: true,
      },
    });

    return category;
  }

  /**
   * Atualiza uma categoria
   */
  async updateCategory(userId: string, categoryId: string, data: UpdateCategoryData) {
    // Verifica se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isDefault: false, // Não permite editar categorias padrão
      },
    });

    if (!category) {
      throw new AppError('Categoria não encontrada ou não pode ser editada', 404);
    }

    // Se está alterando o nome, verifica se não existe outra categoria com o mesmo nome
    if (data.name && data.name !== category.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: data.name,
          userId,
          parentId: data.parentId || category.parentId,
          NOT: { id: categoryId },
        },
      });

      if (existingCategory) {
        throw new AppError('Já existe uma categoria com esse nome', 409);
      }
    }

    // Atualiza a categoria
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: {
        parent: true,
        subcategories: true,
      },
    });

    return updatedCategory;
  }

  /**
   * Deleta uma categoria
   */
  async deleteCategory(userId: string, categoryId: string) {
    // Verifica se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId,
        isDefault: false, // Não permite deletar categorias padrão
      },
    });

    if (!category) {
      throw new AppError('Categoria não encontrada ou não pode ser deletada', 404);
    }

    // Verifica se tem transações vinculadas
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (transactionsCount > 0) {
      throw new AppError(
        'Não é possível deletar categoria com transações vinculadas',
        400
      );
    }

    // Verifica se tem subcategorias
    const subcategoriesCount = await prisma.category.count({
      where: { parentId: categoryId },
    });

    if (subcategoriesCount > 0) {
      throw new AppError('Não é possível deletar categoria com subcategorias', 400);
    }

    // Deleta a categoria
    await prisma.category.delete({
      where: { id: categoryId },
    });
  }
}

export default new CategoriesService();
