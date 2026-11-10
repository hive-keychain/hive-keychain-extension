import type { ExtendedAccount } from '@hiveio/dhive';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { KeyType } from 'src/interfaces/keys.interface';
import { AddKey } from 'src/popup/hive/pages/app-container/settings/accounts/manage-account/add-key/add-key.component';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import { LedgerRouteUtils } from 'src/popup/multichain/utils/ledger-route.utils';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('AddKey accessibility', () => {
  beforeEach(() => {
    I18nUtils.getMessage = jest.fn((key: string) => key);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('activates an authorized account and Ledger from the keyboard', async () => {
    const user = userEvent.setup();
    const addAuthorizedKey = jest
      .spyOn(AccountUtils, 'addAuthorizedKey')
      .mockResolvedValue(undefined);
    jest.spyOn(AccountUtils, 'getExtendedAccount').mockResolvedValue({
      active: { account_auths: [['delegate', 1]] },
    } as ExtendedAccount);
    const openLedger = jest
      .spyOn(LedgerRouteUtils, 'openInSidePanelFromToolbarPopup')
      .mockResolvedValue(true);
    const props = {
      keyType: KeyType.ACTIVE,
      activeAccountName: 'owner',
      activeAccount: { name: 'owner', keys: {} },
      localAccounts: [
        { name: 'owner', keys: {} },
        { name: 'delegate', keys: {} },
      ],
      mk: 'master-key',
      addKey: jest.fn(),
      setTitleContainerProperties: jest.fn(),
      setErrorMessage: jest.fn(),
      refreshActiveAccount: jest.fn(),
      setSuccessMessage: jest.fn(),
      goBack: jest.fn(),
      navigateToWithParams: jest.fn(),
      isLedgerSupported: true,
    } as unknown as React.ComponentProps<typeof AddKey>;
    render(<AddKey {...props} />);

    const authorityButton = await screen.findByRole('button', {
      name: 'delegate',
    });
    authorityButton.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(addAuthorizedKey).toHaveBeenCalled());

    const ledgerButton = screen.getByRole('button', {
      name: 'popup_html_add_using_ledger',
    });
    ledgerButton.focus();
    await user.keyboard(' ');
    await waitFor(() => expect(openLedger).toHaveBeenCalled());
  });
});
