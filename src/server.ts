import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import { initializeDatabase } from './config/database';
import routes from './routes';
import { loggerMiddleware } from './middlewares/logger';
import { logMiddleware } from './middlewares/logMiddleware';
import { errorHandler } from './middlewares/errorHandler';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limite por IP
    message: {
        success: false,
        message: 'Muitas requisições deste IP, tente novamente mais tarde.',
    },
});

// Middlewares de segurança
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logger
app.use(loggerMiddleware);

// Middleware de log de auditoria global (antes das rotas)
app.use(logMiddleware);

// Servir arquivos estáticos de upload
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rotas
app.use(routes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicialização do servidor
const startServer = async (): Promise<void> => {
    try {
        // Inicializa conexão com o banco
        await initializeDatabase();

        // Inicia o servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`📚 API Docs: http://localhost:${PORT}/api/health`);
            console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
            console.log(`📝 Log de Auditoria: Ativo globalmente para PUT/DELETE`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Inicia o servidor
startServer(); 