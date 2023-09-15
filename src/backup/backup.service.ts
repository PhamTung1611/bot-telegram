import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BackupEntity } from './backup.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BackupService {
    constructor(@InjectRepository(BackupEntity) private readonly backupRepository:Repository<BackupEntity>){}

    async createBackup(jsonData:any){
        const backup = this.backupRepository.create(jsonData);
        const createBackup = await this.backupRepository.save(backup);
        if (createBackup) {
            return true;
        }
    }

    async checkUser(username:string){
        const User = await this.backupRepository.findOne({where:{userTelegram:username}});
        if(User){
            return 'true';
        }else{
            return 'false'
        }
    }

    async getMoneyBackUp(username:string){
        const User = await this.backupRepository.findOne({where:{userTelegram:username}});
        if(User){
            return User.backupMoney;
        }
    }

    async deleteByUserTelegram(userTelegram: string) {
        const findUser = await this.backupRepository.findOne({
            where:{
                userTelegram:userTelegram
            }
        });
        // if(findUser){
        //     console.log(123);
        //     await this.backupRepository.remove(findUser);
        //     return 'true';
        // }else{
        //     return 'false';
        // }
        try {
            // Thử xóa dữ liệu
            await this.backupRepository.remove(findUser);
          } catch (error) {
            console.error('Lỗi khi xóa dữ liệu:', error);
          }
      }

      async updateMoneyBackup(userTelegram: string,money:string){
        const checkUser = await this.backupRepository.findOne({
            where: {
                userTelegram: userTelegram
            }
        })
        if (checkUser &&
            Number(money) > 0
        ) {
            const blance = Number(Number(checkUser.backupMoney)+Number(money));
            await this.backupRepository.update(checkUser.id,{backupMoney:String(blance)});
            return true;
        } else {
            return false;
        }
      }

}
