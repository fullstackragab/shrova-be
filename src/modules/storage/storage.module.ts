import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [StorageService, FileService],
  controllers: [StorageController],
  exports: [StorageService, FileService],
})
export class StorageModule {}
