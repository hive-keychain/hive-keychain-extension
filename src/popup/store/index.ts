import reducers from '@popup/reducers';
import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import AccountUtils from 'src/utils/account.utils';

const composeEnhancers = composeWithDevTools({});
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

let previousAccounts = store.getState().accounts;
store.subscribe(() => {
  const {accounts, mk} = store.getState();
  console.log(accounts, previousAccounts);
  if (previousAccounts !== accounts) {
    previousAccounts = accounts;
    AccountUtils.saveAccounts(accounts, mk);
  }
});

export {store};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
