import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TransationModule } from './transation/transation.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserEntity } from './users/users.entity';
import { TransactionEntity } from './Transation/transaction.entity';



@Module({
  imports: [UsersModule, TransationModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost', // Địa chỉ máy chủ PostgreSQL
    port: 5432,         // Cổng mặc định của PostgreSQL
    username: 'postgres', // Tên người dùng PostgreSQL
    password: '1611', // Mật khẩu PostgreSQL
    database: 'moneyvnbot', // Tên cơ sở dữ liệu PostgreSQL
    // entities: [__dirname + '/**/*.entity{.ts,.js}'],
    entities: [UserEntity, TransactionEntity],
    synchronize: true, // Đồng bộ hóa cơ sở dữ liệu với các entity
  }), TelegramModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
