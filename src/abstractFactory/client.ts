import { MonogramClient } from '../clients/monogramClient';
import { PiratesClient } from '../clients/piratesClient';
import { RevolverClient } from '../clients/revolverClient';

const main = async (): Promise<void> => {
  await MonogramClient.run();
  await PiratesClient.run();
  await RevolverClient.run();
};

void main();
