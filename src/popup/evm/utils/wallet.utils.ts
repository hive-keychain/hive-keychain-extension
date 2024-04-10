import { WalletWithBalance } from '@popup/evm/interfaces/wallet.interface';
import EthersUtils from '@popup/evm/utils/ethers.utils';
import { EthersError, HDNodeWallet, ethers } from 'ethers';

const getWalletFromSeedPhrase = (seed: string) => {
  let wallet: HDNodeWallet | undefined, error;
  let errorParams: string[] = [];
  try {
    wallet = HDNodeWallet.fromPhrase(seed, undefined, "44'/60'/0'/0");
  } catch (e) {
    const ethersError = e as EthersError;
    if (ethersError.shortMessage === 'invalid mnemonic length') {
      error = 'html_popup_evm_invalid_mnemonic_length';
    } else if (ethersError.shortMessage.startsWith('invalid mnemonic word')) {
      error = 'html_popup_evm_invalid_mnemonic_word';
      const wordIndex =
        parseInt(
          ethersError.shortMessage.replace(
            'invalid mnemonic word at index ',
            '',
          ),
        ) + 1;
      errorParams = [wordIndex + ''];
    } else if (ethersError.shortMessage === 'invalid mnemonic checksum') {
      error = 'html_popup_evm_invalid_mnemonic_checksum';
    }
  } finally {
    return { wallet, error, errorParams };
  }
};

const deriveWallets = async (
  wallet: HDNodeWallet,
): Promise<WalletWithBalance[]> => {
  const wallets = [];
  let i = 0,
    consecutiveEmptyWallets = 0;
  while (1) {
    const derivedWallet = wallet.deriveChild(i);
    const wei = await EthersUtils.getProvider().getBalance(
      derivedWallet.address,
    );
    const balance = Number(parseFloat(ethers.formatEther(wei)).toFixed(6));
    wallets.push({
      wallet: derivedWallet,
      balance,
      selected: true,
    });
    if (balance === 0) consecutiveEmptyWallets++;
    if (consecutiveEmptyWallets === 2) break;
    i++;
  }
  return wallets.map((e, i) => {
    const length = wallets.length;
    e.selected = i < length - 2 || i === 0;
    return e;
  });
};

const EVMWalletUtils = {
  getWalletFromSeedPhrase,
  deriveWallets,
};

export default EVMWalletUtils;
