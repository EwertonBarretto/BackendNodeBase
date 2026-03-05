import { CreateUserDto } from '../../../modules/user/dtos/CreateUserDto';
import { UpdateUserDto } from '../../../modules/user/dtos/UpdateUserDto';
import { User } from '../../entities/User';

export interface IUserService {
    createUser(userData: CreateUserDto): Promise<User>;
    getUserById(id: number): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    updateUser(id: number, userData: UpdateUserDto): Promise<User>;
    deleteUser(id: number): Promise<void>;
    uploadAvatar(userId: number, file: any): Promise<User>;
    deleteAvatar(userId: number): Promise<User>;
    updatePassword(celphone: string, newPassword: string): Promise<User>;
} 