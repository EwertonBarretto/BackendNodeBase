import { Router } from 'express';
import { UserController } from './controllers/UserController';
import { UserService } from './services/UserService';
import { UserRepository } from './repositories/UserRepository';
import { authMiddleware } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validation';
import { body } from 'express-validator';
import { upload } from '../../config/multer';

const router = Router();

// Injeção de dependência
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Validações
const createUserValidation = [
    body('name').isString().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().withMessage('Email deve ser válido'),
    body('celphone').isString().isLength({ min: 12, max: 20 }).withMessage('Celular deve ser válido'),
    body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role').isIn(['ADMIN', 'STUDENT', 'TEACHER']).withMessage('Role deve ser ADMIN, STUDENT ou TEACHER'),
    body('isStudent').optional().isBoolean().withMessage('isStudent deve ser um valor booleano'),
    body('graduation').optional().isIn(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']).withMessage('Graduation inválida'),
    body('subGraduation').optional().isInt({ min: 0 }).withMessage('SubGraduation deve ser um número inteiro positivo'),
    body('discountPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('discountPercentage deve estar entre 0 e 100'),
    body('finalAmount').optional().isFloat({ min: 0 }).withMessage('finalAmount deve ser um número positivo'),
];

const updateUserValidation = [
    body('name').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().withMessage('Email deve ser válido'),
    body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role').optional().isIn(['ADMIN', 'STUDENT', 'TEACHER']).withMessage('Role deve ser ADMIN, STUDENT ou TEACHER'),
    body('isStudent').optional().isBoolean().withMessage('isStudent deve ser um valor booleano'),
    body('graduation').optional().isIn(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']).withMessage('Graduation inválida'),
    body('subGraduation').optional().isInt({ min: 0 }).withMessage('subGraduation deve ser um número inteiro positivo'),
    body('discountPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('discountPercentage deve estar entre 0 e 100'),
    body('finalAmount').optional().isFloat({ min: 0 }).withMessage('finalAmount deve ser um número positivo'),
    body('isActive').optional().isBoolean().withMessage('isActive deve ser um valor booleano'),
];

// Rota pública - GET /users/public
router.put('/resetpassword/:celphone', userController.resetPassword.bind(userController));


// Rotas protegidas por autenticação
router.use(authMiddleware);

// GET /users - Listar todos os usuários
router.get('/getall', userController.getAllUsers.bind(userController));

// GET /users/:id - Buscar usuário por ID
router.get('/getbyid/:id', userController.getUserById.bind(userController));

// PUT /users/:id - Atualizar usuário (log automático via middleware global)
router.put(
    '/:id',
    updateUserValidation,
    validateRequest,
    userController.updateUser.bind(userController)
);

// DELETE /users/:id - Deletar usuário (log automático via middleware global)
router.delete('/:id', userController.deleteUser.bind(userController));

// POST /users/avatar - Upload de avatar
router.post('/avatar/:id', upload.single('avatar'), userController.uploadAvatar.bind(userController));

// DELETE /users/avatar - Remover avatar
router.delete('/avatar/delete', userController.deleteAvatar.bind(userController));

export default router;