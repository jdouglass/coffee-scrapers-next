import { worldData } from '../data/worldData';

export default class Helper {
  static firstLetterUppercase = (input: string[]): string[] => {
    return input.map((word: string) => {
      if (word.includes(' ')) {
        let subWord: string[] = word.split(' ');
        subWord = this.firstLetterUppercase(subWord);
      }
      return ''.concat(word[0].toUpperCase(), word.substring(1).toLowerCase());
    });
  };

  static convertToUniversalVariety = (varieties: string[]): string[] => {
    return varieties.map((variety) => {
      if (variety === 'Sl28') {
        variety = 'SL28';
      } else if (variety === 'Sl34') {
        variety = 'SL34';
      } else if (variety === 'Landrace Cultivar') {
        variety = 'Ethiopian Landraces';
      } else if (variety === 'Blend') {
        variety = 'Various';
      }
      return variety;
    });
  };
}
