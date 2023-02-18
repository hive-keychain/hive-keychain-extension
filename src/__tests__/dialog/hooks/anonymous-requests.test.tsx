import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { render } from '@testing-library/react';
import React from 'react';
import WitnessVote from 'src/dialog/pages/requests/witness-vote';
import anonymousRequestsMocks from 'src/__tests__/dialog/hooks/mocks/anonymous-requests-mocks';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';

describe('anonymous-requests tests:\n', () => {
  const { constants, spies, methods } = anonymousRequestsMocks;
  methods.afterEach;
  describe('useAnonymousRequest cases:\n', () => {
    it('Must prepare request operation with the actual username', () => {
      render(
        <WitnessVote
          data={constants.data}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
        />,
      );
      const { calls } = spies.useAnonymousRequest.mock;
      expect(calls[0]).toEqual([
        {
          domain: 'domain',
          type: 'witnessVote',
          username: 'keychain.tests',
          vote: true,
          witness: 'keychain',
        },
        undefined,
      ]);
    });
    it('Must prepare request operation with accounts[0]', () => {
      render(
        <WitnessVote
          data={constants.data}
          domain={'domain'}
          tab={0}
          rpc={DefaultRpcs[1]}
          accounts={accounts.twoAccounts.map((acc) => acc.name)}
        />,
      );
      const { calls } = spies.useAnonymousRequest.mock;
      expect(calls[1]).toEqual([
        {
          domain: 'domain',
          type: 'witnessVote',
          username: 'keychain.tests',
          vote: true,
          witness: 'keychain',
        },
        ['keychain.tests', 'workerjab2'],
      ]);
    });
  });
});
