import { KeychainApi } from '@api/keychain';
import {
  KeychainRequestTypes,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import * as TransferCheckModule from 'src/dialog/hooks/transfer-check';
import Transfer from 'src/dialog/pages/requests/transfer';

describe('transfer-check.ts tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.transfer,
    username: mk.user.one,
    to: 'theghost1980',
    amount: '10.000',
    memo: '',
    currency: 'HIVE',
  } as RequestTransfer & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    cleanup();
  });
  describe('useTransferCheck cases:\n', () => {
    it('Must call useTransferCheck without phishing warning', async () => {
      const sUseTransferCheck = jest.spyOn(
        TransferCheckModule,
        'useTransferCheck',
      );
      jest.spyOn(KeychainApi, 'get').mockResolvedValue([]);
      render(
        <Transfer data={data} domain={'domain'} tab={0} rpc={DefaultRpcs[1]} />,
      );
      expect(sUseTransferCheck).toHaveBeenLastCalledWith(
        { ...data },
        DefaultRpcs[1],
      );
    });

    it('Must call useTransferCheck with a phishing warning', async () => {
      const sUseTransferCheck = jest.spyOn(
        TransferCheckModule,
        'useTransferCheck',
      );
      jest.spyOn(KeychainApi, 'get').mockResolvedValue(['bittrex']);
      const clonedData = objects.clone(data) as RequestTransfer & RequestId;
      clonedData.to = 'bittrex';
      clonedData.memo = 'Hi there bittrex!';
      render(
        <Transfer
          data={clonedData}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
        />,
      );
      expect(sUseTransferCheck).toHaveBeenLastCalledWith(
        { ...clonedData },
        DefaultRpcs[1],
      );
    });
  });
});
