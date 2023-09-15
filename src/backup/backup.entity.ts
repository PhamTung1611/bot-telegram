import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('backup')
export class BackupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userTelegram: string;

  @Column({ nullable: true })
  backupMoney: string;

  @Column({ nullable: true })
  sourceAccount: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  create_date: Date;
}
