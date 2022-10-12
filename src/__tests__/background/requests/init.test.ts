import init from '@background/requests/init';
import {
  KeychainKeyTypesLC,
  KeychainRequestTypes,
  RequestTransfer,
} from '@interfaces/keychain.interface';
import { DefaultRpcs } from '@reference-data/default-rpc.list';
import { anonymous_requests } from 'src/utils/requests.utils';
import initMocks from 'src/__tests__/background/requests/mocks/init-mocks';
import logicSpies from 'src/__tests__/background/requests/mocks/logic-spies';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import mk from 'src/__tests__/utils-for-testing/data/mk';
describe('init tests:\n', () => {
  const { methods, constants, spies } = initMocks;
  const { requestHandler, data, _accounts } = constants;
  const { decodeData, postData } = constants;
  methods.afterEach;
  methods.beforeEach;
  it('Must call Logger', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    await init(data, 0, data.domain, requestHandler);
    expect(spies.logger.info).toBeCalledWith('Initializing request logic');
  });
  it('Must call initializeWallet & saveInLocalStorage', async () => {
    methods.mocking(mk.user.one, '');
    data.type = KeychainRequestTypes.transfer;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.initializeWallet).toBeCalledWith(requestHandler, 0, data);
  });
  it('Must call addAccountToEmptyWallet', async () => {
    methods.mocking('', '');
    data.type = KeychainRequestTypes.addAccount;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.addAccountToEmptyWallet).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.domain,
    );
  });
  it('Must call unlockWallet', async () => {
    methods.mocking('', _accounts.encrypt.msg);
    data.type = KeychainRequestTypes.transfer;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.unlockWallet).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.domain,
    );
  });
  it('Must call addAccountRequest', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    data.type = KeychainRequestTypes.addAccount;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.addAccountRequest).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.domain,
      accounts.local.justTwoKeys,
    );
  });
  it('Must call addAccountRequest', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    data.type = KeychainRequestTypes.transfer;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.transferRequest).toBeCalledWith(
      requestHandler,
      0,
      data as RequestTransfer,
      data.domain,
      [accounts.local.justTwoKeys],
      DefaultRpcs[0],
      accounts.local.justTwoKeys,
    );
  });
  it('Must call anonymousRequests', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    data.username = '';
    data.type = anonymous_requests[0];
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.anonymousRequests).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.domain,
      [accounts.local.justTwoKeys],
      DefaultRpcs[0],
    );
  });
  it('Must call missingUser', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.differentName.msg);
    data.type = KeychainRequestTypes.post;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.missingUser).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.username!,
    );
  });
  it('Must call missingKey', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    await init(decodeData, 0, decodeData.domain, requestHandler);
    expect(logicSpies.missingKey).toBeCalledWith(
      requestHandler,
      0,
      decodeData,
      decodeData.username!,
      KeychainKeyTypesLC.memo,
    );
  });
  it('Must call requestWithoutConfirmation', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg, {
      'keychain.tests': { domain: { post: true } },
    });
    await init(postData, 0, postData.domain, requestHandler);
    expect(logicSpies.requestWithoutConfirmation).toBeCalledWith(
      requestHandler,
      0,
      postData,
    );
  });
  it('Must call requestWithConfirmation', async () => {
    methods.mocking(mk.user.one, _accounts.encrypt.msg);
    data.username = mk.user.one;
    data.type = KeychainRequestTypes.post;
    await init(data, 0, data.domain, requestHandler);
    expect(logicSpies.requestWithConfirmation).toBeCalledWith(
      requestHandler,
      0,
      data,
      data.domain,
      DefaultRpcs[0],
    );
  });
});
