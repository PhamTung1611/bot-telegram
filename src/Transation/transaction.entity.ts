import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class TransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    price: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    sourceAccount: string;

    @Column({ nullable: true })
    destinationAccount: string;

    @Column()
    create_date: Date;
}
