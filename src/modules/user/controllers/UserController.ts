import e, { Request, Response } from 'express';
import { IUserService } from '../../../core/interfaces/services/IUserService';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { UpdateUserDto } from '../dtos/UpdateUserDto';
import { AuthenticatedRequest } from '../../../middlewares/auth';

export class UserController {
    constructor(private userService: IUserService) { }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const userData: CreateUserDto = req.body;
            const user = await this.userService.createUser(userData);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(201).json({
                success: true,
                data: userWithoutPassword,
                message: 'Usuário criado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const user = await this.userService.getUserById(id);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                data: userWithoutPassword,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();

            const usersWithoutPasswords = users.map(({ password, ...user }) => user);

            res.status(200).json({
                success: true,
                data: usersWithoutPasswords,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (!id || isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório',
                });
                return;
            }

            const userData: UpdateUserDto = req.body;
            const user = await this.userService.updateUser(id, userData);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                data: userWithoutPassword,
                message: 'Usuário atualizado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await this.userService.deleteUser(id);

            res.status(200).json({
                success: true,
                message: 'Usuário deletado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
                return;
            }

            const file = req.file;
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: 'Nenhum arquivo foi enviado',
                });
                return;
            }

            const user = await this.userService.uploadAvatar(userId, file);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                data: userWithoutPassword,
                message: 'Avatar atualizado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req?.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                });
                return;
            }

            const user = await this.userService.deleteAvatar(userId);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(200).json({
                success: true,
                data: userWithoutPassword,
                message: 'Avatar removido com sucesso',
            });
        } catch (error) {
            console.log('errors: ', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }
} 