import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserDto } from '../../user/dtos/CreateUserDto';
import { LoginDto } from '../dtos/LoginDto';
import { IUserService } from '../../../core/interfaces/services/IUserService';

export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: IUserService
    ) { }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const userData: CreateUserDto = req.body;
            const user = await this.userService.createUser(userData);

            // Remove a senha do response
            const { password, ...userWithoutPassword } = user;

            res.status(201).json({
                success: true,
                data: userWithoutPassword,
                message: 'Usuário registrado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const loginData: LoginDto = req.body;
            const result = await this.authService.login(loginData);

            res.status(200).json({
                success: true,
                data: result,
                message: 'Login realizado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            // Em uma implementação real, você adicionaria o token a uma blacklist
            // Por enquanto, apenas retornamos sucesso
            res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Erro interno do servidor',
            });
        }
    }
} 