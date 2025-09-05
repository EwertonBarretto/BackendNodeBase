import { User } from '../../../core/entities/User';
import { IUserService } from '../../../core/interfaces/services/IUserService';
import { IUserRepository } from '../../../core/interfaces/repository/IUserRepository';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UpdateUserDto } from '../dtos/UpdateUserDto';
import { AppError } from '../../../errors/AppError';
import { FileManager } from '../../../shared/utils/fileManager';

export class UserService implements IUserService {
    constructor(private userRepository: IUserRepository) { }

    async createUser(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('Email já está em uso', 400);
        }

        return await this.userRepository.create(userData);
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }
        return user;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError('Usuário não encontrado', 404);
        }

        if (userData.email && userData.email !== existingUser.email) {
            const userWithEmail = await this.userRepository.findByEmail(userData.email);
            if (userWithEmail) {
                throw new AppError('Email já está em uso', 400);
            }
        }

        const updatedUser = await this.userRepository.update(id, userData);
        if (!updatedUser) {
            throw new AppError('Erro ao atualizar usuário', 500);
        }

        return updatedUser;
    }

    async deleteUser(id: number): Promise<void> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError('Usuário não encontrado', 404);
        }

        // Deleta o avatar se existir
        if (existingUser.avatar_url && existingUser.avatar_url !== '/uploads/avatars/default-avatar.png') {
            await FileManager.deleteUserAvatar(existingUser.avatar_url);
        }

        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw new AppError('Erro ao deletar usuário', 500);
        }
    }

    async uploadAvatar(userId: number, file: Express.Multer.File): Promise<User> {
        const user = await this.getUserById(userId);

        if (!file) {
            throw new AppError('Nenhum arquivo foi enviado', 400);
        }

        // Valida o arquivo
        const validation = FileManager.validateFile(file);
        if (!validation.isValid) {
            throw new AppError(validation.error || 'Arquivo inválido', 400);
        }

        try {
            // Atualiza o avatar (deleta o anterior e salva o novo)
            const newAvatarUrl = await FileManager.updateUserAvatar(file, user.avatar_url);

            // Atualiza o usuário no banco
            const updatedUser = await this.userRepository.update(userId, { avatar_url: newAvatarUrl });
            if (!updatedUser) {
                throw new AppError('Erro ao atualizar avatar', 500);
            }

            return updatedUser;
        } catch (error) {
            throw new AppError('Erro ao processar upload do avatar', 500);
        }
    }

    async deleteAvatar(userId: number): Promise<User> {
        const user = await this.getUserById(userId);

        if (user.avatar_url === '/uploads/avatars/default-avatar.png') {
            throw new AppError('Usuário já possui avatar padrão', 400);
        }

        try {
            // Deleta o arquivo
            await FileManager.deleteUserAvatar(user.avatar_url || '');

            // Atualiza para avatar padrão
            const updatedUser = await this.userRepository.update(userId, {
                avatar_url: '/uploads/avatars/default-avatar.png'
            });

            if (!updatedUser) {
                throw new AppError('Erro ao remover avatar', 500);
            }

            return updatedUser;
        } catch (error) {
            throw new AppError('Erro ao processar remoção do avatar', 500);
        }
    }
} 