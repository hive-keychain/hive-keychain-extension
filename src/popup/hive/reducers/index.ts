import { RpcSwitcherReducer } from '@popup/hive/reducers/rpc-switcher.reducer';
import TokensPendingUnstakingReducer from '@popup/hive/reducers/tokens-pending-unstaking.reducer';
import VscReducer from '@popup/hive/reducers/vsc.reducer';
import { combineReducers } from 'redux';
import { ActiveAccountReducer } from 'src/popup/hive/reducers/active-account.reducer';
import { ActiveRpcReducer } from 'src/popup/hive/reducers/active-rpc.reducer';
import { AppStatusReducer } from 'src/popup/hive/reducers/app-status.reducer';
import ConversionsReducer from 'src/popup/hive/reducers/conversion.reducer';
import CurrencyPricesReducer from 'src/popup/hive/reducers/currency-prices.reducer';
import DelegationsReducer from 'src/popup/hive/reducers/delegation.reducer';
import GlobalPropertiesReducer from 'src/popup/hive/reducers/global-properties.reducer';
import HiveEngineConfigReducer from 'src/popup/hive/reducers/hive-engine-config.reducer';
import { PhishingReducer } from 'src/popup/hive/reducers/phishing.reducer';
import TokenHistoryReducer from 'src/popup/hive/reducers/token-history.reducer';
import TokenMarketReducer from 'src/popup/hive/reducers/token-market.reducer';
import TokensReducer from 'src/popup/hive/reducers/tokens.reducer';
import transactionsReducer from 'src/popup/hive/reducers/transactions.reducer';
import UserTokensReducer from 'src/popup/hive/reducers/user-token.reducer';
import { AccountReducer } from './account.reducer';

const hiveReducers = combineReducers({
  accounts: AccountReducer,
  activeAccount: ActiveAccountReducer,
  activeRpc: ActiveRpcReducer,
  currencyPrices: CurrencyPricesReducer,
  globalProperties: GlobalPropertiesReducer,
  delegations: DelegationsReducer,
  conversions: ConversionsReducer,
  phishing: PhishingReducer,
  transactions: transactionsReducer,
  userTokens: UserTokensReducer,
  tokens: TokensReducer,
  tokenHistory: TokenHistoryReducer,
  tokenMarket: TokenMarketReducer,
  hiveEngineConfig: HiveEngineConfigReducer,
  appStatus: AppStatusReducer,
  rpcSwitcher: RpcSwitcherReducer,
  tokensPendingUnstaking: TokensPendingUnstakingReducer,
  vscBalance: VscReducer,
});

export default hiveReducers;
