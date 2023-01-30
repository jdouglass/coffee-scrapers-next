import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import { IProduct } from '../interfaces/product';
import { v5 as uuidv5 } from 'uuid';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { IWordpressProductResponseData } from '../interfaces/wordpress/wordpressResponseData.interface';
import { load } from 'cheerio';

dotenv.config();

export default class Helper {
  static namespace: string = 'f2360818-52f8-4f09-b463-8a3887f56810';
  static region: string = process.env.AWS_BUCKET_REGION;
  static bucket: string = process.env.AWS_BUCKET_NAME;
  static accessKeyId: string = process.env.AWS_ACCESS_KEY_ID;
  static secretAccessKey: string = process.env.AWS_SECRET_ACCESS_KEY;
  static s3Client: S3Client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
    },
  });

  static firstLetterUppercase = (input: string[]): string[] => {
    for (let i = 0; i < input.length; i++) {
      input[i] = input[i]
        .toLowerCase()
        .split(/\s+/)
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    }
    return input;
  };

  static convertToUniversalVariety = (varieties: string[]): string[] => {
    for (let i = 0; i < varieties.length; i++) {
      switch (varieties[i]) {
        case 'Sl14':
        case 'Sl-14':
        case 'Sl 14':
        case 'Sl - 14':
          varieties[i] = 'SL-14';
          break;
        case 'Sl28':
        case 'Sl-28':
        case 'Sl 28':
        case 'Sl - 28':
          varieties[i] = 'SL-28';
          break;
        case 'Sl34':
        case 'Sl-34':
        case 'Sl 34':
        case 'Sl - 34':
          varieties[i] = 'SL-34';
          break;
        case 'Sl38':
        case 'Sl - 38':
          varieties[i] = 'SL-38';
          break;
        case 'Jarc':
        case 'Jarc 74110':
        case 'Jarc Varietals':
        case 'Landrace':
        case 'Landrace Cultivar':
        case 'Landrace Varietals':
        case 'local landrace':
        case 'Local Landrace':
        case 'Local Landraces':
        case 'Local Varieties':
        case 'Landrace Varieties':
        case 'Landrace Cultivars':
        case 'Regional Landraces':
        case 'Ethiopian Landrace':
        case 'Ethiopian Landrace - 74110':
        case 'Jimma Research Varietals 74110':
        case '71158':
        case '74110':
        case '74112':
        case '74148':
        case '74158':
          varieties[i] = 'Ethiopian Landraces';
          break;
        case 'Blend':
        case 'Field Blend':
        case 'Mixed':
          varieties[i] = 'Various';
          break;
        case 'Geisha':
          varieties[i] = 'Gesha';
          break;
        case 'Ihcafe90':
          varieties[i] = 'IHCafe90';
          break;
        case 'Yellow-bourbon':
        case 'Yellow bourbon':
          varieties[i] = 'Yellow Bourbon';
          break;
        case 'Riuru':
          varieties[i] = 'Ruiru';
          break;
        case 'Yellow Catuaí':
        case 'Yellow Catuia':
          varieties[i] = 'Yellow Catuai';
          break;
        case 'Red Catuaí':
          varieties[i] = 'Red Catuai';
          break;
        case 'Yellow Catarrh':
          varieties[i] = 'Yellow Caturra';
          break;
        case 'Mostly Dega':
          varieties[i] = 'Dega';
          break;
        case 'Anacafé 14':
          varieties[i] = 'Anacafe 14';
          break;
        case 'Kureme':
          varieties[i] = 'Kurume';
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
      case 'Fully Washed':
        process = 'Washed';
        break;
    }
    return process;
  };

  static convertToUniversalBrand = (brand: string): string => {
    switch (brand) {
      case '3FE':
        brand = '3fe';
        break;
      case 'Abracadbra':
        brand = 'Abracadabra';
        break;
    }
    return brand;
  };

  static uploadToS3 = async (product: IProduct): Promise<string> => {
    const key: string = uuidv5(product.productUrl, this.namespace);
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: await this.getBase64FromImageUrl(product.imageUrl),
      ContentEncoding: 'base64',
      ContentType: 'image/webp',
    };
    let collectionImageUrl: string = product.imageUrl;
    try {
      await this.s3Client.send(new PutObjectCommand(params));
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
    const key: string = uuidv5(productUrl, this.namespace);
    const params: DeleteObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
    };
    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (err) {
      console.log('Error', err);
    }
  };

  private static getBase64FromImageUrl = async (
    imageUrl: string
  ): Promise<Buffer> => {
    return await axios
      .get(imageUrl, { responseType: 'arraybuffer' })
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return sharp(Buffer.from(response.data))
          .resize(350, null)
          .toFormat('webp')
          .toBuffer();
      });
  };

  public static getPageTitle = async (productUrl: string): Promise<string> => {
    return (await axios(productUrl).then((res) => {
      if (res.data) {
        const $ = load(res.data as string);
        return $('head > title').text();
      }
    })) as string;
  };
}
