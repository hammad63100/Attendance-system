import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    login(@Body() body: any) {
        if (body.username === 'admin' && body.password === 'admin') {
            return { access_token: 'super-secret-dummy-token' };
        }
        throw new UnauthorizedException('Invalid credentials');
    }
}
