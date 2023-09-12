import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { log } from 'console';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class TransactionService {

    constructor(@InjectRepository(TransactionEntity) private readonly transactionRepository: Repository<TransactionEntity>) { }

    async createRecharge(json: any) {
        const createData = this.transactionRepository.create(json);
        const saveCreate = await this.transactionRepository.save(createData);
        if(saveCreate){
            return true;
        }
    }


    // async createUser(jsonData: any) {
    //     const user = this.userRepository.create(jsonData);
    //     const createUser = await this.userRepository.save(user);
    //     if (createUser) {
    //         return true;
    //     }
    // }
}
