import { IsString, IsEmail, MinLength, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsUrl()
    avatar_url?: string;
}