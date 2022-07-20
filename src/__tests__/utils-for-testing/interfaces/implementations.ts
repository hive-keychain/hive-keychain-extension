import { Rpc } from '@interfaces/rpc.interface';
import { GetManifest } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

export interface KeyChainApiGetCustomData {
  witnessRanking?: { data: any };
  currenciesPrices?: { data: any };
  rpc?: { data: { rpc: Rpc } };
  phishingAccounts?: { data: string[] };
  extensionVersion?: { data: GetManifest };
  delegators?: { data: any };
}
