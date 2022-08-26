import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RequestBalance from 'src/dialog/components/request-balance/request-balance';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import requestBalance from 'src/__tests__/utils-for-testing/data/props/dialog/request-balance';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { PropsRequestBalance } from 'src/__tests__/utils-for-testing/types/props-types';

class _Client {
  address: any;
  database: {};
  options: {};
  constructor(address: string, options: {}) {
    this.address = address;
    this.database = {
      getAccounts: () =>
        Promise.resolve([{ balance: '100 HIVE', hbd_balance: '100' }]),
    };
    this.options = options;
  }
}

class _ClientError {
  address: any;
  database: {};
  options: {};
  constructor(address: string, options: {}) {
    this.address = address;
    this.database = {
      getAccounts: () => Promise.reject('Error getting accounts from HIVE!'),
    };
    this.options = options;
  }
}
describe('request-balance tests:\n', () => {
  const { methods, spies } = appMocks;
  const { props } = requestBalance;
  methods.config();
  it('Must show no balance', () => {
    const noUserName = objects.clone(props) as PropsRequestBalance;
    delete noUserName.username;
    render(<RequestBalance {...noUserName} />);
    assertion.getOneByText('...');
  });
  it('Must show insufficient balance', async () => {
    jest.mock('@hiveio/dhive', () => {
      const originalModule = jest.requireActual('@hiveio/dhive');
      return {
        __esModule: true,
        ...originalModule,
        Client: _Client,
      };
    });
    render(<RequestBalance {...props} />);
    await assertion.awaitFindText(testsI18n.get('dialog_insufficient_balance'));
    jest.resetModules();
  });
  it('Must show new balance after operation', async () => {
    jest.mock('@hiveio/dhive', () => {
      const originalModule = jest.requireActual('@hiveio/dhive');
      return {
        __esModule: true,
        ...originalModule,
        Client: _Client,
      };
    });
    const propsGoodBalance = objects.clone(props) as PropsRequestBalance;
    render(<RequestBalance {...{ ...propsGoodBalance, amount: 10 }} />);
    await screen.findByText('100 HIVE => 90.000 HIVE', { exact: false });

    jest.resetModules();
  });
  it('Must call Logger with error', () => {
    jest.mock('@hiveio/dhive', () => {
      const originalModule = jest.requireActual('@hiveio/dhive');
      return {
        __esModule: true,
        ...originalModule,
        Client: _ClientError,
      };
    });
    render(<RequestBalance {...props} />);
    waitFor(() => {
      expect(spies.logger.error).toBeCalledWith(
        'Error getting accounts from HIVE!',
      );
    });
    jest.resetModules();
  });
});