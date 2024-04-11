import { WalletWithBalance } from '@popup/evm/interfaces/wallet.interface';
import EvmFormatUtils from '@popup/evm/utils/format.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { Screen } from 'src/reference-data/screen.enum';
const ImportWalletConfirmation = ({
  navigateToWithParams,
  setTitleContainerProperties,
  walletsWithBalance,
  setErrorMessage,
  wallet,
}: PropsType) => {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);
  useEffect(() => {
    setTitleContainerProperties({
      title: 'html_popup_evm_choose_account',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: true,
    });
  }, []);

  useEffect(() => {
    setWallets(walletsWithBalance);
  }, [walletsWithBalance]);

  const onChangeSelected = (i: number) => {
    const walletsCopy = [...wallets];
    walletsCopy[i].selected = !walletsCopy[i].selected;
    setWallets(walletsCopy);
  };
  const submitForm = async (): Promise<void> => {
    const checkedWallets = wallets.filter((e) => e.selected);
    if (!checkedWallets.length) {
      setErrorMessage('html_popup_evm_error_select_account');
    } else {
      //TODO: Save account and pass in reducer
    }
  };

  return (
    <div
      data-testid={`${Screen.IMPORT_EVM_WALLET_CONFIRMATION}-page`}
      className="import-evm-wallet-confirmation-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('html_popup_evm_choose_account_text'),
        }}></div>
      <div className="form-container">
        {wallets.map((e, i) => {
          return (
            <CheckboxPanelComponent
              checked={e.selected}
              onChange={() => {
                onChangeSelected(i);
              }}
              key={e.wallet.address}
              skipTranslation
              title={`${chrome.i18n.getMessage('dialog_account')} ${
                i + 1
              }: ${EvmFormatUtils.formatAddress(e.wallet.address)}`}
              hint={`${chrome.i18n.getMessage('popup_html_balance')}: ${
                e.balance
              } ETH`}
              skipHintTranslation
            />
          );
        })}
        <ButtonComponent
          dataTestId="submit-button"
          label={'html_popup_evm_create_new_wallet'}
          onClick={submitForm}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    walletsWithBalance: state.navigation.stack[0].params
      .derivedWallets as WalletWithBalance[],
    wallet: state.navigation.stack[0].params.wallet as HDNodeWallet,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  setTitleContainerProperties,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const ImportWalletConfirmationComponent = connector(
  ImportWalletConfirmation,
);
