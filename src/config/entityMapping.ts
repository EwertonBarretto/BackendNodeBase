import { AppDataSource } from './database';
import { User } from '../core/entities/User';

/**
 * Mapeamento de nomes de entidades para seus repositórios
 * Facilita a obtenção dinâmica de repositórios no middleware de log
 */
export const entityRepositoryMap: Record<string, any> = {
    // Usuários
    'users': AppDataSource.getRepository(User),
    'user': AppDataSource.getRepository(User),

    // Adicione outras entidades conforme necessário
    // 'products': AppDataSource.getRepository(Product),
    // 'orders': AppDataSource.getRepository(Order),
    // 'categories': AppDataSource.getRepository(Category),
};

/**
 * Obtém o repositório de uma entidade pelo nome
 */
export function getEntityRepository(entityName: string): any {
    const normalizedName = entityName.toLowerCase();
    const repository = entityRepositoryMap[normalizedName];

    if (!repository) {
        console.warn(`Repositório não encontrado para entidade: ${entityName}`);
        return null;
    }

    return repository;
} 