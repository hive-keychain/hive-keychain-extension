import { render as rtlRender } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

interface Props {
  children: React.ReactNode;
}

const initialReducerState = initialEmptyStateStore;
/**
 * TODO: adding a feature to return the fakeStore.getState(), deciding 'before/after/both'
 * this may be useful when need to console while testing or checking specific changes in the state.
 * @param {boolean} debugState - It will console.log the state passed before rendering.
 **/
const render = (
  ui: ReactElement,
  {
    initialState = initialReducerState,
    fakeStore = getFakeStore(initialState),
    debugState = false,
    ...renderOptions
  } = {},
) => {
  if (debugState) {
    console.log('++++++Debugging State+++++');
    console.log(fakeStore.getState());
    console.log('++++++END Debugging State+++++');
  }
  const Wrapper = ({ children }: Props) => (
    <Provider store={fakeStore}>{children}</Provider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};
export * from '@testing-library/react';
export { render as customRender };
