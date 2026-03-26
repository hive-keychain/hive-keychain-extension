import reducers from 'src/popup/multichain/reducers';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

const enhancer = applyMiddleware(thunk);

/** Same root reducer as the popup app (includes `hive` slice). */
const fakeStore = createStore(reducers, enhancer);

export const initialEmptyStateStore = fakeStore.getState();

export const getFakeStore = (initialState?: RootState) => {
  return createStore(reducers, initialState, enhancer);
};

export { fakeStore };

export type RootState = ReturnType<typeof fakeStore.getState>;
export type AppDispatch = typeof fakeStore.dispatch;
