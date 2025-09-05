import { DataSource } from 'typeorm';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_DATABASE || 'testeDB',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    entities: [join(__dirname, '../core/entities/*{.ts,.js}')],
    migrations: [join(__dirname, './migrations/*{.ts,.js}')],
    //subscribers: [],
    charset: 'utf8mb4',
});

export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Banco de dados conectado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco de dados:', error);
        process.exit(1);
    }
};