import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { HDNodeWallet } from 'ethers';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { Screen } from 'src/reference-data/screen.enum';

const CreateNewWalletVerification = ({
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  wallet,
  mk,
  setEvmAccounts,
}: PropsType) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });
  }, []);

  const submitForm = async (): Promise<void> => {
    //TODO: Show error if comparison between real seed and the one typed by the user fails

    const derivedWallet = wallet.deriveChild(0);
    const account: EvmAccount = {
      id: derivedWallet.index,
      path: derivedWallet.path!,
      wallet: derivedWallet,
    };
    await EvmWalletUtils.saveAccounts(wallet, [account], mk);
    setEvmAccounts([account]);
  };

  //TODO : Check design at https://www.figma.com/file/dNbTAJVEhzc6N9Vyc3KWO2/Hive-Keychain?type=design&node-id=2030-10481&mode=design&t=K3XrHi52olosr08f-0
  //       Try changing the style a little bit because the designers literally copied it from MM, same for text.
  //       The 1 2 3 step indicator is also not necessary and copied from MM.
  //       We don't need both the word by word verification and the whole seed phrase. let's stick with the word by word (let's ask for 4 words randomly placed)
  //       Add triple checkbox like on Hive account creation to make sure the user has properly saved the account

  return (
    <div
      data-testid={`${Screen.CREATE_EVM_WALLET_VERIFICATION}-page`}
      className="create-new-wallet-verification-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_create_new_wallet'),
        }}></div>
      <div className="form-container">
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
  return {
    wallet: state.navigation.stack[0].params as HDNodeWallet,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
  setEvmAccounts,
});
type PropsType = ConnectedProps<typeof connector>;

export const CreateNewWalletVerificationComponent = connector(
  CreateNewWalletVerification,
);
