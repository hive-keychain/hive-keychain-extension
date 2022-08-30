import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RequestTokenBalance from 'src/dialog/components/request-token-balance/request-token-balance';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import Logger from 'src/utils/logger.utils';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import requestTokenBalance from 'src/__tests__/utils-for-testing/data/props/dialog/request-token-balance';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
describe('request-token-balance tests:\n', () => {
  const { methods } = appMocks;
  const { props } = requestTokenBalance;
  methods.config();
  it('Must show insufficient balance if user has no tokens', async () => {
    HiveEngineUtils.getUserBalance = jest.fn().mockResolvedValue([]);
    render(<RequestTokenBalance {...props} />);
    await assertion.awaitFindText(testsI18n.get('dialog_insufficient_balance'));
  });
  it('Must show insufficient balance if lower balance', async () => {
    HiveEngineUtils.getUserBalance = jest.fn().mockResolvedValue([
      {
        symbol: 'LEO',
        balance: '0',
      },
    ]);
    render(<RequestTokenBalance {...props} />);
    await assertion.awaitFindText(testsI18n.get('dialog_insufficient_balance'));
  });
  it('Must show actual and future balance', async () => {
    HiveEngineUtils.getUserBalance = jest.fn().mockResolvedValue([
      {
        symbol: 'LEO',
        balance: '2.000',
      },
    ]);
    render(<RequestTokenBalance {...props} />);
    expect(
      await screen.findByText('2.000 LEO => 1.000 LEO', { exact: false }),
    ).toBeDefined();
  });
  it('Must call logger with error and show ... as balance', async () => {
    HiveEngineUtils.getUserBalance = jest
      .fn()
      .mockRejectedValue('Network Error');
    render(<RequestTokenBalance {...props} />);
    waitFor(() => {
      expect(jest.spyOn(Logger, 'error')).toBeCalledWith(
        'Issue retrieving user tokens',
        'Network Error',
      );
      expect(screen.getByText('...')).toBeDefined();
    });
  });
});
