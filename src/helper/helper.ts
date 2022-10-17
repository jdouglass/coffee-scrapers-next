import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import { IProduct } from '../interfaces/product';
import { v5 as uuidv5 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

export default class Helper {
  static namespace: string = 'f2360818-52f8-4f09-b463-8a3887f56810';
  static region: string = 'ca-central-1';
  static bucket: string = process.env.AWS_BUCKET_NAME as string;
  static accessKeyId: string = process.env.AWS_ACCESS_KEY_ID as string;
  static secretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY as string;
  static s3Client: S3Client = new S3Client({
    region: Helper.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  static firstLetterUppercase = (input: string[]): string[] => {
    return input.map((word: string) => {
      while (word.includes(' ')) {
        let subWord: string[] = word.split(' ');
        subWord = this.firstLetterUppercase(subWord);
        return subWord.join(' ');
      }
      return word[0].toUpperCase() + word.substring(1).toLowerCase();
    });
  };

  static convertToUniversalVariety = (varieties: string[]): string[] => {
    for (let i = 0; i < varieties.length; i++) {
      switch (varieties[i]) {
        case 'Sl14':
        case 'Sl-14':
          varieties[i] = 'SL14';
          break;
        case 'Sl28':
        case 'Sl-28':
          varieties[i] = 'SL28';
          break;
        case 'Sl34':
        case 'Sl-34':
          varieties[i] = 'SL34';
          break;
        case 'Landrace Cultivar':
        case 'Local Landrace':
        case 'Local Varieties':
        case 'Landrace Varieties':
        case 'Regional Landraces':
        case 'Ethiopian Landraces':
        case 'Ethiopian Landrace - 74110':
        case '71158':
        case '74110':
        case '74148':
          varieties[i] = 'Ethiopian Landraces';
          break;
        case 'Blend':
          varieties[i] = 'Various';
          break;
        case 'Geisha':
          varieties[i] = 'Gesha';
          break;
      }
    }
    return varieties;
  };

  static convertToUniversalProcess = (process: string): string => {
    switch (process) {
      case 'Anaerobic Natural Process':
        process = 'Anaerobic Natural';
        break;
    }
    return process;
  };

  static uploadToS3 = async (product: IProduct): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const key: string = uuidv5(product.productUrl, this.namespace);
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: await this.getBase64FromImageUrl(product.imageUrl),
      ContentEncoding: 'base64',
      ContentType: await this.getImageType(product.imageUrl),
    };
    let collectionImageUrl: string = product.imageUrl;
    try {
      const data: PutObjectCommandOutput = await this.s3Client.send(
        new PutObjectCommand(params)
      );
      collectionImageUrl =
        'https://' +
        this.bucket +
        '.s3.' +
        this.region +
        '.amazonaws.com/' +
        key;
    } catch (err) {
      console.log('Error', err);
    }
    return collectionImageUrl;
  };

  static deleteFromS3 = async (productUrl: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const key: string = uuidv5(productUrl, this.namespace);
    const params: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
    };
    try {
      const data = await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (err) {
      console.log('Error', err);
    }
  };

  private static getBase64FromImageUrl = async (
    imageUrl: string
  ): Promise<Buffer> => {
    return await axios
      .get(imageUrl, { responseType: 'arraybuffer' })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .then((response) => Buffer.from(response.data));
  };

  private static getImageType = async (imageUrl: string): Promise<string> => {
    const image = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return image.headers['content-type'];
  };
}
