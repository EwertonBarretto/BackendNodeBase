import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { Log, LogAction } from '../../../core/entities/Log';
import { ILogRepository } from '../../../core/interfaces/repository/ILogRepository';

export class LogRepository implements ILogRepository {
    private repository: Repository<Log>;

    constructor() {
        this.repository = AppDataSource.getRepository(Log);
    }

    async create(logData: Partial<Log>): Promise<Log> {
        const log = this.repository.create(logData);
        return await this.repository.save(log);
    }

    async findByUserId(userId: number): Promise<Log[]> {
        return await this.repository.find({
            where: { userId },
            relations: ['user'],
            order: { datetime: 'DESC' },
        });
    }

    async findByEntity(entity: string, entityId: number): Promise<Log[]> {
        return await this.repository.find({
            where: { entity, entityId },
            relations: ['user'],
            order: { datetime: 'DESC' },
        });
    }

    async findByAction(action: LogAction): Promise<Log[]> {
        return await this.repository.find({
            where: { action },
            relations: ['user'],
            order: { datetime: 'DESC' },
        });
    }

    async findAll(): Promise<Log[]> {
        return await this.repository.find({
            relations: ['user'],
            order: { datetime: 'DESC' },
        });
    }

    async findById(id: number): Promise<Log | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
} 