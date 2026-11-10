jest.mock('sanitize-html', () => ({
  __esModule: true,
  default: (value: string) => value,
}));

import { WitnessInfo } from '@interfaces/witness.interface';
import '@testing-library/jest-dom';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import { customRender } from 'src/__tests__/utils-for-testing/setups/render';
import { MyWitnessTabComponent } from 'src/popup/hive/pages/app-container/home/governance/my-witness-tab/my-witness-tab.component';
import BlockchainTransactionUtils from 'src/popup/hive/utils/blockchain.utils';
import WitnessUtils from 'src/popup/hive/utils/witness.utils';
import { RootState } from 'src/popup/multichain/store';

jest.mock('src/popup/hive/actions/active-account.actions', () => {
  const actual = jest.requireActual(
    'src/popup/hive/actions/active-account.actions',
  );
  return {
    ...actual,
    refreshActiveAccount: () => () => undefined,
  };
});

const buildWitnessInfo = (maximumBlockSize: number): WitnessInfo => ({
  username: accounts.active.name!,
  votesCount: 1,
  voteValueInHP: '1',
  blockMissed: 0,
  lastBlock: '1',
  lastBlockUrl: 'https://hivehub.dev/b/1',
  priceFeed: '1 HBD',
  priceFeedUpdatedAt: moment.utc(),
  priceFeedUpdatedAtWarning: false,
  signingKey: 'STM1111111111111111111111111111111114T2Anm',
  url: 'https://example.com',
  version: '1.27.0',
  isDisabled: false,
  params: {
    accountCreationFee: 3,
    accountCreationFeeFormatted: '3.000 HIVE',
    maximumBlockSize,
    hbdInterestRate: 9,
  },
  rewards: {
    lastMonthValue: 0,
    lastMonthInHP: '0',
    lastMonthInUSD: '0',
    lastWeekValue: 0,
    lastWeekInHP: '0',
    lastWeekInUSD: '0',
    lastYearValue: 0,
    lastYearInHP: '0',
    lastYearInUSD: '0',
  },
});

const stateWithActiveAccount = (): RootState => {
  const base = initialStates.iniStateAs.defaultExistent;
  return {
    ...base,
    hive: {
      ...base.hive,
      activeAccount: accounts.active,
    },
  } as RootState;
};

const renderMyWitnessTab = () => {
  customRender(<MyWitnessTabComponent ranking={[]} />, {
    initialState: stateWithActiveAccount(),
  });
};

const openParameterEditor = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(await screen.findByText('Params'));
  expect(screen.getByText('STM1111...T2Anm')).toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: 'Edit' }));
};

describe('My witness tab', () => {
  beforeEach(() => {
    jest
      .spyOn(BlockchainTransactionUtils, 'delayRefresh')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  it('reloads witness parameters after a successful update', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(WitnessUtils, 'getWitnessInfo')
      .mockResolvedValueOnce(buildWitnessInfo(65536))
      .mockResolvedValueOnce(buildWitnessInfo(131072));
    jest.spyOn(WitnessUtils, 'updateWitnessParameters').mockResolvedValue({
      tx_id: 'tx-id',
      id: 'tx-id',
      isUsingMultisig: false,
    });

    renderMyWitnessTab();
    await openParameterEditor(user);
    expect(screen.getByDisplayValue('65536')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(WitnessUtils.getWitnessInfo).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText('131072')).toBeInTheDocument();
    expect(screen.queryByText('65536')).not.toBeInTheDocument();
  });

  it('keeps the editor open when the witness update fails', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(WitnessUtils, 'getWitnessInfo')
      .mockResolvedValue(buildWitnessInfo(65536));
    jest
      .spyOn(WitnessUtils, 'updateWitnessParameters')
      .mockResolvedValue(null);

    renderMyWitnessTab();
    await openParameterEditor(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(
      await screen.findByRole('button', { name: 'Save' }),
    ).toBeInTheDocument();
    expect(WitnessUtils.getWitnessInfo).toHaveBeenCalledTimes(1);
  });

  it('does not reload parameters when the update is only sent to multisig signers', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(WitnessUtils, 'getWitnessInfo')
      .mockResolvedValue(buildWitnessInfo(65536));
    jest.spyOn(WitnessUtils, 'updateWitnessParameters').mockResolvedValue({
      tx_id: '',
      id: '',
      isUsingMultisig: true,
    });

    renderMyWitnessTab();
    await openParameterEditor(user);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(await screen.findByText('Params'));
    expect(screen.getByText('65536')).toBeInTheDocument();
    expect(WitnessUtils.getWitnessInfo).toHaveBeenCalledTimes(1);
  });
});
