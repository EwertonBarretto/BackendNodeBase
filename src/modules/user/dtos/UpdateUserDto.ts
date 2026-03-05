import { IsString, IsEmail, MinLength, IsOptional, IsUrl, IsEnum, IsNumber, IsBoolean, Min } from 'class-validator';
import { BeltGraduation, UserRole } from '../../../core/entities/enums';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    celphone?: string;

    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsUrl()
    avatar_url?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsBoolean()
    isStudent?: boolean;

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