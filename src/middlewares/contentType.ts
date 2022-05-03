import { WrapperCallback, Wrapper, RESULT } from '..';
import { Multer } from '../tools/multer';
import express from 'express';

export function ContentTypeMiddleware(): WrapperCallback {
  return Wrapper(async (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (!contentType) throw RESULT.IMAGE_NOT_INCLUDED();
    const middleware = contentType.includes('multipart/form-data')
      ? Multer.single('image')
      : express.raw({ type: '*/*', limit: '10mb' });

    middleware(req, res, next);
  });
}
