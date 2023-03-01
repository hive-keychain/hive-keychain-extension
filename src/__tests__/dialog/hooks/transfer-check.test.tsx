import { RequestId, RequestTransfer } from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Transfer from 'src/dialog/pages/requests/transfer';
import transferCheckMocks from 'src/__tests__/dialog/hooks/mocks/transfer-check-mocks';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import config from 'src/__tests__/utils-for-testing/setups/config';
describe('transfer-check.ts tests:\n', () => {
  config.afterAllCleanAndResetMocks();
  const { constants, methods, spies } = transferCheckMocks;
  methods.afterEach;
  describe('useTransferCheck cases:\n', () => {
    it('Must call useTransferCheck without phishing warning', async () => {
      methods.getPhishingAccounts([]);
      render(
        <Transfer
          data={constants}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
        />,
      );
      waitFor(() => {});
      const { calls } = spies.useTransferCheck.mock;
      expect(calls[0]).toEqual([{ ...constants }, DefaultRpcs[1]]);
      screen.debug();
    });

    it('Must call useTransferCheck with a phishing warning', async () => {
      chrome.i18n.getMessage = jest
        .fn()
        .mockImplementation(mocksImplementation.i18nGetMessageCustom);
      methods.getPhishingAccounts(['bittrex']);
      const clonedData = objects.clone(constants) as RequestTransfer &
        RequestId;
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
      waitFor(() => {});
      const { calls } = spies.useTransferCheck.mock;
      expect(calls[0]).toEqual([{ ...clonedData }, DefaultRpcs[1]]);
    });
  });
});
