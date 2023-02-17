import {
  KeychainRequestTypes,
  RequestId,
  RequestWitnessVote,
} from '@interfaces/keychain.interface';
import { cleanup } from '@testing-library/react';
import * as AnoynymousRequestsModule from 'src/dialog/hooks/anonymous-requests';
import mk from 'src/__tests__/utils-for-testing/data/mk';

const data = {
  domain: 'domain',
  type: KeychainRequestTypes.witnessVote,
  username: mk.user.one,
  witness: 'keychain',
  vote: true,
} as RequestWitnessVote & RequestId;

const spies = {
  useAnonymousRequest: jest.spyOn(
    AnoynymousRequestsModule,
    'useAnonymousRequest',
  ),
};

const methods = {
  afterEach: afterEach(() => {
    spies.useAnonymousRequest.mockClear();
    cleanup();
  }),
};

const constants = {
  data,
};

export default { constants, spies, methods };
