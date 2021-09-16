import express, { Router } from 'express';
import { $$$, clusterInfo, Image, OPCODE, UserMiddleware, Wrapper } from '..';

export function getRouter(): Router {
  const router = Router();

  router.get(
    '/',
    Wrapper(async (req, res) => {
      res.json({ opcode: OPCODE.SUCCESS, ...clusterInfo });
    })
  );

  router.post(
    '/',
    UserMiddleware(),
    express.raw({ type: '*/*', limit: '10mb' }),
    Wrapper(async (req, res) => {
      const { user } = req.loggined;
      const { metadata, buffer } = await Image.getConvertedImage(req.body);
      const { imageId } = await $$$(Image.createImage({ user, metadata }));
      const url = `${process.env.CDN_IMAGES_URL}/${imageId}`;
      await Image.uploadToS3(imageId, buffer);
      res.json({ opcode: OPCODE.SUCCESS, url });
    })
  );

  return router;
}
