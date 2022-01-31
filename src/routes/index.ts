import express, { Router } from 'express';
import { $$$, clusterInfo, Image, RESULT, UserMiddleware, Wrapper } from '..';

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
    express.raw({ type: '*/*', limit: '10mb' }),
    Wrapper(async (req) => {
      const { body, query } = req;
      const { user } = req.loggined;
      const { metadata, buffer, encryptKey } = await Image.getConvertedImage(
        body,
        query
      );

      const { imageId } = await $$$(
        Image.createImage({ user, metadata, encryptKey })
      );

      const url = `${process.env.CDN_IMAGES_URL}/${imageId}`;
      await Image.uploadToS3(imageId, buffer);
      throw RESULT.SUCCESS({ details: { url } });
    })
  );

  return router;
}
