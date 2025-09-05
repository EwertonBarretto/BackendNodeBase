import { Router } from 'express';
import userRoutes from './modules/user/routes';
import authRoutes from './modules/auth/routes';
import logRoutes from './modules/log/routes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de usuário
router.use('/user', userRoutes);

// Rotas de log (auditoria)
router.use('/logs', logRoutes);

// Rota de health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando normalmente',
        timestamp: new Date().toISOString(),
    });
});

export default router; 