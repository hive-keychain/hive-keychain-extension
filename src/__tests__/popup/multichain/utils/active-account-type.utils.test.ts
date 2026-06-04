import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { ActiveAccountTypeUtils } from '@popup/multichain/utils/active-account-type.utils';
import { LocalAccount } from 'src/interfaces/local-account.interface';

const hiveChain = { type: ChainType.HIVE, chainId: 'hive' } as Chain;
const evmChain = { type: ChainType.EVM, chainId: '0x1' } as Chain;
const noChain = { type: ChainType.NONE, chainId: '' } as Chain;
const hiveAccounts = [{ name: 'alice', keys: {} }] as LocalAccount[];
const evmAccounts = [{ wallet: { address: '0x123' } }] as EvmAccount[];

describe('ActiveAccountTypeUtils', () => {
  it('uses the stored active account type when valid', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        ChainType.EVM,
        hiveChain,
        hiveAccounts,
        evmAccounts,
      ),
    ).toBe(ChainType.EVM);
  });

  it('falls back to available account type when stored account type has no accounts', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        ChainType.EVM,
        evmChain,
        hiveAccounts,
        [],
      ),
    ).toBe(ChainType.HIVE);
  });

  it('falls back to the active chain type', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        undefined,
        evmChain,
        hiveAccounts,
        evmAccounts,
      ),
    ).toBe(ChainType.EVM);
  });

  it('falls back to available account type when active chain has no accounts', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        undefined,
        evmChain,
        hiveAccounts,
        [],
      ),
    ).toBe(ChainType.HIVE);
  });

  it('uses EVM when only EVM accounts are available and no chain type is active', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        undefined,
        noChain,
        [],
        evmAccounts,
      ),
    ).toBe(ChainType.EVM);
  });

  it('defaults to Hive when no migration signal is available', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountType(
        undefined,
        noChain,
        hiveAccounts,
        evmAccounts,
      ),
    ).toBe(ChainType.HIVE);
  });

  it('returns the tab-inferred account type when accounts exist for the chain', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountTypeForTabInferredChain(
        hiveChain,
        hiveAccounts,
        evmAccounts,
      ),
    ).toBe(ChainType.HIVE);
  });

  it('returns null for tab-inferred account type when no accounts exist for the chain', () => {
    expect(
      ActiveAccountTypeUtils.getActiveAccountTypeForTabInferredChain(
        hiveChain,
        [],
        evmAccounts,
      ),
    ).toBeNull();
  });
});
