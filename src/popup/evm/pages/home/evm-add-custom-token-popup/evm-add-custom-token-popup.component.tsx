import ButtonComponent, {
  ButtonType,
} from '@common-ui/button/button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { PopupContainer } from '@common-ui/popup-container/popup-container.component';
import { PopularToken } from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmTokensUtils } from '@popup/evm/utils/evm-tokens.utils';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import React, { useEffect, useState } from 'react';

interface Props {
  chain: EvmChain;
  onClose: () => void;
  onSave: (tokenAddress: string) => void;
}

export const EvmAddCustomTokenPopup = ({ chain, onClose, onSave }: Props) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [selectedItem, setSelectedItem] = useState<OptionItem | null>(null);
  const [options, setOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const popularTokens = await EvmTokensUtils.getPopularTokensForChain(chain);
    console.log(popularTokens);

    const popularTokensOptions = popularTokens.map((token: PopularToken) => ({
      label: token.symbol,
      img: token.logo,
      value: token,
    }));

    setOptions(popularTokensOptions);

    setSelectedItem(popularTokensOptions[0]);
  };

  return (
    <PopupContainer className="evm-add-custom-token-popup">
      <div className="popup-title">
        {chrome.i18n.getMessage('evm_add_custom_token_popup_title')}
      </div>
      <div className="popup-caption">
        {chrome.i18n.getMessage('evm_add_custom_token_popup_caption')}
      </div>
      {selectedItem && (
        <ComplexeCustomSelect
          options={options}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          filterable
        />
      )}
      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          onClick={onClose}
          label={'popup_html_button_label_cancel'}
        />
        <ButtonComponent
          onClick={() => onSave(tokenAddress)}
          label={'popup_html_operation_button_save'}
        />
      </div>
    </PopupContainer>
  );
};
