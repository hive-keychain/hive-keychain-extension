import { KeychainApi } from '@api/keychain';
import {
  KeychainRequestTypes,
  RequestId,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { cleanup } from '@testing-library/react';
import * as TransferCheckModule from 'src/dialog/hooks/transfer-check';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.transfer,
  username: mk.user.one,
  to: 'theghost1980',
  amount: '10.000',
  memo: '',
  currency: 'HIVE',
} as RequestTransfer & RequestId;

const constants = {
  ...data,
};

const spies = {
  useTransferCheck: jest.spyOn(TransferCheckModule, 'useTransferCheck'),
};

const methods = {
  afterEach: afterEach(() => {
    spies.useTransferCheck.mockClear();
    cleanup();
  }),
  getPhishingAccounts: (phishingAccounts: string[]) =>
    jest.spyOn(KeychainApi, 'get').mockResolvedValue(phishingAccounts),
};

export default { constants, methods, spies };
