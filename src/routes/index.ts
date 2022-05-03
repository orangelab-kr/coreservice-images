import express, { Router } from 'express';
import {
  $$$,
  clusterInfo,
  Image,
  ImageProperty,
  RESULT,
  UserMiddleware,
  Wrapper,
} from '..';
import { ContentTypeMiddleware } from '../middlewares/contentType';
import { Multer } from '../tools/multer';

export function getRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req) => {
      throw RESULT.SUCCESS({ details: clusterInfo });
    })
  );

  router.post(
    '/',
    UserMiddleware(),
    ContentTypeMiddleware(),
    Wrapper(async (req) => {
      const { query } = req;
      const { user } = req.loggined;
      let image: ImageProperty;
      if (req.file) {
        image = await Image.getConvertedImage(req.file.buffer, query);
      } else if (req.body && req.body.length) {
        image = await Image.getConvertedImage(req.body, query);
      } else {
        throw RESULT.IMAGE_NOT_INCLUDED();
      }

      const { metadata, buffer, encryptKey } = image;
      const { imageId } = await $$$(
        Image.createImage({ user, metadata, encryptKey })
      );

      const url = `${process.env.CDN_IMAGES_URL}/${imageId}`;
      Image.uploadToS3(imageId, buffer);
      throw RESULT.SUCCESS({ details: { url } });
    })
  );

  return router;
}
