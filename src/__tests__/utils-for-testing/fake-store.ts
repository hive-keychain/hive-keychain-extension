import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from 'src/popup/hive/reducers';

// const composeEnhancers = composeWithDevTools({
//   realtime: true,
//   port: 8000,
// });
const fakeStore = createStore(
  reducers,
  /* preloadedState, */ applyMiddleware(thunk),
);

export const getFakeStore = (initialState?: RootState) => {
  return createStore(reducers, initialState, applyMiddleware(thunk));
};

export { fakeStore };

export type RootState = ReturnType<typeof fakeStore.getState>;
export type AppDispatch = typeof fakeStore.dispatch;
