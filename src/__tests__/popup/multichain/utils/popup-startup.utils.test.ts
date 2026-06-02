import { ChainType } from '@popup/multichain/interfaces/chains.interface';
import { PopupTabChainContextUtils } from '@popup/multichain/utils/popup-tab-chain-context.utils';
import { resolvePopupStartup } from '@popup/multichain/utils/popup-startup.utils';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';

describe('resolvePopupStartup', () => {
  const hiveChain = {
    name: 'HIVE',
    type: ChainType.HIVE,
    logo: '',
    chainId:
      'beeab0de00000000000000000000000000000000000000000000000000000000',
    rpcs: [],
  };
  const evmChain = {
    name: 'Base',
    type: ChainType.EVM,
    logo: '',
    chainId: '0x2105',
    rpcs: [],
  };
  const hiveAccounts = [{ name: 'alice', keys: {} }] as LocalAccount[];
  const evmAccounts = [{ wallet: { address: '0x123' } }] as EvmAccount[];

  beforeEach(() => {
    PopupTabChainContextUtils.clearTabInferredChain();
  });

  it('uses the tab-inferred chain and account type when the user has matching accounts', async () => {
    PopupTabChainContextUtils.setTabInferredChainId(hiveChain.chainId);

    const ensureChainForAccountType = jest.fn();

    await expect(
      resolvePopupStartup(
        hiveChain,
        ChainType.EVM,
        hiveAccounts,
        evmAccounts,
        ensureChainForAccountType,
      ),
    ).resolves.toEqual({
      accountType: ChainType.HIVE,
      targetChain: hiveChain,
      usedTabInferredChain: true,
    });

    expect(ensureChainForAccountType).not.toHaveBeenCalled();
    expect(PopupTabChainContextUtils.getTabInferredChainId()).toBeNull();
  });

  it('falls back to stored account preferences when tab inference is unavailable', async () => {
    const ensureChainForAccountType = jest
      .fn()
      .mockResolvedValue(evmChain);

    await expect(
      resolvePopupStartup(
        hiveChain,
        ChainType.EVM,
        hiveAccounts,
        evmAccounts,
        ensureChainForAccountType,
      ),
    ).resolves.toEqual({
      accountType: ChainType.EVM,
      targetChain: evmChain,
      usedTabInferredChain: false,
    });

    expect(ensureChainForAccountType).toHaveBeenCalledWith(ChainType.EVM);
  });

  it('falls back to stored account preferences when tab inference has no matching accounts', async () => {
    PopupTabChainContextUtils.setTabInferredChainId(hiveChain.chainId);
    const ensureChainForAccountType = jest
      .fn()
      .mockResolvedValue(evmChain);

    await expect(
      resolvePopupStartup(
        hiveChain,
        ChainType.EVM,
        [],
        evmAccounts,
        ensureChainForAccountType,
      ),
    ).resolves.toEqual({
      accountType: ChainType.EVM,
      targetChain: evmChain,
      usedTabInferredChain: false,
    });
  });
});
