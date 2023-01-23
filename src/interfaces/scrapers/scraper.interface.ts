export interface IScraper {
  getContinent: (country: string) => string;
  getProcessCategory: (process: string) => string;
}
