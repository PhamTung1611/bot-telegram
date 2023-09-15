import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users.entity';

@Injectable()
export class UsersService {

    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) { }

    async createUser(jsonData: any) {
        const user = this.userRepository.create(jsonData);
        const createUser = await this.userRepository.save(user);
        if (createUser) {
            return true;
        }
    }
    async withDrawMoney(id_user: number, money: number){
        const checkUser = await this.userRepository.findOne({
            where: {
                id_user: String(id_user)
            }
        }) 
        if (checkUser && Number(money) > 0) {

            const blance = Number(Number(checkUser.blance) - Number(money));
            if(blance <= 0){
                return 'False';
            }else{
                await this.userRepository.update(checkUser.id,{blance:blance});
                return 'true';
            }
        } 

    }
    async updateMoney(id_user: number, money: number) {
        const checkUser = await this.userRepository.findOne({
            where: {
                id_user: String(id_user)
            }
        })
        if (checkUser &&
            Number(money) > 0
        ) {
            const blance = Number(Number(checkUser.blance)+Number(money));
            await this.userRepository.update(checkUser.id,{blance:blance});
            return true;
        } else {
            return false;
        }
    }

    async findOneUser(id_user: number) {
        const User = await this.userRepository.findOne({ where: { id_user: String(id_user) } });
        if (User) {
            return 'pass';
        } else {
            return 'fail'
        }
    }

    async CheckMoney(id: number) {
        const User = await this.userRepository.findOne({ where: { id_user: String(id) } });
        if (User) {
            return User.blance;
        }else{
            return 'false';
        }
    }

    async checkUserName(username:string){
        const User = await this.userRepository.findOne({where:{user_name:username}});
        if(User){
            return 'true';
        }else{
            return 'false'
        }
    }

    async checkName(id:string){
        const User = await this.userRepository.findOne({where:{id_user:id}});
        if(User){
            return User.user_name;
        }
    }

    async updateWalletUsername(username:string,money:number){
        const User = await this.userRepository.findOne({where:{user_name:username}});
        if(User){
            const blance = Number(Number(User.blance)+Number(money));
            await this.userRepository.update(User.id,{blance:blance});
            return true;
        }else{
            return false;
        }
    }

    async updateWalletUserID(id:string,money:number){
        const User = await this.userRepository.findOne({where:{id_user:id}});
        if(User){
            const blance = Number(Number(User.blance)+Number(money));
            await this.userRepository.update(User.id,{blance:blance});
            return true;
        }else{
            return false;
        }
    }

    async checkID(user:string){
        const id = await this.userRepository.findOne({where:{
            user_name:user
        }});
        if(id){
            return id.id_user;
        }else{
            return 'false';
        }
    }

    async checkIdUser(id_user:string){
        const id = await this.userRepository.findOne({where:{
            id_user:id_user
        }});
        if(id){
            return id.id_user;
        }else{
            return 'false';
        }
    }

    async checkInfo(id_user:string): Promise<UserEntity>{
        return await this.userRepository.findOne({where:{
            id_user:id_user
        }});

    }

}
