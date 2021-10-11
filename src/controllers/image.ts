import { ImageModel, Prisma } from '@prisma/client';
import AWS from 'aws-sdk';
import Sharp from 'sharp';
import { prisma, UserModel } from '..';

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
  }): Promise<() => Prisma.Prisma__ImageModelClient<ImageModel>> {
    const metadata: any = props.metadata;
    const { userId } = props.user;
    return () =>
      prisma.imageModel.create({
        data: { userId, metadata },
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
    object: Buffer
  ): Promise<{ buffer: Buffer; metadata: Sharp.Metadata }> {
    const sharp = Sharp(object);
    const metadata = await sharp.metadata();
    delete metadata.tifftagPhotoshop;
    delete metadata.exif;
    delete metadata.icc;
    delete metadata.iptc;
    delete metadata.xmp;

    const height = this.getSize(metadata.height, this.maxHeight);
    const width = this.getSize(metadata.width, this.maxWidth);
    const buffer = await sharp
      .resize({ height, width, fit: 'inside' })
      .toFormat('webp', { quality: 100 })
      .toBuffer();

    return { buffer, metadata };
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
