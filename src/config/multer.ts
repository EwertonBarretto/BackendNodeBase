import multer from 'multer';
import path from 'path';

// Configuração do Multer para upload de arquivos
export const uploadConfig = {
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Verifica a extensão do arquivo
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não permitido. Use apenas: JPEG, JPG, PNG ou GIF'));
        }
    },
};

// Instância do Multer configurada
export const upload = multer(uploadConfig); 