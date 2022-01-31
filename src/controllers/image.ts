import { ImageModel, Prisma } from '@prisma/client';
import AWS from 'aws-sdk';
import Sharp from 'sharp';
import { hash } from 'bcryptjs';
import { Joi, prisma, UserModel } from '..';
import crypto from 'crypto';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export class Image {
  public static maxHeight = 2048;
  public static maxWidth = 2048;
  public static s3 = new AWS.S3();

  public static basePath = process.env.CDN_IMAGES_URL
    ? process.env.CDN_IMAGES_URL.split('/').pop() || '/'
    : '/';

  public static async createImage(props: {
    user: UserModel;
    metadata: Sharp.Metadata;
    encryptKey?: string;
  }): Promise<() => Prisma.Prisma__ImageModelClient<ImageModel>> {
    const { metadata, encryptKey }: any = props;
    const { provider } = props.user;
    const userId = provider === 'hikick' ? props.user.userId : null;
    return () =>
      prisma.imageModel.create({
        data: { provider, userId, metadata, encryptKey },
      });
  }

  public static getSize(
    first?: number,
    second?: number,
    third?: number
  ): number {
    return Math.min(
      first || Number.MAX_SAFE_INTEGER,
      second || Number.MAX_SAFE_INTEGER,
      third || Number.MAX_SAFE_INTEGER
    );
  }

  public static async getConvertedImage(
    object: Buffer,
    props: { key?: string }
  ): Promise<{
    buffer: Buffer;
    metadata: Sharp.Metadata;
    encryptKey?: string;
  }> {
    const sharp = Sharp(object);
    const metadata = await sharp.metadata();
    const { key } = await Joi.object({
      key: Joi.string().optional(),
    }).validateAsync(props);

    delete metadata.tifftagPhotoshop;
    delete metadata.exif;
    delete metadata.icc;
    delete metadata.iptc;
    delete metadata.xmp;

    const height = this.getSize(metadata.height, this.maxHeight);
    const width = this.getSize(metadata.width, this.maxWidth);
    let buffer = await sharp
      .resize({ height, width, fit: 'inside' })
      .toFormat('webp', { quality: 100 })
      .toBuffer();

    let encryptKey;
    if (key) {
      const algorithm = 'aes-256-cbc';
      const iv = Buffer.alloc(16, 0);
      const cryptedKey = crypto.scryptSync(key, 'salt', 32);
      const cipher = crypto.createCipheriv(algorithm, cryptedKey, iv);
      buffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
      encryptKey = await hash(key, 10);
    }

    return { buffer, metadata, encryptKey };
  }

  public static async uploadToS3(key: string, buffer: Buffer): Promise<void> {
    await this.s3
      .putObject({
        Key: `${this.basePath}/${key}`,
        Bucket: String(process.env.AWS_BUCKET),
        Body: buffer,
      })
      .promise();
  }
}
