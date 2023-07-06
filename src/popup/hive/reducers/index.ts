import { combineReducers } from 'redux';
import { ActiveAccountReducer } from 'src/popup/hive/reducers/active-account.reducer';
import { ActiveRpcReducer } from 'src/popup/hive/reducers/active-rpc.reducer';
import { AppStatusReducer } from 'src/popup/hive/reducers/app-status.reducer';
import ConversionsReducer from 'src/popup/hive/reducers/conversion.reducer';
import CurrencyPricesReducer from 'src/popup/hive/reducers/currency-prices.reducer';
import DelegationsReducer from 'src/popup/hive/reducers/delegation.reducer';
import GlobalPropertiesReducer from 'src/popup/hive/reducers/global-properties.reducer';
import HiveEngineConfigReducer from 'src/popup/hive/reducers/hive-engine-config.reducer';
import { LoadingReducer } from 'src/popup/hive/reducers/loading.reducer';
import { PhishingReducer } from 'src/popup/hive/reducers/phishing.reducer';
import { TitleContainerReducer } from 'src/popup/hive/reducers/title-container.reducer';
import TokenHistoryReducer from 'src/popup/hive/reducers/token-history.reducer';
import TokenMarketReducer from 'src/popup/hive/reducers/token-market.reducer';
import TokensReducer from 'src/popup/hive/reducers/tokens.reducer';
import transactionsReducer from 'src/popup/hive/reducers/transactions.reducer';
import UserTokensReducer from 'src/popup/hive/reducers/user-token.reducer';
import { AccountReducer } from './account.reducer';
import { MessageReducer } from './message.reducer';
import { MkReducer } from './mk.reducer';
import { NavigationReducer } from './navigation.reducer';

export default combineReducers({
  mk: MkReducer,
  accounts: AccountReducer,
  activeAccount: ActiveAccountReducer,
  errorMessage: MessageReducer,
  navigation: NavigationReducer,
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
  loading: LoadingReducer,
  titleContainer: TitleContainerReducer,
  hiveEngineConfig: HiveEngineConfigReducer,
  appStatus: AppStatusReducer,
});
