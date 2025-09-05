import { Request, Response } from 'express';
import { LogService } from '../services/LogService';
import { LogRepository } from '../repositories/LogRepository';
import { LogAction } from '../../../core/entities/Log';

export class LogController {
    private logService: LogService;

    constructor() {
        this.logService = new LogService(new LogRepository());
    }

    async getAllLogs(req: Request, res: Response): Promise<void> {
        try {
            const logs = await this.logService.getAllLogs();

            res.status(200).json({
                success: true,
                data: logs,
                message: 'Logs recuperados com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getLogById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const log = await this.logService.getLogById(id);

            if (!log) {
                res.status(404).json({
                    success: false,
                    message: 'Log não encontrado',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: log,
                message: 'Log recuperado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getLogsByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);
            const logs = await this.logService.getLogsByUserId(userId);

            res.status(200).json({
                success: true,
                data: logs,
                message: 'Logs do usuário recuperados com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getLogsByEntity(req: Request, res: Response): Promise<void> {
        try {
            const entity = req.params.entity;
            const entityId = parseInt(req.params.entityId);

            if (isNaN(entityId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID da entidade deve ser um número válido',
                });
                return;
            }

            const logs = await this.logService.getLogsByEntity(entity, entityId);

            res.status(200).json({
                success: true,
                data: logs,
                message: `Logs da entidade ${entity} recuperados com sucesso`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getLogsByAction(req: Request, res: Response): Promise<void> {
        try {
            const action = req.params.action as LogAction;

            // Valida se a ação é válida
            if (!Object.values(LogAction).includes(action)) {
                res.status(400).json({
                    success: false,
                    message: 'Ação inválida. Use: CREATE, UPDATE ou DELETE',
                });
                return;
            }

            const logs = await this.logService.getLogsByAction(action);

            res.status(200).json({
                success: true,
                data: logs,
                message: `Logs da ação ${action} recuperados com sucesso`,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }
} 