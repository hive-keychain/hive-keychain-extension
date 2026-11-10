import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { localAccounts } from 'src/__tests__/utils-for-testing/data/local-accounts';
import { initialStateWAccountsWActiveAccountStore } from 'src/__tests__/utils-for-testing/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { MANAGE_ACCOUNT_SELECTED_NAME_PARAM } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/manage-account-selection.utils';
import { WrongKeyPopupComponent } from 'src/popup/hive/pages/app-container/wrong-key-popup/wrong-key-popup.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('wrong-key-popup.component', () => {
  const displayWrongKeyPopup = {
    [localAccounts.user2.name!]: ['active'],
  };
  const setDisplayWrongKeyPopup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AccountUtils, 'getExtendedAccount')
      .mockResolvedValue({ name: localAccounts.user2.name } as any);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({});
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);
  });

  const renderPopup = () =>
    customRender(
      <WrongKeyPopupComponent
        displayWrongKeyPopup={displayWrongKeyPopup}
        setDisplayWrongKeyPopup={setDisplayWrongKeyPopup}
      />,
      {
        initialState: initialStateWAccountsWActiveAccountStore,
      },
    );

  it('navigates to manage accounts for the flagged account after replace', async () => {
    const { store } = renderPopup();

    await act(async () => {
      await userEvent.click(screen.getByText('Replace'));
    });

    await waitFor(() => {
      const navigation = store.getState().navigation;
      expect(navigation.stack[0]?.currentPage).toBe(
        Screen.SETTINGS_MANAGE_ACCOUNTS,
      );
      expect(navigation.stack[0]?.params).toEqual({
        username: localAccounts.user2.name,
        [MANAGE_ACCOUNT_SELECTED_NAME_PARAM]: localAccounts.user2.name,
      });
      expect(store.getState().hive.activeAccount.name).toBe(
        localAccounts.user2.name,
      );
      expect(setDisplayWrongKeyPopup).toHaveBeenCalledWith(undefined);
    });
  });

  it('persists skipped wrong keys when do nothing is selected', async () => {
    renderPopup();

    await act(async () => {
      await userEvent.click(screen.getByText('Do nothing'));
    });

    await waitFor(() => {
      expect(LocalStorageUtils.saveValueInLocalStorage).toHaveBeenCalledWith(
        LocalStorageKeyEnum.NO_KEY_CHECK,
        displayWrongKeyPopup,
      );
      expect(setDisplayWrongKeyPopup).toHaveBeenCalledWith(undefined);
    });
  });
});
