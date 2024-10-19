import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(@InjectRepository(File) private repo: Repository<File>) {}

  async getFileById(id: number) {
    return await this.repo.findOneBy({ id });
  }

  async saveFile(obj: DeepPartial<File>) {
    const file = await this.repo.create();
    file.originalName = obj.originalName;
    file.mimeType = obj.mimeType;
    file.downloadUrl = obj.downloadUrl;
    file.fullPath = obj.fullPath;
    file.size = obj.size;
    return await this.repo.save(file);
  }
}
