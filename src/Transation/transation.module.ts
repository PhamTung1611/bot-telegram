import { Module } from '@nestjs/common';
import { TransactionService } from './transation.service';
import { TransactionEntity } from './transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([TransactionEntity])
  ],
  providers: [TransactionService]
})
export class TransationModule {}
