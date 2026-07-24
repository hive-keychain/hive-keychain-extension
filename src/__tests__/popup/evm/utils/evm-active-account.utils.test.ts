import { EvmAccountSource } from '@popup/evm/interfaces/wallet.interface';
import { EvmActiveAccountUtils } from '@popup/evm/utils/evm-active-account.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const firstWallet = { address: '0x111' } as any;
const secondWallet = { address: '0x222' } as any;
const hiddenWallet = { address: '0x333' } as any;

const accounts = [
  {
    id: 0,
    path: "m/44'/60'/0'/0/0",
    seedId: 0,
    source: EvmAccountSource.SEED,
    wallet: firstWallet,
  },
  {
    id: 1,
    path: "m/44'/60'/0'/0/1",
    seedId: 0,
    source: EvmAccountSource.SEED,
    wallet: secondWallet,
  },
  {
    id: 2,
    path: "m/44'/60'/0'/0/2",
    seedId: 0,
    source: EvmAccountSource.SEED,
    hide: true,
    wallet: hiddenWallet,
  },
];

describe('EvmActiveAccountUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('saves one EVM active account address', async () => {
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue();

    await EvmActiveAccountUtils.saveActiveAccountWallet(secondWallet.address);

    expect(saveSpy).toHaveBeenCalledWith(
      LocalStorageKeyEnum.EVM_ACTIVE_ACCOUNT_WALLET,
      secondWallet.address,
    );
  });

  it('loads the saved EVM active account address', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(secondWallet.address);

    const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
      accounts,
    );

    expect(wallet).toBe(secondWallet);
  });

  it('falls back to the first visible account when the saved address is hidden', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue(hiddenWallet.address);

    const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
      accounts,
    );

    expect(wallet).toBe(firstWallet);
  });

  it('supports the previous chain-keyed storage shape', async () => {
    jest.spyOn(LocalStorageUtils, 'getValueFromLocalStorage').mockResolvedValue({
      '0x1': hiddenWallet.address,
      '0x89': secondWallet.address,
    });

    const wallet = await EvmActiveAccountUtils.getSavedActiveAccountWallet(
      accounts,
    );

    expect(wallet).toBe(secondWallet);
  });
});
