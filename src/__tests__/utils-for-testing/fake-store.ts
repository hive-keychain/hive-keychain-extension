import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from 'src/popup/multichain/reducers';

// const composeEnhancers = composeWithDevTools({
//   realtime: true,
//   port: 8000,
// });
// Wrap multichain reducers to expose hive slice keys at root for legacy tests
const legacyCompatReducer = (state: any, action: any) => {
  const nextState = reducers(state, action);
  if (nextState && nextState.hive) {
    // Flatten hive sub-tree onto root (non-destructive)
    return { ...nextState, ...nextState.hive };
  }
  return nextState;
};

const fakeStore = createStore(
  legacyCompatReducer,
  /* preloadedState, */ applyMiddleware(thunk),
);

export const getFakeStore = (initialState?: RootState) => {
  return createStore(legacyCompatReducer, initialState, applyMiddleware(thunk));
};

export { fakeStore };

export type RootState = ReturnType<typeof fakeStore.getState>;
export type AppDispatch = typeof fakeStore.dispatch;
