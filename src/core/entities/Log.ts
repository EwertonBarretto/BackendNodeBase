import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum LogAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

@Entity('log')
export class Log {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number; // Quem fez a alteração

    @CreateDateColumn()
    datetime!: Date; // Data e hora da modificação

    @Column()
    entity!: string; // Nome da entidade modificada

    @Column()
    entityId!: number; // ID do registro alterado

    @Column({
        type: 'enum',
        enum: LogAction,
    })
    action!: LogAction; // Tipo de ação (CREATE, UPDATE, DELETE)

    @Column({ type: 'json' })
    changedFields!: Record<string, { old: any; new: any }>; // Campos alterados

    @Column()
    functionUsed!: string; // Função que gerou a mudança

    @ManyToOne(() => User, (user) => user.logs, { onDelete: 'CASCADE' })
    @JoinColumn()
    user!: User;
} 