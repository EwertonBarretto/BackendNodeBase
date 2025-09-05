import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LogAction } from '../core/entities/Log';
import { LogService } from '../modules/log/services/LogService';
import { LogRepository } from '../modules/log/repositories/LogRepository';
import { getEntityRepository } from '../config/entityMapping';

/**
 * Middleware de log que captura dados antes e depois das operações PUT/DELETE
 * Funciona de forma similar ao middleware fornecido pelo usuário
 */
export const logMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    const url = req.originalUrl;
    const pathSegments = url.split('/').filter(Boolean);

    // Só processa operações PUT e DELETE, excluindo rotas específicas
    if (!['PUT', 'DELETE'].includes(method) || url.startsWith('/api/users')) {
        return next();
    }

    // Extrai o nome da entidade da URL
    const entityName = getEntityNameFromUrl(url);
    if (!entityName) {
        return next();
    }

    // Verifica se tem o ID da entidade
    let entityId: number;

    if (method === 'PUT') {
        // Para PUT, tenta pegar do body primeiro, depois dos parâmetros
        entityId = req.body.id ? parseInt(req.body.id) : parseInt(pathSegments[2]);
    } else {
        // Para DELETE, pega dos parâmetros da URL
        entityId = parseInt(pathSegments[2]);
    }

    if (isNaN(entityId)) {
        return next();
    }

    // Verifica se tem token de autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    let userId: number;

    try {
        // Decodifica o token JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.warn('JWT_SECRET não configurado');
            return next();
        }

        const decoded = jwt.verify(token, secret) as any;
        userId = decoded.userId;

        if (!userId) {
            console.warn('Token inválido: userId não encontrado');
            return next();
        }
    } catch (error) {
        console.warn('Token inválido:', error);
        return next();
    }

    // Obtém o repositório da entidade
    const entityRepository = getEntityRepository(entityName);
    if (!entityRepository) {
        console.warn(`Repositório não encontrado para entidade: ${entityName}`);
        return next();
    }

    // Captura dados antes da operação
    let beforeUpdateData: any;

    try {
        beforeUpdateData = await entityRepository.findOneBy({ id: entityId });
        if (!beforeUpdateData) {
            console.warn(`Entidade ${entityName} com ID ${entityId} não encontrada`);
            return next();
        }
    } catch (err) {
        console.error(`Erro ao buscar dados anteriores: ${err}`);
        return next();
    }

    // Intercepta a resposta para capturar o status
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;

    let statusCode: number;

    res.send = function (data: any) {
        return originalSend.call(this, data);
    };

    res.json = function (data: any) {
        return originalJson.call(this, data);
    };

    res.status = function (code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
    };

    // Executa o próximo middleware/controller
    next();

    // Após a execução, registra o log se a operação foi bem-sucedida
    res.on('finish', async () => {
        try {
            // Só registra log se a operação foi bem-sucedida
            if (![200, 201, 204].includes(statusCode || res.statusCode)) {
                return;
            }

            const logService = new LogService(new LogRepository());
            const changedFields: Record<string, { old: any; new: any }> = {};

            if (method === 'PUT') {
                // Para UPDATE, compara campos alterados
                const newData = req.body;

                Object.keys(newData).forEach((key) => {
                    const oldVal = beforeUpdateData?.[key];
                    const newVal = newData[key];

                    // Só registra se o valor realmente mudou
                    if (newVal !== null && newVal !== undefined && oldVal !== newVal) {
                        changedFields[key] = { old: oldVal, new: newVal };
                    }
                });

                // Se não há campos alterados, não cria log
                if (Object.keys(changedFields).length === 0) {
                    return;
                }
            } else if (method === 'DELETE') {
                // Para DELETE, registra a operação
                changedFields['deleted'] = { old: true, new: false };
            }

            // Cria o log
            await logService.createLog({
                userId,
                entity: entityName,
                entityId: entityId,
                action: method === 'PUT' ? LogAction.UPDATE : LogAction.DELETE,
                changedFields,
                functionUsed: `${method} ${url}`,
            });

        } catch (error) {
            console.error('Erro ao criar log:', error);
            // Não interrompe o fluxo principal em caso de erro no log
        }
    });
};

/**
 * Extrai o nome da entidade da URL
 */
function getEntityNameFromUrl(url: string): string | null {
    const segments = url.split('/').filter(Boolean);

    // Remove prefixos da API
    if (segments[0] === 'api') {
        segments.shift();
    }

    // Retorna o primeiro segmento como nome da entidade
    return segments[0] || null;
} 