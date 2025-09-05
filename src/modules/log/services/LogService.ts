import { Log, LogAction } from '../../../core/entities/Log';
import { ILogRepository } from '../../../core/interfaces/repository/ILogRepository';

export class LogService {
    constructor(private logRepository: ILogRepository) { }

    async createLog(logData: {
        userId: number;
        entity: string;
        entityId: number;
        action: LogAction;
        changedFields: Record<string, { old: any; new: any }>;
        functionUsed: string;
    }): Promise<Log> {
        return await this.logRepository.create(logData);
    }

    async getLogsByUserId(userId: number): Promise<Log[]> {
        return await this.logRepository.findByUserId(userId);
    }

    async getLogsByEntity(entity: string, entityId: number): Promise<Log[]> {
        return await this.logRepository.findByEntity(entity, entityId);
    }

    async getLogsByAction(action: LogAction): Promise<Log[]> {
        return await this.logRepository.findByAction(action);
    }

    async getAllLogs(): Promise<Log[]> {
        return await this.logRepository.findAll();
    }

    async getLogById(id: number): Promise<Log | null> {
        return await this.logRepository.findById(id);
    }

    /**
     * Compara dois objetos e retorna os campos que foram alterados
     */
    static getChangedFields(oldData: any, newData: any): Record<string, { old: any; new: any }> {
        const changedFields: Record<string, { old: any; new: any }> = {};

        // Verifica campos que foram alterados
        for (const key in newData) {
            if (oldData[key] !== newData[key]) {
                changedFields[key] = {
                    old: oldData[key],
                    new: newData[key],
                };
            }
        }

        // Verifica campos que foram removidos
        for (const key in oldData) {
            if (!(key in newData)) {
                changedFields[key] = {
                    old: oldData[key],
                    new: undefined,
                };
            }
        }

        return changedFields;
    }
} 