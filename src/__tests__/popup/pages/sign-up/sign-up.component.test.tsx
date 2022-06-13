import { Manabar } from '@hiveio/dhive/lib/chain/rc';
import App from '@popup/App';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import utilsSignUp from 'src/__tests__/utils-for-testing/fake-data-utilsSignUp';
import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import customMocks from 'src/__tests__/utils-for-testing/mocks';

const chrome = require('chrome-mock');
global.chrome = chrome;
jest.setTimeout(10000);
let fakeStore = getFakeStore(initialEmptyStateStore);
const wrapperStore: FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider store={fakeStore}>{children}</Provider>;
};

beforeEach(() => {
  customMocks.mocks.mocksApp(
    jest.fn(),
    customMocks.implementation.getValuefromLS,
    utilsSignUp.rpc,
    '',
    {} as Manabar,
    [],
    true,
    jest.fn(),
    jest.fn(),
    false,
    '',
    [],
    true,
    jest.fn(),
    jest.fn(),
    customMocks.implementation.i18nGetMessage,
    jest.fn(),
  );
  jest.useFakeTimers('legacy');
  act(() => {
    jest.advanceTimersByTime(4300);
  });
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  cleanup();
});
describe('sign-up.component tests:\n', () => {
  it('Must show sign-up page', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const signUpComponent = (await screen.findByLabelText(
      utilsSignUp.signUpComponentAL,
    )) as HTMLInputElement;
    expect(signUpComponent).toBeDefined();
  });
  it('Must show error message when using different passwords and pressing enter', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(
        passwordInputComponent,
        '@1qEWqw!!',
      );
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        '@1qEWqw{enter}',
      );
    });
    await waitFor(() => {
      expect(screen.getByText(utilsSignUp.erroMessages.noMatch)).toBeDefined();
    });
  });
  it('Must show error message when using different passwords and clicking button', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    const signUpButtonComponent = (await screen.findByLabelText(
      utilsSignUp.signUpButtonAL,
    )) as HTMLButtonElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(
        passwordInputComponent,
        '@1qEWqw!!',
      );
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        '@1qEWqw',
      );
      await utilsSignUp.userEventCustom.click(signUpButtonComponent);
    });
    await waitFor(() => {
      expect(screen.getByText(utilsSignUp.erroMessages.noMatch)).toBeDefined();
    });
  });
  it('Must show error message when invalid password and pressing enter', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(passwordInputComponent, '1qEWqw');
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        '1qEWqw{enter}',
      );
    });
    await waitFor(() => {
      expect(screen.getByText(utilsSignUp.erroMessages.invalid)).toBeDefined();
    });
  });
  it('Must show error message when invalid password and clicking button', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    const signUpButtonComponent = (await screen.findByLabelText(
      utilsSignUp.signUpButtonAL,
    )) as HTMLButtonElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(
        passwordInputComponent,
        'aAbcdswe',
      );
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        'aAbcdswe',
      );
      await utilsSignUp.userEventCustom.click(signUpButtonComponent);
    });
    await waitFor(() => {
      expect(screen.getByText(utilsSignUp.erroMessages.invalid)).toBeDefined();
    });
  });
  it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(
        passwordInputComponent,
        '1qEWqw23',
      );
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        '1qEWqw23{enter}',
      );
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText(utilsSignUp.addAccountMainComponentAL),
      ).toBeDefined();
    });
  });
  it('Must navigate to add_keys_page with valid password and clicking button', async () => {
    fakeStore = getFakeStore(initialEmptyStateStore);
    render(<App />, { wrapper: wrapperStore });
    const passwordInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputComponentAL,
    )) as HTMLInputElement;
    const confirmationInputComponent = (await screen.findByLabelText(
      utilsSignUp.inputConfirmationComponentAL,
    )) as HTMLInputElement;
    const signUpButtonComponent = (await screen.findByLabelText(
      utilsSignUp.signUpButtonAL,
    )) as HTMLButtonElement;
    //actions to signup
    await act(async () => {
      await utilsSignUp.userEventCustom.type(
        passwordInputComponent,
        '1qEWqw23',
      );
      await utilsSignUp.userEventCustom.type(
        confirmationInputComponent,
        '1qEWqw23',
      );
      await utilsSignUp.userEventCustom.click(signUpButtonComponent);
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText(utilsSignUp.addAccountMainComponentAL),
      ).toBeDefined();
    });
  });
});
