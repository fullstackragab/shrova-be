import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { config } from 'dotenv';
config();

@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (file) return this.storageService.upload(file);
  }

  @Post('delete/:id')
  @UseInterceptors(FileInterceptor('file'))
  async deleteFile(@Param('id') id) {
    return await this.storageService.deleteFile(id);
  }

  @Post('upload-files')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
    return await this.storageService.uploadFiles(files);
  }
}
