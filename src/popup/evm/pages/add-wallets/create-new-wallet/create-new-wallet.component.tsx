import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import {
  setErrorMessage,
  setInfoMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { Screen } from 'src/reference-data/screen.enum';

const CreateNewWallet = ({
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  setInfoMessage,
}: PropsType) => {
  const [wallet, setWallet] = useState<HDNodeWallet | undefined>(undefined);

  const [isMnemonicDisplayed, setMnemonicDisplayed] = useState(false);
  const [hasCopiedSeedPhrase, setHasCopiedSeedPhrase] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_create_new_wallet_create_seed',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });

    setWallet(EvmWalletUtils.createWallet());
  }, []);

  const submitForm = async (): Promise<void> => {
    if (!hasCopiedSeedPhrase) {
      setErrorMessage('html_popup_evm_create_wallet_copy_seed_phrase_error');
      return;
    } else {
      navigateToWithParams(Screen.CREATE_EVM_WALLET_VERIFICATION, wallet);
    }
  };

  const copySeedPhraseToClipboard = () => {
    if (wallet?.mnemonic?.phrase) {
      navigator.clipboard.writeText(wallet?.mnemonic?.phrase);
      setInfoMessage('html_popup_evm_create_wallet_copied_mnemonic');
      setHasCopiedSeedPhrase(true);
    }
  };

  return (
    <div
      data-testid={`${Screen.CREATE_EVM_WALLET}-page`}
      className="create-new-wallet-page">
      <div className="title">
        {chrome.i18n.getMessage('html_popup_evm_create_new_wallet_title')}
      </div>
      <div className="form-container">
        <div className="caption">
          {chrome.i18n.getMessage('html_popup_evm_create_wallet_tips')}
        </div>
        <div className="mnemonic-container">
          {!isMnemonicDisplayed && (
            <div className="mnemonic-overlay">
              <div>{chrome.i18n.getMessage('html_popup_mnemonic_overlay')}</div>
            </div>
          )}
          <div
            className={`words-container ${
              isMnemonicDisplayed ? 'displayed' : 'hidden'
            }`}>
            {wallet &&
              wallet.mnemonic?.phrase &&
              wallet.mnemonic?.phrase.split(' ').map((word, index) => (
                <div className="word-card" key={`word-card-${index}`}>
                  <span className="number">{index + 1}</span>
                  {word}
                </div>
              ))}
          </div>
        </div>
        {isMnemonicDisplayed && (
          <div className="mnemonic-actions">
            <div
              className="hide-seed-phrase"
              onClick={() => setMnemonicDisplayed(false)}>
              <SVGIcon icon={SVGIcons.EVM_SETUP_HIDE_MNEMONIC} />
              <span>
                {chrome.i18n.getMessage(
                  'html_popup_evm_create_wallet_hide_mnemonic',
                )}
              </span>
            </div>
            <div
              className="copy-seed-phrase"
              onClick={() => copySeedPhraseToClipboard()}>
              <SVGIcon icon={SVGIcons.EVM_SETUP_COPY_MNEMONIC} />
              <span>
                {chrome.i18n.getMessage(
                  'html_popup_evm_create_wallet_copy_mnemonic',
                )}
              </span>
            </div>
          </div>
        )}
        <div className="fill-space"></div>
        {!isMnemonicDisplayed && (
          <ButtonComponent
            dataTestId="display-mnemonic-button"
            label={'html_popup_evm_create_wallet_display_mnemonic'}
            onClick={() => setMnemonicDisplayed(true)}
          />
        )}
        {isMnemonicDisplayed && (
          <ButtonComponent
            dataTestId="submit-button"
            label={'popup_html_submit'}
            onClick={submitForm}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  setInfoMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const CreateNewWalletComponent = connector(CreateNewWallet);
