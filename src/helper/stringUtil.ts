export class StringUtil {
  static capitalizeFirstLetters(str: string): string {
    return str.replace(/\b\w/g, (match) => match.toUpperCase());
  }

  static convertAndToComma(str: string): string {
    return str.replace(/(\+|&|,?\s+(and|&amp;)\s+)/g, ', ');
  }

  static removeHtmlTags(str: string): string {
    return str.replace(/<\/?[^>]+(>|$)/g, '');
  }
}
