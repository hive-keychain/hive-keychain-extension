import { render as rtlRender } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { resetMessage } from '@popup/multichain/actions/message.actions';
import { RootState } from '@popup/multichain/store';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import { MessageContainerComponent } from 'src/common-ui/message-container/message-container.component';
import { CopyToastContainer } from 'src/common-ui/toast/copy-toast.component';

interface Props {
  children: React.ReactNode;
}

const initialReducerState = initialEmptyStateStore;

/** Mirrors `ChainRouter` message overlay so `setErrorMessage` / `setSuccessMessage` are visible in tests. */
const TestMessageOverlay = () => {
  const message = useSelector((state: RootState) => state.message);
  const dispatch = useDispatch();
  if (!message?.key) {
    return null;
  }
  return (
    <MessageContainerComponent
      message={message}
      onResetMessage={() => dispatch(resetMessage())}
    />
  );
};

const render = (
  ui: ReactElement,
  {
    initialState = initialReducerState,
    fakeStore = getFakeStore(initialState),
    ...renderOptions
  } = {},
) => {
  const Wrapper = ({ children }: Props) => {
    return (
      <Provider store={fakeStore}>
        {children}
        <TestMessageOverlay />
        <CopyToastContainer />
      </Provider>
    );
  };

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store: fakeStore,
  };
};
export * from '@testing-library/react';
export { render as customRender };
