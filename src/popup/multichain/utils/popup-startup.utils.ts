import { ActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { ActiveAccountTypeUtils } from '@popup/multichain/utils/active-account-type.utils';
import { PopupTabChainContextUtils } from '@popup/multichain/utils/popup-tab-chain-context.utils';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { LocalAccount } from 'src/interfaces/local-account.interface';

export interface PopupStartupResolution {
  accountType: ActiveAccountType;
  targetChain: Chain | undefined;
  usedTabInferredChain: boolean;
}

const isStartupChainReady = (chain: Chain | undefined): chain is Chain =>
  !!chain?.chainId &&
  !!chain?.name?.length &&
  (chain.type === ChainType.HIVE || chain.type === ChainType.EVM);

export const resolvePopupStartup = async (
  currentChain: Chain,
  storedActiveAccountType: unknown,
  hiveAccounts: LocalAccount[],
  evmAccounts: EvmAccount[],
  ensureChainForAccountType: (
    accountType: ActiveAccountType,
  ) => Promise<Chain | undefined>,
): Promise<PopupStartupResolution> => {
  const tabInferredAccountType =
    ActiveAccountTypeUtils.getActiveAccountTypeForTabInferredChain(
      currentChain,
      hiveAccounts,
      evmAccounts,
    );
  const canUseTabInferredChain =
    PopupTabChainContextUtils.isCurrentChainTabInferred(currentChain) &&
    isStartupChainReady(currentChain) &&
    tabInferredAccountType !== null;

  if (canUseTabInferredChain) {
    PopupTabChainContextUtils.clearTabInferredChain();
    return {
      accountType: tabInferredAccountType,
      targetChain: currentChain,
      usedTabInferredChain: true,
    };
  }

  const accountType = ActiveAccountTypeUtils.getActiveAccountType(
    storedActiveAccountType,
    currentChain,
    hiveAccounts,
    evmAccounts,
  );
  const targetChain = await ensureChainForAccountType(accountType);

  PopupTabChainContextUtils.clearTabInferredChain();

  return {
    accountType,
    targetChain,
    usedTabInferredChain: false,
  };
};
