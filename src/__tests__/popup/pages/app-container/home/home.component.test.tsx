import AccountUtils from '@hiveapp/utils/account.utils';
import HiveUtils from '@hiveapp/utils/hive.utils';
import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdToolTip from 'src/__tests__/utils-for-testing/data-testid/data-testid-tool-tip';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import fake_RC from 'src/__tests__/utils-for-testing/data/rc';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { ActionButtonList } from 'src/popup/hive/pages/app-container/home/actions-section/action-button.list';
import FormatUtils from 'src/utils/format.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
describe('home.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <HiveAppComponent />,
      initialStates.iniStateAs.defaultExistent,
      {
        app: {
          accountsRelated: {
            AccountUtils: {
              getAccountsFromLocalStorage: accounts.twoAccounts,
            },
          },
        },
      },
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });

  it('Must show home page', () => {
    expect(screen.getByTestId(`${Screen.HOME_PAGE}-page`)).toBeInTheDocument();
  });

  it('Must show user related information & labels', () => {
    //TopBarComponent
    expect(screen.getByTestId(dataTestIdIcon.refreshHome)).toBeInTheDocument();
    expect(screen.getByTestId(dataTestIdButton.menu)).toBeInTheDocument();

    //AccountSelectorComponent
    const selectedAccountHTMLElement = screen.getByTestId(
      dataTestIdDiv.selectedAccount,
    );
    expect(selectedAccountHTMLElement).toBeInTheDocument();
    expect(selectedAccountHTMLElement).toHaveTextContent(mk.user.one);

    //ResourcesSectionComponent
    expect(screen.getByTestId(dataTestIdDiv.resources.vm)).toBeInTheDocument();
    expect(screen.getByTestId(dataTestIdDiv.resources.rc)).toBeInTheDocument();

    //EstimatedAccountValueSectionComponent
    expect(
      screen.getByText(I18nUtils.getMessage('popup_html_estimation'), {
        exact: true,
      }),
    ).toBeInTheDocument();
    const estimatedValueHTMLElement = screen.getByTestId(
      dataTestIdDiv.estimatedAccountValue,
    );
    expect(estimatedValueHTMLElement).toBeInTheDocument();
    const accountValue = AccountUtils.getAccountValue(
      accounts.extended,
      currencies.prices.data,
      dynamic.globalProperties,
    );
    expect(estimatedValueHTMLElement).toHaveTextContent(`$ ${accountValue}`);

    //WalletInfoSectionComponent (HIVE, HBD, HP rows)
    expect(screen.getAllByTestId(/^dropdown-arrow-/).length).toBeGreaterThanOrEqual(
      3,
    );
  });

  it('Must show action buttons labels', () => {
    for (let i = 0; i < ActionButtonList.length; i++) {
      expect(
        screen.getByTestId(
          dataTestIdButton.actionBtn.preFix + ActionButtonList[i].label,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(I18nUtils.getMessage(ActionButtonList[i].label)),
      ).toBeInTheDocument();
    }
  });

  it('Must show tool tip when hover on mana with actual value', async () => {
    const manaReadyInText = HiveUtils.getTimeBeforeFull(
      manabar.percentage / 100,
    );
    await act(async () => {
      await userEvent.hover(
        screen.getByTestId(dataTestIdToolTip.custom.resources.votingMana),
      );
    });
    expect(
      await screen.findByTestId(dataTestIdToolTip.custom.resources.votingMana),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(manaReadyInText, { exact: true }),
    ).toBeInTheDocument();
  });

  it('Must show tool tip when hover on credits with its value', async () => {
    const resourceReadyInValue = HiveUtils.getTimeBeforeFull(
      fake_RC.rc.percentage,
    );
    await act(async () => {
      await userEvent.hover(
        screen.getByTestId(dataTestIdToolTip.custom.resources.resourceCredits),
      );
    });
    const rcHTMLElement = await screen.findByTestId(dataTestIdToolTip.content);
    expect(rcHTMLElement).toBeInTheDocument();
    expect(rcHTMLElement).toHaveTextContent(resourceReadyInValue);
  });

  it('Must switch active account when selecting another account in the account selector overlay', async () => {
    await act(async () => {
      await userEvent.click(screen.getByTestId('account-selector-trigger'));
    });

    expect(
      await screen.findByTestId(`account-selector-hive-account-${mk.user.two}`),
    ).toBeInTheDocument();

    await act(async () => {
      await userEvent.click(
        screen.getByTestId(`account-selector-hive-account-${mk.user.two}`),
      );
    });

    expect(screen.getByTestId(dataTestIdDiv.selectedAccount)).toHaveTextContent(
      mk.user.two,
    );
    expect(
      screen.queryByTestId('account-selector-backdrop'),
    ).not.toBeInTheDocument();
  });

  it('Must refresh data when click on logo and show new estimated account value', async () => {
    const formattedEstimatedAccountValue = FormatUtils.withCommas('69999');
    AccountUtils.getAccountValue = jest
      .fn()
      .mockReturnValue(formattedEstimatedAccountValue);
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdIcon.refreshHome));
    });
    expect(
      await screen.findByText(`$ ${formattedEstimatedAccountValue}`, {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must log out user when clicking log out in settings header', async () => {
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
    });
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.logOut));
    });
    expect(await screen.findByTestId('sign-in-page')).toBeInTheDocument();
  });
});
