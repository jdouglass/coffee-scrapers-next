import { MonogramClient } from '../clients/monogramClient';
import { PiratesClient } from '../clients/piratesClient';
import { RevolverClient } from '../clients/revolverClient';
import { RogueWaveClient } from '../clients/rogueWaveClient';
import { RossoClient } from '../clients/rossoClient';

const main = async (): Promise<void> => {
  await MonogramClient.run();
  await PiratesClient.run();
  await RevolverClient.run();
  await RossoClient.run();
  await RogueWaveClient.run();
};

void main();
