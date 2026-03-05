import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToOne
} from 'typeorm';
import { IsEmail, MinLength, IsOptional, IsUrl } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { Log } from './Log';
import { BeltGraduation, UserRole } from './enums';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    name!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsEmail()
    email?: string;

    @Column({ nullable: false, unique: true })
    @MinLength(12) // Mínimo 12 dígitos para celular
    celphone!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    @MinLength(6)
    password?: string;

    @Column({
        type: "enum",
        enum: UserRole,
    })
    role!: UserRole;

    @Column({ default: false })
    isStudent!: boolean;

    @Column({
        type: "enum",
        enum: BeltGraduation,
        nullable: true,
    })
    graduation?: BeltGraduation;

    @Column({ type: "int", nullable: true })
    subGraduation?: number; // Grau ou Dan

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    discountPercentage?: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    finalAmount?: number;

    @Column({ default: true })
    isActive!: boolean;

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

    //TODO REVER
    // @OneToMany(() => Log, (log) => log.user)
    // logs!: Log[];

    // @ManyToOne(() => Company, (company) => company.users)
    // company: Company;

    // @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
    // enrollments: Enrollment[];

    // @OneToMany(() => Attendance, (attendance) => attendance.student)
    // attendances: Attendance[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password && !this.password.startsWith('$2a$')) { // Evita re-hash
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password || '');
    }
}