import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import EncryptUtils from '@popup/hive/utils/encrypt.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { HDNodeWallet } from 'ethers';
import { CommunicationUtils } from 'src/utils/communication.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

describe('evm wallet utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('reads legacy hostname permissions and migrates them to origin storage', async () => {
    const walletPermissions = {
      localhost: {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xAbC123', '0xabc123'],
      },
    };
    const getSpy = jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(walletPermissions);
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined);

    const connectedWallets = await EvmWalletUtils.getConnectedWallets(
      'http://localhost:3000',
    );

    expect(connectedWallets).toEqual(['0xabc123']);
    expect(getSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS);
    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS,
      {
        localhost: {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xabc123'],
        },
        'http://localhost:3000': {
          [EvmRequestPermission.ETH_ACCOUNTS]: ['0xabc123'],
        },
      },
    );
  });

  it('keeps an exact-origin empty entry so legacy fallback stays revoked for that origin', async () => {
    let walletPermissions: Record<string, any> = {
      localhost: {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xAbC123'],
      },
    };

    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) => {
        if (key === LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS) {
          return walletPermissions;
        }

        return undefined;
      });
    jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        if (key === LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS) {
          walletPermissions = value;
        }
      });

    await EvmWalletUtils.revokeAllPermissions('http://localhost:3000');

    await expect(
      EvmWalletUtils.getConnectedWallets('http://localhost:3000'),
    ).resolves.toEqual([]);
    expect(walletPermissions).toEqual({
      localhost: {
        [EvmRequestPermission.ETH_ACCOUNTS]: ['0xabc123'],
      },
      'http://localhost:3000': {},
    });
  });

  it('rebuilds EVM accounts without keeping mnemonic phrases on runtime wallets', async () => {
    const seed =
      'test test test test test test test test test test test junk';
    jest.spyOn(HDNodeWallet, 'fromPhrase').mockReturnValue({
      privateKey:
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    } as HDNodeWallet);
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({ encrypted: true });
    jest.spyOn(EncryptUtils, 'decryptToJsonWithLegacySupport').mockResolvedValue({
      list: [
        {
          id: 1,
          seed,
          accounts: [
            {
              id: 0,
              path: "44'/60'/0'/0/0",
              order: 0,
            },
          ],
        },
      ],
    });

    const accounts = await EvmWalletUtils.rebuildAccountsFromLocalStorage('mk');

    expect(HDNodeWallet.fromPhrase).toHaveBeenCalledWith(
      seed,
      undefined,
      "44'/60'/0'/0/0",
    );
    expect(accounts[0].wallet.address).toBe(
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    );
    expect(accounts[0].wallet.privateKey).toEqual(expect.any(String));
    expect(accounts[0].wallet.mnemonic?.phrase).toBeUndefined();
  });

  it('moves the selected account first in provider account lists only', async () => {
    let walletPermissions: Record<string, any> = {
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x1111111111111111111111111111111111111111',
          '0x2222222222222222222222222222222222222222',
        ],
      },
      'https://beta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x3333333333333333333333333333333333333333',
          '0x2222222222222222222222222222222222222222',
        ],
      },
      'https://gamma.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x2222222222222222222222222222222222222222',
          '0x4444444444444444444444444444444444444444',
        ],
      },
    };
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockImplementation(async (key) =>
        key === LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS
          ? walletPermissions
          : undefined,
      );
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockImplementation(async (key, value) => {
        if (key === LocalStorageKeyEnum.EVM_WALLET_PERMISSIONS) {
          walletPermissions = value;
        }
      });
    const runtimeSendMessageSpy = jest
      .spyOn(CommunicationUtils, 'runtimeSendMessage')
      .mockResolvedValue(undefined);

    await EvmWalletUtils.promoteConnectedWalletAddress(
      '0x2222222222222222222222222222222222222222',
    );

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(runtimeSendMessageSpy).toHaveBeenCalledTimes(2);
    expect(runtimeSendMessageSpy).toHaveBeenNthCalledWith(1, {
      command: BackgroundCommand.SEND_EVM_EVENT,
      value: {
        eventType: 'accountsChanged',
        args: [
          '0x2222222222222222222222222222222222222222',
          '0x1111111111111111111111111111111111111111',
        ],
        scope: { kind: 'origin', origin: 'https://alpha.example' },
      },
    });
    expect(runtimeSendMessageSpy).toHaveBeenNthCalledWith(2, {
      command: BackgroundCommand.SEND_EVM_EVENT,
      value: {
        eventType: 'accountsChanged',
        args: [
          '0x2222222222222222222222222222222222222222',
          '0x3333333333333333333333333333333333333333',
        ],
        scope: { kind: 'origin', origin: 'https://beta.example' },
      },
    });
    expect(walletPermissions).toEqual({
      'https://alpha.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x2222222222222222222222222222222222222222',
          '0x1111111111111111111111111111111111111111',
        ],
      },
      'https://beta.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x2222222222222222222222222222222222222222',
          '0x3333333333333333333333333333333333333333',
        ],
      },
      'https://gamma.example': {
        [EvmRequestPermission.ETH_ACCOUNTS]: [
          '0x2222222222222222222222222222222222222222',
          '0x4444444444444444444444444444444444444444',
        ],
      },
    });
  });
});
