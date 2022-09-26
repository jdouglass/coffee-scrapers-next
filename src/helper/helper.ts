export default class Helper {
  static firstLetterUppercase = (input: string[]): string[] => {
    return input.map((word: string) => {
      while (word.includes(' ')) {
        let subWord: string[] = word.split(' ');
        subWord = this.firstLetterUppercase(subWord);
        return subWord.join(' ');
      }
      return ''.concat(word[0].toUpperCase(), word.substring(1).toLowerCase());
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
}
