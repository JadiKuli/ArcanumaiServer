import { memoryStorage } from 'multer';

const MulterConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
};

export default MulterConfig;
