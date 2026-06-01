import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) throw new ConflictException('El usuario ya existe.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.username, hashed);
    return { message: 'Registro exitoso.', userId: user.id };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Credenciales inválidas.');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas.');

    const token = this.jwtService.sign({ sub: user.id, username: user.username });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    return res.json({ username: user.username });
  }

  async logout(res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Sesión cerrada.' });
  }
}
