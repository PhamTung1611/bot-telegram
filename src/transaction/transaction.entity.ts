import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TransactionEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    sourceAccount:string;

    @Column()
    destinationAccount:string;

    @Column()
    price:string;

    @Column()
    type:string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    create_date: Date;
}