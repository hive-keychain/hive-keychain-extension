import { setEvmAccounts } from '@popup/evm/actions/accounts.actions';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { setInfoMessage } from '@popup/multichain/actions/message.actions';
import { navigateTo } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';

const EvmAccountsComponent = ({
  accounts,
  mk,
  setTitleContainerProperties,
  setInfoMessage,
  navigateTo,
  setEvmAccounts,
}: PropsType) => {
  const [selectedSeed, setSelectedSeed] = useState<OptionItem>();
  const [seedsOptions, setSeedsOptions] = useState<OptionItem[]>();

  const [nickname, setNickname] = useState<string>('');
  const [openPopupAddress, setOpenPopupAddress] = useState<boolean>(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_accounts',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: false,
    });
    const options: OptionItem[] = [];
    for (const account of accounts) {
      if (!options.some((option) => option.value === account.seedId)) {
        options.push({
          value: account.seedId,
          label:
            account.seedNickname ||
            `${chrome.i18n.getMessage('common_seed')} #${account.seedId}`,
        });
      }
    }

    setSeedsOptions(options);
    setSelectedSeed(options[0]);
  }, []);

  const onCopyAddress = (account: EvmAccount) => {
    navigator.clipboard.writeText(account.wallet.address);
    setInfoMessage('popup_html_text_copied', [account.wallet.address]);
  };

  const handleAddAddressClick = () => {
    setOpenPopupAddress(true);
  };

  const handleConfirmAddAddress = async () => {
    setOpenPopupAddress(true);
    await EvmWalletUtils.addAddressToSeed(selectedSeed?.value, mk, nickname);
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

  const handleCancelAddAddress = () => {
    setOpenPopupAddress(false);
    setNickname('');
  };

  const handleAddSeedClick = () => {
    navigateTo(EvmScreen.EVM_ADD_WALLET_MAIN);
  };

  const handleHideOrShowAddress = async (
    seedId: number,
    addressId: number,
    hide: boolean,
  ) => {
    await EvmWalletUtils.hideOrShowAddress(seedId, mk, addressId, hide);
    setEvmAccounts(await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk));
  };

  return (
    <div className="evm-accounts-page">
      {seedsOptions && selectedSeed && (
        <div className="seeds">
          <ComplexeCustomSelect
            options={seedsOptions}
            selectedItem={selectedSeed}
            setSelectedItem={setSelectedSeed}
            background="white"
            additionalClassname="seeds-dropdown"
          />
          <SVGIcon
            icon={SVGIcons.GLOBAL_ADD_CIRCLE}
            onClick={handleAddSeedClick}
          />
        </div>
      )}
      <div className="accounts-panel">
        {selectedSeed &&
          accounts
            .filter((account) => account.seedId === selectedSeed.value)
            .map((account: EvmAccount) => (
              <div
                className={`account-panel ${account.hide ? 'hidden' : ''}`}
                key={`${account.seedId}-${account.id}`}>
                <EvmAccountDisplayComponent
                  account={account}
                  editable
                  copiable
                  onCopy={onCopyAddress}
                  onHideOrShow={handleHideOrShowAddress}
                  fullAddress
                />
              </div>
            ))}
      </div>
      <div className="button-panel">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          height="small"
          label="evm_add_wallet_address_button"
          onClick={handleAddAddressClick}
        />
      </div>
      {openPopupAddress && (
        <PopupContainer className="address-nickname-popup">
          <div className="popup-title">
            {chrome.i18n.getMessage('evm_add_nickname_to_address_popup_title')}
          </div>
          <div className="caption">
            {chrome.i18n.getMessage(
              'evm_add_nickname_to_address_popup_caption',
            )}
          </div>
          <InputComponent
            value={nickname}
            onChange={setNickname}
            label="evm_address_nickname"
            placeholder="evm_address_nickname"
            type={InputType.TEXT}
          />
          <div className="popup-footer">
            <ButtonComponent
              label="dialog_cancel"
              type={ButtonType.ALTERNATIVE}
              onClick={handleCancelAddAddress}
              height="small"
            />
            <ButtonComponent
              type={ButtonType.IMPORTANT}
              label="popup_html_confirm"
              onClick={handleConfirmAddAddress}
              height="small"
            />
          </div>
        </PopupContainer>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    accounts: state.evm.accounts,
    mk: state.mk,
  };
};
const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setInfoMessage,
  navigateTo,
  setEvmAccounts,
});

type PropsType = ConnectedProps<typeof connector>;

export default connector(EvmAccountsComponent);
