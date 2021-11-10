import { ActiveAccountReducer } from '@popup/reducers/active-account.reducer';
import { ActiveRpcReducer } from '@popup/reducers/active-rpc.reducer';
import BittrexReducer from '@popup/reducers/bittrex.reducer';
import ConversionsReducer from '@popup/reducers/conversion.reducer';
import DelegationsReducer from '@popup/reducers/delegation.reducer';
import GlobalPropertiesReducer from '@popup/reducers/global-properties.reducer';
import { PhishingReducer } from '@popup/reducers/phishing.reducer';
import TokenHistoryReducer from '@popup/reducers/token-history.reducer';
import TokenMarketReducer from '@popup/reducers/token-market.reducer';
import TokensReducer from '@popup/reducers/tokens.reducer';
import transactionsReducer from '@popup/reducers/transactions.reducer';
import UserTokensReducer from '@popup/reducers/user-token.reducer';
import { combineReducers } from 'redux';
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
  bittrex: BittrexReducer,
  globalProperties: GlobalPropertiesReducer,
  delegations: DelegationsReducer,
  conversions: ConversionsReducer,
  phishing: PhishingReducer,
  transactions: transactionsReducer,
  userTokens: UserTokensReducer,
  tokens: TokensReducer,
  tokenHistory: TokenHistoryReducer,
  tokenMarket: TokenMarketReducer,
});
