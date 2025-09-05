import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

export class FileManager {
    private static readonly UPLOAD_DIR = 'uploads';
    private static readonly USER_AVATARS_DIR = 'avatars';
    private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Cria os diretórios necessários se não existirem
     */
    static async ensureDirectories(): Promise<void> {
        const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR);
        const avatarsPath = path.join(uploadPath, this.USER_AVATARS_DIR);

        try {
            await mkdirAsync(uploadPath, { recursive: true });
            await mkdirAsync(avatarsPath, { recursive: true });
        } catch (error) {
            console.error('Erro ao criar diretórios de upload:', error);
            throw new Error('Erro ao configurar diretórios de upload');
        }
    }

    /**
     * Valida o arquivo de upload
     */
    static validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
        if (!file) {
            return { isValid: false, error: 'Nenhum arquivo foi enviado' };
        }

        if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return {
                isValid: false,
                error: 'Tipo de arquivo não permitido. Use apenas: JPEG, JPG, PNG ou GIF'
            };
        }

        if (file.size > this.MAX_FILE_SIZE) {
            return {
                isValid: false,
                error: `Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
            };
        }

        return { isValid: true };
    }

    /**
     * Gera nome único para o arquivo
     */
    static generateFileName(originalName: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(originalName);
        return `${timestamp}_${randomString}${extension}`;
    }

    /**
     * Salva arquivo de avatar do usuário
     */
    static async saveUserAvatar(file: Express.Multer.File): Promise<string> {
        const fileName = this.generateFileName(file.originalname);
        const filePath = path.join(this.UPLOAD_DIR, this.USER_AVATARS_DIR, fileName);
        const fullPath = path.join(process.cwd(), filePath);

        try {
            // Garante que os diretórios existam
            await this.ensureDirectories();

            // Salva o arquivo
            fs.writeFileSync(fullPath, file.buffer);

            // Retorna o caminho relativo para salvar no banco
            return `/${filePath}`;
        } catch (error) {
            console.error('Erro ao salvar arquivo:', error);
            throw new Error('Erro ao salvar arquivo');
        }
    }

    /**
     * Deleta arquivo de avatar do usuário
     */
    static async deleteUserAvatar(avatarUrl: string): Promise<void> {
        if (!avatarUrl || avatarUrl === '/uploads/avatars/default-avatar.png') {
            return; // Não deleta avatar padrão
        }

        try {
            // Remove a barra inicial para obter o caminho relativo
            const relativePath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl;
            const fullPath = path.join(process.cwd(), relativePath);

            // Verifica se o arquivo existe antes de tentar deletar
            if (fs.existsSync(fullPath)) {
                await unlinkAsync(fullPath);
            }
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            // Não lança erro para não interromper o fluxo principal
        }
    }

    /**
     * Atualiza avatar do usuário (deleta o anterior e salva o novo)
     */
    static async updateUserAvatar(
        newFile: Express.Multer.File,
        currentAvatarUrl?: string
    ): Promise<string> {
        try {
            // Deleta avatar anterior se existir
            if (currentAvatarUrl) {
                await this.deleteUserAvatar(currentAvatarUrl);
            }

            // Salva novo avatar
            return await this.saveUserAvatar(newFile);
        } catch (error) {
            console.error('Erro ao atualizar avatar:', error);
            throw new Error('Erro ao atualizar avatar');
        }
    }

    /**
     * Obtém o caminho completo para um arquivo
     */
    static getFullPath(relativePath: string): string {
        return path.join(process.cwd(), relativePath.startsWith('/') ? relativePath.substring(1) : relativePath);
    }

    /**
     * Verifica se um arquivo existe
     */
    static fileExists(filePath: string): boolean {
        const fullPath = this.getFullPath(filePath);
        return fs.existsSync(fullPath);
    }
} 