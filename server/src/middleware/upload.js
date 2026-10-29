// server/src/middleware/upload.js
// Multer setup for client exercise video uploads

import multer from 'multer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = resolve(__dirname, '../../../uploads');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop() || 'mp4';
    cb(null, `${uuidv4()}.${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_UPLOAD_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are permitted.'));
    }
  },
});
