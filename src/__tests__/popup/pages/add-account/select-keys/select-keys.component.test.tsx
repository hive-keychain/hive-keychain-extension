import App from '@popup/App';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdCheckbox from 'src/__tests__/utils-for-testing/data-testid/data-testid-checkbox';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdInput from 'src/__tests__/utils-for-testing/data-testid/data-testid-input';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { KeysUtils } from 'src/utils/keys.utils';

describe('select-keys.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
      { ...initialStates.iniStateAs.defaultExistent, accounts: [] },
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              hasStoredAccounts: false,
              getAccount: accounts.asArray.extended,
            },
          },
        },
      },
    );
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(dataTestIdButton.addByKeys),
      );
      await userEvent.type(
        await screen.findByTestId(dataTestIdInput.username),
        mk.user.one,
      );
      await userEvent.type(
        await screen.findByTestId(dataTestIdInput.privateKey),
        userData.one.nonEncryptKeys.master,
      );
      await userEvent.click(await screen.findByTestId(dataTestIdButton.submit));
    });
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdCheckbox.selectKeys.import.activeKey,
        ),
      );
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdCheckbox.selectKeys.import.postingkey,
        ),
      );
      await userEvent.click(
        await screen.findByTestId(dataTestIdCheckbox.selectKeys.import.memoKey),
      );
    });
  });

  it('Must load the select keys page & caption', async () => {
    expect(
      await screen.findByTestId(`${Screen.ACCOUNT_PAGE_SELECT_KEYS}-page`),
    ).toBeInTheDocument();
    expect(
      (await screen.findByTestId(dataTestIdDiv.selectKeys.captionPage))
        .innerHTML,
    ).toBe(chrome.i18n.getMessage('popup_html_import_success'));
  });

  it('Must show error as no key selected', async () => {
    await act(async () => {
      await userEvent.click(await screen.findByTestId(dataTestIdButton.save));
    });
    expect(
      await screen.findByText(
        chrome.i18n.getMessage('popup_accounts_no_key_selected'),
      ),
    ).toBeInTheDocument();
  });

  it('Must import the selected active key', async () => {
    const sHasKeys = jest.spyOn(KeysUtils, 'hasKeys');
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdCheckbox.selectKeys.import.activeKey,
        ),
      );
      await userEvent.click(await screen.findByTestId(dataTestIdButton.save));
    });
    expect(sHasKeys).toHaveBeenCalledWith({
      active: userData.one.nonEncryptKeys.active,
      activePubkey: userData.one.encryptKeys.active,
    });
  });

  it('Must import the selected posting key', async () => {
    const sHasKeys = jest.spyOn(KeysUtils, 'hasKeys');
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(
          dataTestIdCheckbox.selectKeys.import.postingkey,
        ),
      );
      await userEvent.click(await screen.findByTestId(dataTestIdButton.save));
    });
    expect(sHasKeys).toHaveBeenCalledWith({
      posting: userData.one.nonEncryptKeys.posting,
      postingPubkey: userData.one.encryptKeys.posting,
    });
  });

  it('Must import the selected memo key', async () => {
    const sHasKeys = jest.spyOn(KeysUtils, 'hasKeys');
    await act(async () => {
      await userEvent.click(
        await screen.findByTestId(dataTestIdCheckbox.selectKeys.import.memoKey),
      );
      await userEvent.click(await screen.findByTestId(dataTestIdButton.save));
    });
    expect(sHasKeys).toHaveBeenCalledWith({
      memo: userData.one.nonEncryptKeys.memo,
      memoPubkey: userData.one.encryptKeys.memo,
    });
  });
});
