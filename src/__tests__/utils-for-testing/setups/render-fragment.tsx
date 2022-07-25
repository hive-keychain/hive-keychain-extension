import App from '@popup/App';
import { render as rtlRender } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

interface Props {
  children: React.ReactNode;
}

const initialReducerState = initialEmptyStateStore;
/**
 * App is fixed.
 */
const render = ({
  initialState = initialReducerState,
  fakeStore = getFakeStore(initialState),
  ...renderOptions
} = {}) => {
  const Wrapper = ({ children }: Props) => {
    return <Provider store={fakeStore}>{children}</Provider>;
  };

  return rtlRender(<App />, { wrapper: Wrapper, ...renderOptions });
};
export * from '@testing-library/react';
export { render as customRenderFixed };
