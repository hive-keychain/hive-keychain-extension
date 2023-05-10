import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import alComponent from 'src/__tests__/utils-for-testing/aria-labels/al-component';
import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';
import configureTestMocking from 'src/__tests__/utils-for-testing/mocking-config/mocking-config';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
const tick = () => new Promise((res) => setImmediate(res));
describe('sign-up.component tests:\n', () => {
  configureTestMocking.set({
    app: {
      accountsRelated: {
        AccountUtils: {
          hasStoredAccounts: false,
          getAccountsFromLocalStorage: [],
        },
        ActiveAccountUtils: {
          getActiveAccountNameFromLocalStorage: '',
        },
        MkUtils: {
          getMkFromLocalStorage: '',
        },
      },
    },
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      initialEmptyStateStore,
    );
  });
  afterEach(() => cleanup());

  it('Must show sign up component', async () => {
    expect(screen.getByLabelText(alComponent.signUp)).toBeInTheDocument();
  });
  it('Must show error message when using different passwords and pressing enter', async () => {
    await act(async () => {
      await userEvent.type(
        screen.getByLabelText('password-input'),
        '@1qEWqw!!',
      );
      await userEvent.type(
        screen.getByLabelText('password-input-confirmation'),
        '@1qEWqw!{enter}',
      );
    });
    expect(
      screen.getByText('Your passwords do not match!', { exact: true }),
    ).toBeInTheDocument();
  });

  //OLD format
  // beforeEach(async () => {
  //   await signUp.beforeEach(<App />); // TODO -> could be named as render component??
  // });
  // afterEach(() => {
  //   afterTests.clean();
  // });
  // it('Must show sign-up page', () => {
  //   assertion.getByLabelText(alComponent.signUp);
  // });
  // it('Must show error message when using different passwords and pressing enter', async () => {
  //   await signUp.methods.typeNEnter('@1qEWqw!!', '1qEWqw{enter}');
  //   await assertion.awaitFor(
  //     signUp.methods.message('popup_password_mismatch'),
  //     QueryDOM.BYTEXT,
  //   );
  // });
  // it('Must show error message when using different passwords and clicking button', async () => {
  //   await signUp.methods.typeNClick('@1qEWqw!!', '1qEWqw');
  //   await assertion.awaitFor(
  //     signUp.methods.message('popup_password_mismatch'),
  //     QueryDOM.BYTEXT,
  //   );
  // });
  // it('Must show error message when invalid password and pressing enter', async () => {
  //   await signUp.methods.typeNEnter('1qEWqw', '1qEWqw{enter}');
  //   await assertion.awaitFor(
  //     signUp.methods.message('popup_password_regex'),
  //     QueryDOM.BYTEXT,
  //   );
  // });
  // it('Must show error message when invalid password and clicking button', async () => {
  //   await signUp.methods.typeNClick('1qEWqw', '1qEWqw');
  //   await assertion.awaitFor(
  //     signUp.methods.message('popup_password_regex'),
  //     QueryDOM.BYTEXT,
  //   );
  // });
  // it('Must navigate to add_keys_page with valid password and pressing enter', async () => {
  //   await signUp.methods.typeNEnter('1qEWqw23', '1qEWqw23{enter}');
  //   await assertion.awaitFor(alComponent.addAccountMain, QueryDOM.BYLABEL);
  // });
  // it('Must navigate to add_keys_page with valid password and clicking button', async () => {
  //   await signUp.methods.typeNClick('1qEWqw23', '1qEWqw23');
  //   await assertion.awaitFor(alComponent.addAccountMain, QueryDOM.BYLABEL);
  // });
});
