import { User } from '../../entities/User';

export interface IUserRepository {
    create(userData: Partial<User>): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: number, userData: Partial<User>): Promise<User | null>;
    delete(id: number): Promise<boolean>;
} 