import { Rpc } from '@interfaces/rpc.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import { TokenBalance, TokenMarket } from '@interfaces/tokens.interface';
import { WhatsNewContent } from 'src/popup/hive/pages/app-container/whats-new/whats-new.interface';

export interface KeyChainApiGetCustomData {
  witnessRanking?: any;
  currenciesPrices?: any;
  rpc?: { rpc: Rpc };
  phishingAccounts?: string[];
  extensionVersion?: WhatsNewContent;
  delegators?: any;
}

export interface FindSmartContractsHive {
  getUserBalance?: any | TokenBalance[];
  getIncomingDelegations?: any | TokenDelegation[];
  getOutgoingDelegations?: any | TokenDelegation[];
  getAllTokens?: any | any[];
  getTokensMarket?: any | TokenMarket[];
}
