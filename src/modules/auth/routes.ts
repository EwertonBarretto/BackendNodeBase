import { Router } from 'express';
import { AuthController } from './controllers/AuthController';
import { AuthService } from './services/AuthService';
import { UserService } from '../user/services/UserService';
import { UserRepository } from '../user/repositories/UserRepository';
import { validateRequest } from '../../middlewares/validation';
import { body } from 'express-validator';

const router = Router();

// Injeção de dependência
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const authService = new AuthService(userService);
const authController = new AuthController(authService, userService);

// Validações
const registerValidation = [
    body('name').isString().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').isEmail().withMessage('Email deve ser válido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Email deve ser válido'),
    body('password').isString().withMessage('Senha é obrigatória'),
];

// POST /auth/register - Registrar usuário
router.post('/register', registerValidation, validateRequest, authController.register.bind(authController));

// POST /auth/login - Login
router.post('/login', loginValidation, validateRequest, authController.login.bind(authController));

// POST /auth/logout - Logout
router.post('/logout', authController.logout.bind(authController));

export default router; 