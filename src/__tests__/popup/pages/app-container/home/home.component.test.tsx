import App from '@popup/App';
import { ActionButtonList } from '@popup/pages/app-container/home/actions-section/action-button.list';
import { Screen } from '@reference-data/screen.enum';
import '@testing-library/jest-dom';
import { cleanup, screen } from '@testing-library/react';
import React from 'react';
import ariaLabelButton from 'src/__tests__/utils-for-testing/aria-labels/aria-label-button';
import ariaLabelDiv from 'src/__tests__/utils-for-testing/aria-labels/aria-label-div';
import ariaLabelDropdown from 'src/__tests__/utils-for-testing/aria-labels/aria-label-dropdown';
import ariaLabelIcon from 'src/__tests__/utils-for-testing/aria-labels/aria-label-icon';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import currencies from 'src/__tests__/utils-for-testing/data/currencies';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/rtl-render/rtl-render-functions';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
// config.byDefault();
// const { extraMocks } = home;
describe('home.component tests:\n', () => {
  beforeEach(async () => {
    // await home.beforeEach(<App />, accounts.twoAccounts);
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
      screen.getByLabelText(ariaLabelIcon.refreshHome),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(ariaLabelButton.logOut)).toBeInTheDocument();
    expect(screen.getByLabelText(ariaLabelButton.menu)).toBeInTheDocument();

    //SelectAccountSectionComponent
    const selectedAccountHTMLElement = screen.getByLabelText(
      ariaLabelDiv.selectedAccount,
    );
    expect(selectedAccountHTMLElement).toBeInTheDocument();
    expect(selectedAccountHTMLElement).toHaveTextContent(mk.user.one);

    //ResourcesSectionComponent
    expect(
      screen.getByLabelText(ariaLabelDiv.resources.vm),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(ariaLabelDiv.resources.rc),
    ).toBeInTheDocument();

    //EstimatedAccountValueSectionComponent
    expect(
      screen.getByText(chrome.i18n.getMessage('popup_html_estimation'), {
        exact: true,
      }),
    ).toBeInTheDocument();
    const estimatedValueHTMLElement = screen.getByLabelText(
      ariaLabelDiv.estimatedAccountValue,
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
        ariaLabelDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hp.toLowerCase(),
      ),
    ).toBeDefined();
    expect(
      screen.getByLabelText(
        ariaLabelDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hive.toLowerCase(),
      ),
    ).toBeDefined();
    expect(
      screen.getByLabelText(
        ariaLabelDropdown.arrow.preFix +
          CurrencyUtils.getCurrencyLabels(false).hbd.toLowerCase(),
      ),
    ).toBeDefined();
  });

  it('Must show action buttons labels', () => {
    for (let i = 0; i < ActionButtonList.length; i++) {
      expect(
        screen.getByLabelText(
          ariaLabelButton.actionBtn.preFix +
            chrome.i18n.getMessage(ActionButtonList[i].label).toLowerCase(),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(chrome.i18n.getMessage(ActionButtonList[i].label)),
      ).toBeInTheDocument();
    }
  });

  // it('Must show tool tip when hover on mana', async () => {
  //   await userEventPendingTimers.hover(
  //     screen.getByLabelText(alToolTip.custom.resources.votingMana),
  //   );
  //   expect(screen.getByLabelText(alToolTip.content)).toBeInTheDocument();
  //   expect(screen.getByText(home.methods.manaReadyIn())).toBeInTheDocument();
  // });
  // it('Must show tool tip when hover on credits', async () => {
  //   await userEventPendingTimers.hover(
  //     screen.getByLabelText(alToolTip.custom.resources.resourceCredits),
  //   );
  //   expect(screen.getByLabelText(alToolTip.content)).toBeInTheDocument();
  // });
  // it('Must change active account to the selected one', async () => {
  //   extraMocks.remockGetAccount();
  //   await clickAwait([
  //     alSelect.accountSelector,
  //     alSelect.itemSelectorPreFix + mk.user.two,
  //   ]);
  //   expect(screen.getByLabelText(alDiv.selectedAccount)).toHaveTextContent(
  //     mk.user.two,
  //   );
  // });
  // it('Must refresh data when click on logo', async () => {
  //   mockPreset.setOrDefault({
  //     home: { getAccountValue: home.constants.estimatedValue },
  //   });
  //   await clickAwait([alIcon.refreshHome]);
  //   actAdvanceTime(4300);
  //   await assertion.awaitFindText(`$ ${home.constants.estimatedValue} USD`);
  // });
  // it('Must log out user when clicking on log out', async () => {
  //   await clickAwait([alButton.logOut]);
  //   expect(screen.getByLabelText(alComponent.signIn)).toBeInTheDocument();
  // });
  // it('Must show menu settings', async () => {
  //   await clickAwait([alButton.menu]);
  //   assertion.getByText(home.constants.iconsMenuSettings);
  // });
  // it('Must show dropdown menu on HIVE balance', async () => {
  //   await clickAwait([alDropdown.arrow.hive]);
  //   assertion.getByText(home.constants.menuItems.hive);
  // });
  // it('Must show dropdown menu on HBD balance', async () => {
  //   await clickAwait([alDropdown.arrow.hbd]);
  //   assertion.getByText(home.constants.menuItems.hbd);
  // });
  // it('Must show dropdown menu on HP balance', async () => {
  //   await clickAwait([alDropdown.arrow.hp]);
  //   assertion.getByText(home.constants.menuItems.hp);
  // });
});
