import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram.service';
import { UserEntity } from 'src/Users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TransactionService } from 'src/transation/transation.service';
import { TransactionEntity } from 'src/Transation/transaction.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature( [UserEntity]),
    TypeOrmModule.forFeature( [TransactionEntity]),
    CacheModule.register()
  ],
  providers: [TelegramBotService,UsersService,TransactionService ]
})
export class TelegramModule {}
