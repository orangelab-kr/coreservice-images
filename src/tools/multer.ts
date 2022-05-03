import multer from 'multer';

export const Multer = multer({ limits: { fileSize: 1000000 } });
