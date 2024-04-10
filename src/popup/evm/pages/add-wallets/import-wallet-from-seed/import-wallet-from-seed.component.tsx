import EVMWalletUtils from '@popup/evm/utils/wallet.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Screen } from 'src/reference-data/screen.enum';
const ImportWalletFromSeed = ({
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  hasFinishedSignup,
}: PropsType) => {
  const [seed, setSeed] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: !hasFinishedSignup,
    });
  }, []);

  const submitForm = async (): Promise<void> => {
    const { wallet, error, errorParams } =
      EVMWalletUtils.getWalletFromSeedPhrase(seed);
    if (wallet) {
      const derivedWallets = await EVMWalletUtils.deriveWallets(wallet);
      navigateToWithParams(
        Screen.IMPORT_EVM_WALLET_CONFIRMATION,
        derivedWallets,
      );
    } else {
      setErrorMessage(error!, errorParams);
    }
  };

  //TODO: - make input field a textarea (already passed as a type property to the input)
  //TODO: - add loader while deriving wallets

  return (
    <div
      data-testid={`${Screen.IMPORT_EVM_WALLET}-page`}
      className="import-evm-wallet">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_setup_import_text'),
        }}></div>
      <div className="form-container">
        <InputComponent
          dataTestId="input-seed-key"
          value={seed}
          onChange={setSeed}
          label="html_popup_evm_seed_phrase"
          placeholder="html_popup_evm_seed_phrase_placeholder"
          type={InputType.TEXT_AREA}
          onEnterPress={submitForm}
        />
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_submit'}
          onClick={submitForm}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { hasFinishedSignup: state.hasFinishedSignup };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const ImportWalletFromSeedComponent = connector(ImportWalletFromSeed);
