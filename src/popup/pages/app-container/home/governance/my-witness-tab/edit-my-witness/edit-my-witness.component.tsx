import { PriceType } from '@hiveio/dhive';
import { WitnessProps } from '@hiveio/dhive/lib/utils';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import { BaseCurrencies } from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './edit-my-witness.component.scss';

interface EditMyWitnessProps {
  witnessInfo: any;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditMyWitness = ({
  witnessInfo,
  setEditMode,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateTo,
}: PropsFromRedux & EditMyWitnessProps) => {
  const [formParams, setFormParams] = useState<WitnessProps>({
    account_creation_fee:
      FormatUtils.formatCurrencyValue(witnessInfo.account_creation_fee, 3) +
      ' ' +
      witnessInfo.account_creation_fee_symbol,
    maximum_block_size: witnessInfo.maximum_block_size,
    hbd_exchange_rate: {
      base:
        FormatUtils.formatCurrencyValue(witnessInfo.hbd_exchange_rate_base, 3) +
        ' ' +
        witnessInfo.hbd_exchange_rate_base_symbol,
      quote:
        FormatUtils.formatCurrencyValue(
          witnessInfo.hbd_exchange_rate_quote,
          3,
        ) +
        ' ' +
        witnessInfo.hbd_exchange_rate_quote_symbol,
    },
    hbd_interest_rate: witnessInfo.hbd_interest_rate,
    new_signing_key: witnessInfo.signing_key,
    key: witnessInfo.signing_key,
    url: witnessInfo.url,
  });

  const handleUpdateWitnessProps = async () => {
    if (!(formParams.new_signing_key as string).startsWith('STM')) {
      setErrorMessage('popup_html_public_key_needed');
      return;
    }
    formParams['key'] = formParams['new_signing_key']!;
    try {
      addToLoadingList('html_popup_update_witness_operation');
      const success = await WitnessUtils.sendWitnessAccountUpdateOperation(
        activeAccount.name!,
        activeAccount.keys.active!,
        formParams,
      );
      addToLoadingList('html_popup_confirm_transaction_operation');
      removeFromLoadingList('html_popup_update_witness_operation');
      await BlockchainTransactionUtils.delayRefresh();
      removeFromLoadingList('html_popup_confirm_transaction_operation');
      refreshActiveAccount();
      if (success) {
        goBackPage();
        setSuccessMessage('popup_success_witness_account_update');
      } else {
        setErrorMessage('popup_error_witness_account_update', [
          `${activeAccount.name!}`,
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      removeFromLoadingList('html_popup_update_witness_operation');
      removeFromLoadingList('html_popup_confirm_transaction_operation');
    } finally {
      removeFromLoadingList('html_popup_confirm_transaction_operation');
      removeFromLoadingList('html_popup_confirm_transaction_operation');
    }
  };

  const handleFormParams = (name: string, value: string | PriceType) => {
    setFormParams((prevFormParams) => {
      return { ...prevFormParams, [name]: value };
    });
  };

  const goBackPage = () => {
    setEditMode(false);
  };

  return (
    <div className="edit-my-witness-component">
      <div className="row-grid-three">
        <div className="label-title-container">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_account_creation_fee_label',
          )}
        </div>
        <InputComponent
          type={InputType.TEXT}
          placeholder="popup_html_witness_information_account_creation_fee_placeholder_text"
          value={formParams.account_creation_fee?.toString().split(' ')[0]}
          onChange={(value) =>
            handleFormParams(
              'account_creation_fee',
              value + ` ${BaseCurrencies.HIVE.toUpperCase()}`,
            )
          }
        />
        <div className="as-fake-input">{BaseCurrencies.HIVE.toUpperCase()}</div>
      </div>
      <div className="row-grid-two">
        <div className="label-title-container">
          {chrome.i18n.getMessage(
            'popup_html_witness_information_maximum_block_size_label',
          )}
        </div>
        <InputComponent
          type={InputType.TEXT}
          placeholder="popup_html_witness_information_block_size_placeholder_text"
          value={formParams.maximum_block_size}
          onChange={(value) => handleFormParams('maximum_block_size', value)}
        />
      </div>
      <InputComponent
        label="popup_html_witness_information_hbd_interest_rate_label"
        type={InputType.TEXT}
        placeholder="popup_html_witness_information_hbd_interest_rate_placeholder_text"
        value={formParams.hbd_interest_rate}
        onChange={(value) => handleFormParams('hbd_interest_rate', value)}
      />
      <InputComponent
        type={InputType.TEXT}
        label="popup_html_witness_information_signing_key_label"
        placeholder="popup_html_witness_information_signing_key_label"
        value={formParams.new_signing_key}
        onChange={(value) => handleFormParams('new_signing_key', value)}
      />
      <InputComponent
        type={InputType.TEXT}
        label="popup_html_witness_information_url_label"
        placeholder="popup_html_witness_information_url_label"
        value={formParams.url}
        onChange={(value) => handleFormParams('url', value)}
      />
      <div className="bottom-panel">
        <OperationButtonComponent
          requiredKey={KeychainKeyTypesLC.active}
          onClick={() => handleUpdateWitnessProps()}
          label={'popup_html_operation_button_save'}
        />
        <ButtonComponent
          label={'popup_html_button_label_cancel'}
          onClick={() => goBackPage()}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EditMyWitnessComponent = connector(EditMyWitness);
