import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PublicRoute } from '../utils/public-route.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifySignupDto } from './dto/verify-signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('signup')
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }
  @PublicRoute()
  @Post('signup/verify')
  verify(@Body() body: VerifySignupDto) {
    return this.authService.verifySignup(body);
  }
  @PublicRoute()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
