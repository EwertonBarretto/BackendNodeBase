import { User } from '../../entities/User';

export interface IUserService {
    createUser(userData: Partial<User>): Promise<User>;
    getUserById(id: number): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    updateUser(id: number, userData: Partial<User>): Promise<User>;
    deleteUser(id: number): Promise<void>;
    uploadAvatar(userId: number, file: any): Promise<User>;
    deleteAvatar(userId: number): Promise<User>;
} 