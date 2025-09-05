import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    // Erro de validação do class-validator
    if (error.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: 'Dados de entrada inválidos',
            errors: error.message,
        });
        return;
    }

    // Erro de JWT
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            message: 'Token inválido',
        });
        return;
    }

    // Erro de JWT expirado
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            message: 'Token expirado',
        });
        return;
    }

    // Erro genérico
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
    });
}; 