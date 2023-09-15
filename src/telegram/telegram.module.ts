import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram.service';
import { UserEntity } from 'src/Users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionEntity } from 'src/transaction/transaction.entity';
import { BackupEntity } from 'src/backup/backup.entity';
import { BackupService } from 'src/backup/backup.service';


@Module({
  imports:[
    TypeOrmModule.forFeature( [UserEntity]),
    TypeOrmModule.forFeature( [TransactionEntity]),
    TypeOrmModule.forFeature( [BackupEntity]),
    CacheModule.register()
  ],
  providers: [TelegramBotService,UsersService,TransactionService,BackupService]
})
export class TelegramModule {}
