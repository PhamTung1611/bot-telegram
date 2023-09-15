import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupEntity } from './backup.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([BackupEntity])
  ],
  providers: [BackupService]
})
export class BackupModule {}
