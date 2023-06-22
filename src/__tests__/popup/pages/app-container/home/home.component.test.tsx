import { ExtendedAccount } from '@hiveio/dhive';
import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdDropdown from 'src/__tests__/utils-for-testing/data-testid/data-testid-dropdown';
import dataTestIdIcon from 'src/__tests__/utils-for-testing/data-testid/data-testid-icon';
import dataTestIdSelect from 'src/__tests__/utils-for-testing/data-testid/data-testid-select';
import dataTestIdToolTip from 'src/__tests__/utils-for-testing/data-testid/data-testid-tool-tip';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import fake_RC from 'src/__tests__/utils-for-testing/data/rc';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
describe('home.component tests:\n', () => {
  beforeEach(async () => {
    await reactTestingLibrary.renderWithConfiguration(
      <App />,
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
    expect(
      screen.getByLabelText(`${Screen.HOME_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('Must show user related information & labels', () => {
    //TopBarComponent
    expect(
      screen.getByLabelText(dataTestIdIcon.refreshHome),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(dataTestIdButton.logOut)).toBeInTheDocument();
    expect(screen.getByLabelText(dataTestIdButton.menu)).toBeInTheDocument();

    //SelectAccountSectionComponent
    const selectedAccountHTMLElement = screen.getByLabelText(
      dataTestIdDiv.selectedAccount,
    );
    expect(selectedAccountHTMLElement).toBeInTheDocument();
    expect(selectedAccountHTMLElement).toHaveTextContent(mk.user.one);

    //ResourcesSectionComponent
    expect(
      screen.getByLabelText(dataTestIdDiv.resources.vm),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(dataTestIdDiv.resources.rc),
    ).toBeInTheDocument();

    //EstimatedAccountValueSectionComponent
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_html_estimation'), {
        exact: true,
      }),
    ).toBeInTheDocument();
    const estimatedValueHTMLElement = screen.getByLabelText(
      dataTestIdDiv.estimatedAccountValue,
    );
    expect(estimatedValueHTMLElement).toBeInTheDocument();
    const accountValue = AccountUtils.getAccountValue(
      accounts.extended,
      currencies.prices.data,
      dynamic.globalProperties,
    );
    expect(estimatedValueHTMLElement).toHaveTextContent(
      `$ ${accountValue} USD`,
    );

    //WalletInfoSectionComponent
    expect(
      screen.getByLabelText(
        dataTestIdDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hp.toLowerCase(),
      ),
    ).toBeDefined();
    expect(
      screen.getByLabelText(
        dataTestIdDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hive.toLowerCase(),
      ),
    ).toBeDefined();
    expect(
      screen.getByLabelText(
        dataTestIdDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase(),
      ),
    ).toBeDefined();
  });

  it('Must show action buttons labels', () => {
    for (let i = 0; i < ActionButtonList.length; i++) {
      expect(
        screen.getByLabelText(
          dataTestIdButton.actionBtn.preFix + ActionButtonList[i].icon,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(chrome.i18n.getMessage(ActionButtonList[i].label)),
      ).toBeInTheDocument();
    }
  });

  it('Must show tool tip when hover on mana with actual value', async () => {
    const manaReadyInText = HiveUtils.getTimeBeforeFull(
      manabar.percentage / 100,
    );
    await act(async () => {
      await userEvent.hover(
        screen.getByLabelText(dataTestIdToolTip.custom.resources.votingMana),
      );
    });
    expect(
      await screen.findByLabelText(
        dataTestIdToolTip.custom.resources.votingMana,
      ),
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
        screen.getByLabelText(
          dataTestIdToolTip.custom.resources.resourceCredits,
        ),
      );
    });
    const rcHTMLElement = await screen.findByLabelText(
      dataTestIdToolTip.content,
    );
    expect(rcHTMLElement).toBeInTheDocument();
    expect(rcHTMLElement).toHaveTextContent(resourceReadyInValue);
  });

  it('Must change active account to the selected one', async () => {
    AccountUtils.getAccount = jest.fn().mockResolvedValue([
      {
        ...accounts.extended,
        name: mk.user.two,
      } as ExtendedAccount,
    ]);
    await act(async () => {
      await userEvent.click(
        screen.getByLabelText(dataTestIdSelect.accountSelector),
      );
      await userEvent.click(
        screen.getByLabelText(
          dataTestIdSelect.itemSelectorPreFix + mk.user.two,
        ),
      );
    });
    expect(
      await screen.findByLabelText(dataTestIdDiv.selectedAccount),
    ).toHaveTextContent(mk.user.two);
  });

  it('Must refresh data when click on logo and show new estimated account value', async () => {
    const formattedEstimatedAccountValue = FormatUtils.withCommas('69999');
    AccountUtils.getAccountValue = jest
      .fn()
      .mockReturnValue(formattedEstimatedAccountValue);
    await act(async () => {
      await userEvent.click(screen.getByLabelText(dataTestIdIcon.refreshHome));
    });
    expect(
      await screen.findByText(`$ ${formattedEstimatedAccountValue} USD`, {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it('Must log out user when clicking on log out', async () => {
    await act(async () => {
      await userEvent.click(screen.getByLabelText(dataTestIdButton.logOut));
    });
    expect(await screen.findByLabelText('sign-in-page')).toBeInTheDocument();
  });
});
