import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickModule } from './modules/clicks-test/click.module';
import { DbModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    ClickModule,
    AuthModule,
    UsersModule
  ],
})
export class AppModule {}