import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
} from 'typeorm';
import { IsEmail, MinLength, IsOptional, IsUrl } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Log } from './Log';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    @IsEmail()
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    @MinLength(6)
    password!: string;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
        default: '/uploads/avatars/default-avatar.png'
    })
    @IsOptional()
    @IsUrl()
    avatar_url?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @OneToMany(() => Log, (log) => log.user)
    logs!: Log[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password && !this.password.startsWith('$2a$')) { // Evita re-hash
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}