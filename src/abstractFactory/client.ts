import { MonogramClient } from '../clients/monogramClient';
import { PiratesClient } from '../clients/piratesClient';

const main = async (): Promise<void> => {
  await MonogramClient.run();
  await PiratesClient.run();
};

void main();
