import { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import App from '@popup/App';
import { Icons } from '@popup/icons.enum';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import ariaLabelSelect from 'src/__tests__/utils-for-testing/aria-labels/aria-label-select';
import ariaLabelSvg from 'src/__tests__/utils-for-testing/aria-labels/aria-label-svg';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';
describe('manage-account.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('General cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must display manage-account page', () => {
      expect(
        screen.getByLabelText(`${Screen.SETTINGS_MANAGE_ACCOUNTS}-page`),
      ).toBeInTheDocument();
    });

    it('Must change to selected account', async () => {
      AccountUtils.getAccount = jest.fn().mockResolvedValue([
        {
          ...accounts.extended,
          name: mk.user.two,
        } as ExtendedAccount,
      ]);
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelSelect.accountSelector),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelSelect.itemSelectorPreFix + mk.user.two,
          ),
        );
      });
      expect(
        await screen.findByLabelText(ariaLabelDiv.selectedAccount),
      ).toHaveTextContent(mk.user.two);
    });

    it('Must show/hide QR code', async () => {
      Element.prototype.scrollIntoView = jest.fn();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.qrCode.toogle),
        );
      });
      expect(
        await screen.findByLabelText(ariaLabelSvg.qrcode),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.qrCode.toogle),
        );
      });
      expect(
        screen.queryByLabelText(ariaLabelSvg.qrcode),
      ).not.toBeInTheDocument();
    });

    it('Must close page and go home', async () => {
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelIcon.closePage));
      });
      expect(
        await screen.findByLabelText(`${Screen.HOME_PAGE}-page`),
      ).toBeInTheDocument();
    });
  });

  describe('Account having 1 key only:\n', () => {
    beforeEach(async () => {
      const clonedLocalAccount = objects.clone(
        accounts.local.justTwoKeys,
      ) as LocalAccount;
      delete clonedLocalAccount.keys.active;
      delete clonedLocalAccount.keys.activePubkey;
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            accountsRelated: {
              AccountUtils: {
                getAccountsFromLocalStorage: [clonedLocalAccount],
              },
            },
          },
        },
      );
      await act(async () => {
        await userEvent.click(screen.getByLabelText(ariaLabelButton.menu));
        await userEvent.click(
          screen.getByLabelText(ariaLabelButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByLabelText(
            ariaLabelButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must not show remove posting key', () => {
      expect(
        screen.queryByLabelText(
          ariaLabelIcon.keys.list.preFix.remove + 'posting',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
