import { Log, LogAction } from '../../entities/Log';

export interface ILogRepository {
    create(logData: Partial<Log>): Promise<Log>;
    findByUserId(userId: number): Promise<Log[]>;
    findByEntity(entity: string, entityId: number): Promise<Log[]>;
    findByAction(action: LogAction): Promise<Log[]>;
    findAll(): Promise<Log[]>;
    findById(id: number): Promise<Log | null>;
} 