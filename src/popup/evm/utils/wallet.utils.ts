import { EthersError, HDNodeWallet, Wallet } from 'ethers';

const getWalletFromSeedPhrase = (seed: string) => {
  let wallet: HDNodeWallet | undefined, error;
  let errorParams: string[] = [];
  try {
    wallet = Wallet.fromPhrase(seed);
  } catch (e) {
    const ethersError = e as EthersError;
    if (ethersError.shortMessage === 'invalid mnemonic length') {
      error = 'htlm_popup_evm_invalid_mnemonic_length';
    } else if (ethersError.shortMessage.startsWith('invalid mnemonic word')) {
      error = 'htlm_popup_evm_invalid_mnemonic_word';
      const wordIndex =
        parseInt(
          ethersError.shortMessage.replace(
            'invalid mnemonic word at index ',
            '',
          ),
        ) + 1;
      errorParams = [wordIndex + ''];
    } else if (ethersError.shortMessage === 'invalid mnemonic checksum') {
      error = 'htlm_popup_evm_invalid_mnemonic_checksum';
    }
  } finally {
    return { wallet, error, errorParams };
  }
};

const EVMWalletUtils = {
  getWalletFromSeedPhrase,
};

export default EVMWalletUtils;
