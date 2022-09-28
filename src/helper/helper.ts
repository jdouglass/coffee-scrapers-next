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

export default class Helper {
  static namespace: string = 'f2360818-52f8-4f09-b463-8a3887f56810';
  static region: string = 'ca-central-1';
  static bucket: string = 'collection-coffee-product-images-dev';
  static s3Client: S3Client = new S3Client({ region: this.region });

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
        case 'Sl28':
          varieties[i] = 'SL28';
          break;
        case 'Sl34':
          varieties[i] = 'SL34';
          break;
        case 'Landrace Cultivar':
          varieties[i] = 'Ethiopian Landraces';
          break;
        case 'Blend':
          varieties[i] = 'Various';
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

  static getBase64FromImageUrl = async (imageUrl: string): Promise<Buffer> => {
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
