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

  // async getListHistory(idUser: string) {
  //   const query = await this.transactionRepository.find();
  //   // console.log(query);
  //   // console.log(idUser);
    
    
  //   const filteredData = query.filter(
  //     (obj) => obj.sourceAccount == idUser || obj.destinationAccount == idUser,
  //   );
  //   console.log(666,filteredData);
    
  //   return filteredData;
  // }

  async getAmountHistory(limit:number,id_user:string): Promise<TransactionEntity[]>{
    const query = await this.transactionRepository
      .createQueryBuilder('entity')
      .where(
        'entity.sourceAccount = :id_user or entity.destinationAccount = :id_user',
        { id_user },
      )
      .orderBy('entity.create_date', 'DESC')
      .limit(limit)
      .getMany();
    return query;
  }
}
