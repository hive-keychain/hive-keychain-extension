import { Screen } from '@interfaces/screen.interface';
import { loadEvmActiveAccount } from '@popup/evm/actions/active-account.actions';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmLightNodeUtils } from '@popup/evm/utils/evm-light-node.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setActiveAccountType } from '@popup/multichain/actions/active-account-type.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';

import { I18nUtils } from 'src/utils/i18n.utils';
const ImportWalletFromKey = ({
  accounts,
  chain,
  loadEvmActiveAccount,
  mk,
  navigateTo,
  setActiveAccountType,
  setEvmAccounts,
  setErrorMessage,
  setTitleContainerProperties,
}: PropsType) => {
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_import_wallet_from_key',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
  }, []);

  const isAddressAlreadyImported = (address: string) => {
    return accounts.some(
      (account) =>
        EvmWalletUtils.getAccountAddress(account).toLowerCase() ===
        address.toLowerCase(),
    );
  };

  const submitForm = async (): Promise<void> => {
    const { wallet, error } = EvmWalletUtils.getWalletFromPrivateKey(privateKey);
    if (!wallet) {
      setErrorMessage(error!);
      return;
    }

    if (isAddressAlreadyImported(wallet.address)) {
      setErrorMessage('evm_private_key_already_in_keychain');
      return;
    }

    try {
      await EvmWalletUtils.addImportedWallet(wallet, mk);
    } catch (error) {
      setErrorMessage((error as Error).message);
      return;
    }

    await ChainUtils.addChainToSetupChains(chain);
    if (!(chain as EvmChain).isCustom) {
      await EvmLightNodeUtils.registerAddress(
        chain.chainId,
        wallet.address,
        false,
      );
    }

    const updatedAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    setEvmAccounts(updatedAccounts);
    setActiveAccountType(ChainType.EVM);
    await loadEvmActiveAccount(chain, wallet);
    navigateTo(Screen.HOME_PAGE, true);
  };

  return (
    <div
      data-testid={`${Screen.IMPORT_EVM_WALLET_FROM_KEY}-page`}
      className="import-evm-wallet">
      <FormContainer>
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: I18nUtils.getMessage(
              'html_popup_evm_setup_import_key_text',
            ),
          }}></div>
        <Separator type="horizontal" />
        <InputComponent
          dataTestId="input-private-key"
          value={privateKey}
          onChange={setPrivateKey}
          label="popup_html_private_key"
          placeholder="popup_html_private_key"
          type={InputType.PASSWORD}
          onEnterPress={submitForm}
        />
        <div className="fill-space"></div>
        <ButtonComponent
          dataTestId="submit-button"
          label={'popup_html_submit'}
          onClick={submitForm}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    chain: state.chain as EvmChain,
    mk: state.mk,
  };
};

const connector = connect(mapStateToProps, {
  loadEvmActiveAccount,
  navigateTo,
  setActiveAccountType,
  setEvmAccounts,
  setErrorMessage,
  setTitleContainerProperties,
});
type PropsType = ConnectedProps<typeof connector>;

export const ImportWalletFromKeyComponent = connector(ImportWalletFromKey);
