import { Screen } from '@interfaces/screen.interface';
import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import {
  EvmAccount,
  WalletWithBalance,
} from '@popup/evm/interfaces/wallet.interface';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import { HDNodeWallet } from 'ethers';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';
const ImportWalletConfirmation = ({
  setTitleContainerProperties,
  walletsWithBalance,
  setErrorMessage,
  wallet,
  mk,
  setEvmAccounts,
  chain,
}: PropsType) => {
  const [wallets, setWallets] = useState<WalletWithBalance[]>([]);

  const [nickname, setNickname] = useState<string>('');

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
      const evmAccounts: EvmAccount[] = checkedWallets.map((derivedWallet) => ({
        id: derivedWallet.wallet.index,
        path: derivedWallet.wallet.path!,
        wallet: derivedWallet.wallet,
        seedId: 0,
      }));
      await EvmWalletUtils.addSeedAndAccounts(
        wallet,
        evmAccounts,
        mk,
        nickname,
      );
      await ChainUtils.addChainToSetupChains(chain);
      setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
    }
  };

  return (
    <div
      data-testid={`${Screen.IMPORT_EVM_WALLET_CONFIRMATION}-page`}
      className="import-evm-wallet-confirmation-page">
      <FormContainer>
        <div
          className="caption"
          dangerouslySetInnerHTML={{
            __html: chrome.i18n.getMessage(
              'html_popup_evm_choose_account_text',
            ),
          }}></div>
        <Separator type="horizontal" />
        <InputComponent
          value={nickname}
          onChange={setNickname}
          type={InputType.TEXT}
          label="evm_address_nickname"
          placeholder="evm_address_nickname"
        />
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
        <div className="fill-space"></div>
        <ButtonComponent
          dataTestId="submit-button"
          label={'html_popup_evm_create_new_wallet_import'}
          onClick={submitForm}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    walletsWithBalance: state.navigation.stack[0]?.params
      ?.derivedWallets as WalletWithBalance[],
    wallet: state.navigation.stack[0].params.wallet as HDNodeWallet,
    mk: state.mk,
    chain: state.chain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setEvmAccounts,
});
type PropsType = ConnectedProps<typeof connector>;

export const ImportWalletConfirmationComponent = connector(
  ImportWalletConfirmation,
);
