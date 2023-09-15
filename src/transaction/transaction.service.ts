import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from './transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(@InjectRepository(TransactionEntity) private readonly transactionRepository: Repository<TransactionEntity>) { }

  async createTransaction(jsonData: any) {
    const transaction = this.transactionRepository.create(jsonData);
    const saveTransaction = await this.transactionRepository.save(transaction);
    if (saveTransaction) {
      return true;
    }
  }

  async getAllDataByAccount(account: string): Promise<TransactionEntity[]> {
    const query = this.transactionRepository
      .createQueryBuilder('entity')
      .where('entity.sourceAccount = :account OR entity.destinationAccount = :account', { account })
      .getMany();
    return query;
  }

  async getListHistory(idUser: string): Promise<number> {
    const query = await this.transactionRepository
      .createQueryBuilder('entity')
      .where('entity.sourceAccount = :idUser OR entity.destinationAccount = :idUser', { idUser })
      .getCount();
    return query;
  }

  async getAmountHistory(limit:number): Promise<TransactionEntity[]>{
    const query = await this.transactionRepository
      .createQueryBuilder('entity')
      .orderBy('entity.create_date', 'DESC')
      .limit(limit)
      .getMany();
    return query;
  }
}
