import { Rpc } from '@interfaces/rpc.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';

export interface KeyChainApiGetCustomData {
  witnessRanking?: { data: any };
  currenciesPrices?: { data: any };
  rpc?: { data: { rpc: Rpc } };
  phishingAccounts?: { data: string[] };
  extensionVersion?: { data: WhatsNewContent };
  delegators?: { data: any };
}

export interface FindSmartContractsHive {
  getUserBalance?: any | TokenBalance[];
  getIncomingDelegations?: any | TokenDelegation[];
  getOutgoingDelegations?: any | TokenDelegation[];
  getAllTokens?: any | any[];
  getTokensMarket?: any | TokenMarket[];
}
