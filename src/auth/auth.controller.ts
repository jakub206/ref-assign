import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-user';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'Referee account created.' })
  registerUser(@Body() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  @ApiOkResponse({ description: 'Returns a JWT access token.' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Returns the currently authenticated user.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
