import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Screen } from 'src/reference-data/screen.enum';

const CreateNewWallet = ({
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
}: PropsType) => {
  const [wallet, setWallet] = useState<HDNodeWallet | undefined>(undefined);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });

    setWallet(EvmWalletUtils.createWallet());
  }, []);

  const submitForm = async (): Promise<void> => {
    navigateToWithParams(Screen.CREATE_EVM_WALLET_VERIFICATION, wallet);
  };

  //TODO : Check design at https://www.figma.com/file/dNbTAJVEhzc6N9Vyc3KWO2/Hive-Keychain?type=design&node-id=2019-27438&mode=design&t=2ndSu5FX9uM66mlb-0
  //       and next one also (mnemonics shown or hidden should be on this same page)
  //       Try changing the style a little bit because the designers literally copied it from MM, same for text.
  //       The 1 2 3 step indicator is also not necessary and copied from MM.
  //       Words should have numbers to know in which number they should be copied
  return (
    <div
      data-testid={`${Screen.CREATE_EVM_WALLET}-page`}
      className="create-new-wallet-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_create_new_wallet'),
        }}></div>
      <div className="form-container">
        <div className="mnemonic-container">
          {wallet && wallet.mnemonic?.phrase}
        </div>
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
  return {};
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const CreateNewWalletComponent = connector(CreateNewWallet);
