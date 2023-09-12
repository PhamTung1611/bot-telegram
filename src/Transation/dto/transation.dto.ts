import { IsNotEmpty } from 'class-validator';

export class createTransation {
    @IsNotEmpty()
    price:number;
    @IsNotEmpty()
    desc:string;
    @IsNotEmpty()
    create_date:Date;
}