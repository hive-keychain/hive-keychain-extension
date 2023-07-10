import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import {
  anonymous_requests,
  getRequiredWifType,
} from 'src/utils/requests.utils';

describe('requests.utils tests:\n', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe('anonymous_requests tests:\n', () => {
    test('Should contain each of the requests defined bellow', () => {
      const showEachRequestIteration = false;
      const anonymousRequestsExpected = [
        KeychainRequestTypes.delegation,
        KeychainRequestTypes.witnessVote,
        KeychainRequestTypes.proxy,
        KeychainRequestTypes.custom,
        KeychainRequestTypes.signBuffer,
        KeychainRequestTypes.recurrentTransfer,
      ];
      anonymousRequestsExpected.forEach((request: any) => {
        if (showEachRequestIteration) {
          console.log(`Searching: ${request}`);
        }
        expect(
          anonymous_requests.find((found) => found === request),
        ).not.toBeUndefined();
        if (showEachRequestIteration) {
          console.log('Found.');
        }
      });
      expect(anonymous_requests.length).toBe(anonymousRequestsExpected.length);
    });
  });

  describe('getRequiredWifType tests:\n', () => {
    test('Passing a request of type post must return a KeychainKeyTypesLC.posting', () => {
      expect(
        getRequiredWifType({
          type: KeychainRequestTypes.post,
        } as KeychainRequest),
      ).toBe('posting');
    });
    test('Passing a request of type vote must return a KeychainKeyTypesLC.posting', () => {
      expect(
        getRequiredWifType({
          type: KeychainRequestTypes.vote,
        } as KeychainRequest),
      ).toBe('posting');
    });
    test('Passing a request of type custom without method, must return "posting"', () => {
      expect(
        getRequiredWifType({
          type: KeychainRequestTypes.custom,
        } as KeychainRequest),
      ).toBe('posting');
    });
    test('Passing a request of type custom with method, must return property method on lowercase', () => {
      expect(
        getRequiredWifType({
          type: KeychainRequestTypes.custom,
          method: KeychainKeyTypes.active,
        } as KeychainRequest),
      ).toBe('active');
    });
    test('Passing a request of type signedCall, must return property typeWif on lowercase', () => {
      expect(
        getRequiredWifType({
          type: KeychainRequestTypes.signedCall,
          typeWif: KeychainKeyTypes.memo,
        } as KeychainRequest),
      ).toBe('memo');
    });
    test('Must return default value for each request defined bellow', () => {
      const showIterations = false;
      const defaultExpectedValue = KeychainKeyTypesLC.active;
      const defaultRequestsGroup = [
        { type: KeychainRequestTypes.transfer },
        { type: KeychainRequestTypes.sendToken },
        { type: KeychainRequestTypes.delegation },
        { type: KeychainRequestTypes.witnessVote },
        { type: KeychainRequestTypes.proxy },
        { type: KeychainRequestTypes.powerUp },
        { type: KeychainRequestTypes.powerDown },
        { type: KeychainRequestTypes.createClaimedAccount },
        { type: KeychainRequestTypes.createProposal },
        { type: KeychainRequestTypes.removeProposal },
        { type: KeychainRequestTypes.updateProposalVote },
        { type: KeychainRequestTypes.convert },
        { type: KeychainRequestTypes.recurrentTransfer },
      ];
      defaultRequestsGroup.forEach((request) => {
        if (showIterations) {
          console.log(`Processing: ${request.type}`);
        }
        expect(getRequiredWifType(request as KeychainRequest)).toBe(
          defaultExpectedValue,
        );
        if (showIterations) {
          console.log('Passed.');
        }
      });
    });
  });
});
