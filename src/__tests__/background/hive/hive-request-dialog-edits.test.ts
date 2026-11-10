import { describe, expect, it } from '@jest/globals';
import { resolveAcceptedHiveRequest } from '@background/hive/requests/hive-request-dialog-edits';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { KeychainRequestTypes } from '@interfaces/keychain.interface';

const accounts = [{ name: 'alice' }, { name: 'carol' }] as any[];

const buildHandler = async (
  request: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) => {
  const handler = new HiveRequestsHandler();
  await handler.initFromLocalStorage(
    [
      {
        request_id: 4,
        tab: 7,
        domain: 'dapp.example',
        confirmed: false,
        isWaitingForConfirmation: false,
        accounts,
        request,
        ...extra,
      },
    ],
    accounts,
    {} as any,
    {},
  );
  return handler;
};

describe('accepted Hive dialog edits', () => {
  const storedTransfer = {
    request_id: 4,
    type: KeychainRequestTypes.transfer,
    username: 'alice',
    memo: 'stored-memo',
    amount: '1.000',
    to: 'bob',
  };

  it('keeps the stored request when the dialog changes memo, amount, or recipient', async () => {
    const handler = await buildHandler(storedTransfer);

    const resolved = resolveAcceptedHiveRequest(handler, {
      tab: 7,
      data: {
        ...storedTransfer,
        memo: 'evil-memo',
        amount: '999.000',
        to: 'attacker',
        username: 'carol',
      } as any,
    });

    expect(resolved?.domain).toBe('dapp.example');
    expect(resolved?.request).toEqual(storedTransfer);
  });

  it('keeps an anonymous username only when it belongs to the pending accounts', async () => {
    const storedVote = {
      request_id: 4,
      type: KeychainRequestTypes.vote,
      username: '',
      author: 'bob',
      permlink: 'post',
      weight: 10000,
    };
    const handler = await buildHandler(storedVote);

    const accepted = resolveAcceptedHiveRequest(handler, {
      tab: 7,
      data: { ...storedVote, username: 'carol', author: 'attacker' } as any,
    });
    const rejected = resolveAcceptedHiveRequest(handler, {
      tab: 7,
      data: { ...storedVote, username: 'mallory' } as any,
    });

    expect(accepted?.request).toEqual({ ...storedVote, username: 'carol' });
    expect(rejected?.request.username).toBe('');
  });

  it('accepts a typed keyless username only for a keyless pending request', async () => {
    const storedSign = {
      request_id: 4,
      type: KeychainRequestTypes.signBuffer,
      username: '',
      message: 'hello',
      method: 'Posting',
    };
    const keylessHandler = await buildHandler(storedSign, { isKeyless: true });
    const localHandler = await buildHandler(storedSign);

    const keyless = resolveAcceptedHiveRequest(
      keylessHandler,
      {
        tab: 7,
        data: { ...storedSign, username: 'typed-user' } as any,
      },
      true,
    );
    const notKeyless = resolveAcceptedHiveRequest(
      localHandler,
      {
        tab: 7,
        data: { ...storedSign, username: 'typed-user' } as any,
      },
      true,
    );

    expect(keyless?.request.username).toBe('typed-user');
    expect(notKeyless?.request.username).toBe('');
  });

  it('returns nothing when the locator is missing or does not match', async () => {
    const handler = await buildHandler(storedTransfer);
    const value = {
      tab: 7,
      data: storedTransfer as any,
    };

    expect(
      resolveAcceptedHiveRequest(handler, { ...value, tab: undefined }),
    ).toBeUndefined();
    expect(
      resolveAcceptedHiveRequest(handler, {
        ...value,
        data: { ...storedTransfer, request_id: undefined } as any,
      }),
    ).toBeUndefined();
    await handler.initFromLocalStorage(
      [...handler.requestsData, { ...handler.requestsData[0] }],
      accounts,
      {} as any,
      {},
    );
    expect(resolveAcceptedHiveRequest(handler, value)).toBeUndefined();
  });
});
