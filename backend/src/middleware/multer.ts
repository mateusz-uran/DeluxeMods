import { RequestHandler } from 'express';
import multer, { StorageEngine } from 'multer';

const storage: StorageEngine = multer.memoryStorage();

const multerUpload: RequestHandler = multer({ storage }).single('photo');

export default multerUpload;
