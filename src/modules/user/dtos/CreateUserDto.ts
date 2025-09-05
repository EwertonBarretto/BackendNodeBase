import { IsString, IsEmail, MinLength, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsUrl()
    avatar_url?: string;
}