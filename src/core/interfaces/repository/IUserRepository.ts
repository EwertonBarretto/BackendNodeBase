import { CreateUserDto } from '../../../modules/user/dtos/CreateUserDto';
import { UpdateUserDto } from '../../../modules/user/dtos/UpdateUserDto';
import { User } from '../../entities/User';

export interface IUserRepository {
    create(userData: CreateUserDto): Promise<User>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByCelphone(celphone: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: number, userData: UpdateUserDto): Promise<User | null>;
    delete(id: number): Promise<boolean>;
} 