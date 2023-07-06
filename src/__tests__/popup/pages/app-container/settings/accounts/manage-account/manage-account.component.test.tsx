import AccountUtils from '@hiveapp/utils/account.utils';
import { ExtendedAccount } from '@hiveio/dhive';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import dataTestIdSvg from 'src/__tests__/utils-for-testing/data-testid/data-testid-svg';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { Icons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('manage-account.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
  describe('General cases:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must display manage-account page', () => {
      expect(
        screen.getByTestId(`${Screen.SETTINGS_MANAGE_ACCOUNTS}-page`),
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
          //bellow the only element using an actual aria-label.
          screen.getByLabelText(dataTestIdSelect.accountSelector),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdSelect.itemSelectorPreFix + mk.user.two),
        );
      });
      expect(
        await screen.findByTestId(dataTestIdDiv.selectedAccount),
      ).toHaveTextContent(mk.user.two);
    });

    it('Must show/hide QR code', async () => {
      Element.prototype.scrollIntoView = jest.fn();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.qrCode.toogle),
        );
      });
      expect(
        await screen.findByTestId(dataTestIdSvg.qrcode),
      ).toBeInTheDocument();
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.qrCode.toogle),
        );
      });
      expect(
        screen.queryByTestId(dataTestIdSvg.qrcode),
      ).not.toBeInTheDocument();
    });

    it('Must close page and go home', async () => {
      await act(async () => {
        await userEvent.click(screen.getByTestId(dataTestIdIcon.closePage));
      });
      expect(
        await screen.findByTestId(`${Screen.HOME_PAGE}-page`),
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
        <HiveAppComponent />,
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
        await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.menuPreFix + Icons.ACCOUNTS),
        );
        await userEvent.click(
          screen.getByTestId(
            dataTestIdButton.menuPreFix + Icons.MANAGE_ACCOUNTS,
          ),
        );
      });
    });
    it('Must not show remove posting key', () => {
      expect(
        screen.queryByTestId(
          dataTestIdIcon.keys.list.preFix.remove + 'posting',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
