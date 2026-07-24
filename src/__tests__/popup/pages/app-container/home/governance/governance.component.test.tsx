import { Screen } from '@interfaces/screen.interface';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdDiv from 'src/__tests__/utils-for-testing/data-testid/data-testid-div';
import dataTestIdTab from 'src/__tests__/utils-for-testing/data-testid/data-testid-tab';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import witness from 'src/__tests__/utils-for-testing/data/witness';
import { LoadingValuesConfiguration } from 'src/__tests__/utils-for-testing/loading-values-configuration/loading-values-configuration';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
import { GovernanceComponent } from 'src/popup/hive/pages/app-container/home/governance/governance.component';
import { WitnessGlobalInformationComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/witness-information/witness-global-information/witness-global-information.component';
import { ChainType } from 'src/popup/multichain/interfaces/chains.interface';

import { I18nUtils } from 'src/utils/i18n.utils';
describe('governance.component tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    cleanup();
  });
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
    await act(async () => {
      await userEvent.click(screen.getByTestId(dataTestIdButton.menu));
      await userEvent.click(
        screen.getByTestId(
          dataTestIdButton.menuPreFix + SVGIcons.MENU_GOVERNANCE,
        ),
      );
    });
    await screen.findByTestId('witness-tab');
  });

  it('Must load governance page & witness tab by default', async () => {
    expect(
      await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByTestId(dataTestIdDiv.rankingItem),
    ).toHaveLength(witness.ranking.length);
  });

  it('Must load proxy tab', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByRole('radio', {
          name: I18nUtils.getMessage('popup_html_proxy'),
        }),
      );
    });
    expect(await screen.findByTestId(dataTestIdTab.proxy)).toBeInTheDocument();
  });

  it('Must load proposal tab', async () => {
    await act(async () => {
      await userEvent.click(
        screen.getByRole('radio', {
          name: I18nUtils.getMessage('popup_html_proposal'),
        }),
      );
    });
    expect(
      await screen.findByTestId(dataTestIdTab.proposal),
    ).toBeInTheDocument();
  });

  it('loads the last used Hive account when opened from an EVM active account type', async () => {
    cleanup();
    LoadingValuesConfiguration.set({
      app: {
        accountsRelated: {
          ActiveAccountUtils: {
            getActiveAccountNameFromLocalStorage: accounts.local.two.name,
          },
        },
      },
    });

    customRender(<GovernanceComponent />, {
      initialState: {
        ...initialStates.iniStateAs.defaultExistent,
        activeAccountType: ChainType.EVM,
        hive: {
          ...initialStates.iniStateAs.defaultExistent.hive,
          activeAccount: initialStates.iniState.hive.activeAccount,
        },
      },
    });

    expect(await screen.findByText(accounts.local.two.name)).toBeInTheDocument();
    expect(
      await screen.findByTestId(`${Screen.GOVERNANCE_PAGE}-page`),
    ).toBeInTheDocument();
  });

  it('renders witness global information while the active chain is EVM', async () => {
    cleanup();

    customRender(
      <WitnessGlobalInformationComponent
        witnessInfo={{
          username: accounts.local.one.name,
          votesCount: 10,
          voteValueInHP: '123.000',
          blockMissed: 0,
          lastBlock: '1',
          lastBlockUrl: 'https://hiveblocks.com/b/1',
          priceFeed: '$1.00',
          priceFeedUpdatedAt: moment(),
          priceFeedUpdatedAtWarning: false,
          signingKey: 'STM1111111111111111111111111111111114T1Anm',
          url: 'https://keychain.extension',
          version: '1.0.0',
          isDisabled: false,
          params: {
            accountCreationFee: 3,
            accountCreationFeeFormatted: '3.000 HIVE',
            maximumBlockSize: 65536,
            hbdInterestRate: 20,
          },
          rewards: {
            lastMonthValue: 0,
            lastMonthInHP: '0.000 HP',
            lastMonthInUSD: '0.00',
            lastWeekValue: 0,
            lastWeekInHP: '0.000 HP',
            lastWeekInUSD: '0.00',
            lastYearValue: 0,
            lastYearInHP: '0.000 HP',
            lastYearInUSD: '0.00',
          },
        }}
      />,
      {
        initialState: {
          ...initialStates.iniStateAs.defaultExistent,
          chain: {
            name: 'Ethereum',
            type: ChainType.EVM,
            logo: '',
            chainId: '0x1',
            rpcs: [],
            mainToken: 'ETH',
            defaultTransactionType: 2,
          },
        },
      },
    );

    expect(await screen.findByText('123.000 HP')).toBeInTheDocument();
  });
});
