import { Router } from 'express';
import { LogController } from './controllers/LogController';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

// Todas as rotas de log requerem autenticação
router.use(authMiddleware);

const logController = new LogController();

// GET /logs - Listar todos os logs
router.get('/', logController.getAllLogs.bind(logController));

// GET /logs/:id - Buscar log por ID
router.get('/:id', logController.getLogById.bind(logController));

// GET /logs/user/:userId - Buscar logs por usuário
router.get('/user/:userId', logController.getLogsByUserId.bind(logController));

// GET /logs/entity/:entity/:entityId - Buscar logs por entidade
router.get('/entity/:entity/:entityId', logController.getLogsByEntity.bind(logController));

// GET /logs/action/:action - Buscar logs por ação
router.get('/action/:action', logController.getLogsByAction.bind(logController));

export default router; 