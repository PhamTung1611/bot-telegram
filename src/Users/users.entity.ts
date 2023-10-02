import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    id_user: string

    @Column()
    user_name: string;

    @Column({ default: 0 })
    blance: string;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    create_date: Date;

}