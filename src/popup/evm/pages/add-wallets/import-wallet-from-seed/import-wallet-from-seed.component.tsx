import { Screen } from '@interfaces/screen.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { removeFromLoadingList } from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { TextAreaComponent } from 'src/common-ui/text-area/textarea.component';
const ImportWalletFromSeed = ({
  chain,
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  hasFinishedSignup,
  accounts,
}: PropsType) => {
  const [seed, setSeed] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_import_wallet_from_seed',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: !hasFinishedSignup,
    });
  }, []);

  const submitForm = async (): Promise<void> => {
    if (
      accounts.some(
        (account) =>
          account.wallet.mnemonic?.phrase.trim().toLowerCase() ===
          seed.join(' ').trim().toLowerCase(),
      )
    ) {
      setErrorMessage('evm_seeds_already_in_keychain');
      return;
    }

    const { wallet, error, errorParams } =
      EvmWalletUtils.getWalletFromSeedPhrase(seed.join(' '));

    if (wallet) {
      setLoading(true);

      const derivedWallets = await EvmWalletUtils.deriveWallets(wallet, chain);
      setLoading(false);
      removeFromLoadingList('html_popup_deriving_wallets');
      navigateToWithParams(Screen.IMPORT_EVM_WALLET_CONFIRMATION, {
        wallet,
        derivedWallets,
      });
    } else {
      setErrorMessage(error!, errorParams);
    }
  };

  return (
    <div
      data-testid={`${Screen.IMPORT_EVM_WALLET}-page`}
      className="import-evm-wallet">
      <FormContainer>
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage('html_popup_evm_setup_import_text'),
          }}></div>
        <Separator type="horizontal" />
        <TextAreaComponent
          dataTestId="input-seed-key"
          value={seed}
          onChange={setSeed}
          label="html_popup_evm_seed_phrase"
          placeholder="html_popup_evm_seed_phrase_placeholder"
          rows={4}
          useChips
          maxChips={12}
        />
        <div className="fill-space"></div>
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_submit'}
          onClick={submitForm}
        />
      </FormContainer>
      <LoadingComponent hide={!isLoading} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    hasFinishedSignup: state.hasFinishedSignup,
    chain: state.chain as EvmChain,
    accounts: state.evm.accounts,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const ImportWalletFromSeedComponent = connector(ImportWalletFromSeed);
