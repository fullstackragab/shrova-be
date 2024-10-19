import { Injectable, NotFoundException } from '@nestjs/common';
import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FileService } from './file.service';
import { File } from './file.entity';

config();

@Injectable()
export class StorageService {
  apiKey = `${process.env.FIREBASE_APIKEY}`;
  authDomain = `${process.env.FIREBASE_AUTHDOMAIN}`;
  projectId = `${process.env.FIREBASE_PROJECTID}`;
  storageBucket = `${process.env.FIREBASE_STORAGEBUCKET}`;
  messagingSenderId = `${process.env.FIREBASE_MESSAGINGSENDERID}`;
  appId = `${process.env.FIREBASE_APPID}`;

  firebaseConfig = {
    apiKey: this.apiKey,
    authDomain: this.authDomain,
    projectId: this.projectId,
    storageBucket: this.storageBucket,
    messagingSenderId: this.messagingSenderId,
    appId: this.appId,
  };

  constructor(private fileService: FileService) {
    initializeApp(this.firebaseConfig);
  }

  async upload(file: any) {
    const storage = getStorage();
    const storageRef = ref(storage, 'images/' + file.originalname);
    const metadata = {
      contentType: file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );

    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      name: file.originalname,
      type: file.mimetype,
      downloadUrl,
    };
  }

  async uploadFiles(files: Array<Express.Multer.File>) {
    const savedFilesArray = [];
    const storage = getStorage();

    for (const file of files) {
      const fullPath = uuidv4() + '/' + uuidv4() + extname(file.originalname);
      const metadata = {
        contentType: file.mimetype,
      };
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytesResumable(
        storageRef,
        file.buffer,
        metadata,
      );
      const downloadUrl = await getDownloadURL(snapshot.ref);
      const fileObj = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        downloadUrl,
        fullPath,
        size: file.size,
      };

      const savedFile = await this.fileService.saveFile(fileObj);
      savedFilesArray.push(savedFile);
    }

    return savedFilesArray;
  }

  async deleteFile(id: number) {
    const file = await this.fileService.getFileById(id);
    if (file) {
      const storage = getStorage();
      const fileRef = ref(storage, file.fullPath);
      return await deleteObject(fileRef);
    } else {
      throw new NotFoundException('File not found!');
    }
  }
}
