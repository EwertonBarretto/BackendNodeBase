import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/services/AuthService';
import { UserService } from '../modules/user/services/UserService';
import { UserRepository } from '../modules/user/repositories/UserRepository';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Token de autenticação não fornecido',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer " do início

        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);
        const authService = new AuthService(userService);

        const decoded = authService.verifyToken(token);
        const user = await userService.getUserById(decoded.userId);

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Usuário não encontrado',
            });
            return;
        }

        // Adiciona informações do usuário à requisição
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido',
        });
    }
}; 