export interface IScraper {
  getContinent: (country: string) => string;
  getDateAdded: (date: string) => string;
  getHandle: (handle: string) => string;
  getProcessCategory: (process: string) => string;
}
