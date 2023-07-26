import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { cleanup, render } from '@testing-library/react';
import {
  KeychainRequestTypes,
  RequestId,
  RequestWitnessVote,
} from 'hive-keychain-commons';
import React from 'react';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import * as AnoynymousRequestsModule from 'src/dialog/hooks/anonymous-requests';
import WitnessVote from 'src/dialog/pages/requests/witness-vote';

describe('anonymous-requests tests:\n', () => {
  const data = {
    domain: 'domain',
    type: KeychainRequestTypes.witnessVote,
    username: mk.user.one,
    witness: 'keychain',
    vote: true,
  } as RequestWitnessVote & RequestId;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.restoreAllMocks();
    cleanup();
  });
  describe('useAnonymousRequest cases:\n', () => {
    it('Must prepare request operation with the actual username', () => {
      const sUseAnonymousRequest = jest.spyOn(
        AnoynymousRequestsModule,
        'useAnonymousRequest',
      );
      render(
        <WitnessVote
          data={data}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
        />,
      );
      expect(sUseAnonymousRequest).toHaveBeenLastCalledWith(
        { ...data },
        undefined,
      );
    });
    it('Must prepare request operation with accounts[0]', () => {
      const sUseAnonymousRequest = jest.spyOn(
        AnoynymousRequestsModule,
        'useAnonymousRequest',
      );
      render(
        <WitnessVote
          data={data}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
          accounts={accounts.twoAccounts.map((acc) => acc.name)}
        />,
      );
      expect(sUseAnonymousRequest).toHaveBeenLastCalledWith({ ...data }, [
        'keychain.tests',
        'workerjab2',
      ]);
    });
  });
});
