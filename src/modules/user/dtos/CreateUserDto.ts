import { IsString, IsEmail, MinLength, IsOptional, IsUrl, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { BeltGraduation, UserRole } from '../../../core/entities/enums';

export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    celphone!: string;

    @IsOptional()
    isActive?: boolean;

    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsUrl()
    avatar_url?: string;

    @IsEnum(UserRole)
    role!: UserRole;

    @IsBoolean()
    isStudent!: boolean;

    @IsOptional()
    @IsEnum(BeltGraduation)
    graduation?: BeltGraduation;

    @IsOptional()
    @IsNumber()
    subGraduation?: number;

    @IsOptional()
    @IsNumber()
    discountPercentage?: number;

    @IsOptional()
    @IsNumber()
    finalAmount?: number;
}