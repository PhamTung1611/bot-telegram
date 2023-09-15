import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { TelegramModule } from './telegram/telegram.module';
import { UserEntity } from './users/users.entity';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionEntity } from './transaction/transaction.entity';
import { BackupModule } from './backup/backup.module';
import { BackupEntity } from './backup/backup.entity';


@Module({
  imports: [UsersModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost', // Địa chỉ máy chủ PostgreSQL
    port: 5432,         // Cổng mặc định của PostgreSQL
    username: 'postgres', // Tên người dùng PostgreSQL
    password: '1611', // Mật khẩu PostgreSQL
    database: 'moneyvnbot', // Tên cơ sở dữ liệu PostgreSQL
    // entities: [__dirname + '/**/*.entity{.ts,.js}'],
    entities: [UserEntity,TransactionEntity,BackupEntity],
    synchronize: true, // Đồng bộ hóa cơ sở dữ liệu với các entity
  }), TelegramModule, TransactionModule, BackupModule
  ],
  controllers: [],
  providers: []
})
export class AppModule { }
