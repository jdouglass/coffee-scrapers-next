import axios from 'axios';
import { IProduct } from '../interfaces/product';
import { v5 as uuidv5 } from 'uuid';
import * as dotenv from 'dotenv';
import sharp from 'sharp';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import { Vendor } from '../enums/vendors';

dotenv.config();

export default class Helper {
  static namespace: string = 'f2360818-52f8-4f09-b463-8a3887f56810';
  static supabaseUrl: string = process.env.SUPABASE_URL as string;
  static supabaseApiKey: string = process.env.SUPABASE_API_KEY as string;
  static supabase = createClient(this.supabaseUrl, this.supabaseApiKey);
  static bucketName: string = 'collection-coffee-images';

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
        case 'Sl- 28':
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
        case 'Jarc 760':
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
        case 'Ethiopia Heirloom':
        case 'Ethiopian Heirloom':
        case 'Ethiopian Heirlooms':
        case 'Ethiopia Landraces':
        case 'Heirloom Ethiopia':
        case 'Heirloom Ethiopian Varieties':
        case 'Ethiopian Heirloom Varieties':
        case 'Jimma Research Varietals 74110':
        case '762':
        case '764':
        case '71158':
        case '74110':
        case '74112':
        case '74148':
        case '74158':
        case '74110':
        case '741165':
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
        case 'Ihcafe 90':
        case 'Ih90':
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
        case 'Deega':
          varieties[i] = 'Dega';
          break;
        case 'Anacafé 14':
          varieties[i] = 'Anacafe 14';
          break;
        case 'Kureme':
          varieties[i] = 'Kurume';
          break;
        case 'Ab':
          varieties[i] = 'AB';
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
      case 'ETHICA':
        brand = 'Ethica';
        break;
      case 'Hatch':
        brand = Vendor.Hatch;
        break;
      case 'House of Funk':
        brand = Vendor.HouseOfFunk;
        break;
      case 'Luna':
        brand = Vendor.Luna;
        break;
      case 'Pilot':
        brand = 'Pilot Coffee Roasters';
        break;
      case 'Rabbit Hole':
        brand = Vendor.RabbitHole;
        break;
      case 'Reanimator':
        brand = 'ReAnimator';
        break;
      case 'Rosso':
        brand = Vendor.Rosso;
        break;
      case 'Subtext':
        brand = Vendor.Subtext;
        break;
      case 'Thom Bargen':
        brand = Vendor.ThomBargen;
        break;
      case 'Traffic':
        brand = Vendor.Traffic;
        break;
      case 'Transcend':
        brand = Vendor.Transcend;
        break;
      case 'Prototype':
        brand = Vendor.Prototype;
        break;
    }
    return brand;
  };

  static uploadToBucket = async (product: IProduct) => {
    const key: string = uuidv5(product.productUrl, this.namespace);
    await this.supabase.storage
      .from(this.bucketName)
      .upload(key, await this.getBase64FromImageUrl(product.imageUrl), {
        contentType: 'image/webp',
      });
    const collectionImageUrl =
      this.supabaseUrl +
      '/storage/v1/object/public/collection-coffee-images/' +
      key;
    return collectionImageUrl;
  };

  static deleteFromBucket = async (productUrl: string) => {
    const key: string = uuidv5(productUrl, this.namespace);
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([key]);
    if (error) {
      console.error('Failed to delete image: ' + productUrl);
      console.error(error);
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
