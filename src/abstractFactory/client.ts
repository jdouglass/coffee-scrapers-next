import { MonogramClient } from '../clients/monogramClient';
import { PiratesClient } from '../clients/piratesClient';
import { RevolverClient } from '../clients/revolverClient';
import { RossoClient } from '../clients/rossoClient';
import RossoScraper from './rossoScraper';

const main = async (): Promise<void> => {
  await MonogramClient.run();
  await PiratesClient.run();
  await RevolverClient.run();
  await RossoClient.run();
};

void main();
