import jwt from 'jsonwebtoken';
import { LoginDto } from '../dtos/LoginDto';
import { AppError } from '../../../errors/AppError';
import { IUserService } from '../../../core/interfaces/services/IUserService';

export class AuthService {
    constructor(private userService: IUserService) { }

    async login(loginData: LoginDto): Promise<{ token: string; user: any }> {
        const user = await this.userService.getUserByEmail(loginData.email);
        if (!user) {
            throw new AppError('Credenciais inválidas', 401);
        }

        const isValidPassword = await user.validatePassword(loginData.password);
        if (!isValidPassword) {
            throw new AppError('Credenciais inválidas', 401);
        }

        const token = this.generateToken(user.id);

        // Remove a senha do response
        const { password, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword,
        };
    }

    private generateToken(userId: number): string {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new AppError('JWT_SECRET não configurado', 500);
        }

        return jwt.sign(
            { userId, iat: Date.now() },
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }

    verifyToken(token: string): { userId: number } {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new AppError('JWT_SECRET não configurado', 500);
        }

        try {
            const decoded = jwt.verify(token, secret) as { userId: number };
            return decoded;
        } catch (error) {
            throw new AppError('Token inválido', 401);
        }
    }
} 