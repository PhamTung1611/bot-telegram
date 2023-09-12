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

    async updateMoney(id_user: number, money: number) {
        const checkUser = await this.userRepository.findOne({
            where: {
                id_user: id_user
            }
        })
        if (checkUser &&
            Number(money) > 0
        ) {
            const blance = Number(Number(checkUser.blance)+Number(money));
            await this.userRepository.update(checkUser.id,{blance:blance});
            return "pass";
        } else {
            return "fail";
        }
    }

    async findOneUser(id_user: number) {
        const User = await this.userRepository.findOne({ where: { id_user: id_user } });
        if (User) {
            return 'pass';
        } else {
            return 'fail'
        }
    }

    async CheckMoney(id: number) {
        const User = await this.userRepository.findOne({ where: { id_user: id } });
        if (User) {
            return User.blance;
        }
    }

}
