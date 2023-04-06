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
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import { BaseCurrencies } from 'src/utils/currency.utils';
import WitnessUtils from 'src/utils/witness.utils';
//TODO here check on scss what it not needed.
import FormatUtils from 'src/utils/format.utils';
import './witness-page-tab-step-two.component.scss';

interface WitnessPageTabStepTwoProps {
  witnessInfo: any;
  setWitnessPageStep: React.Dispatch<
    React.SetStateAction<{
      page: number;
      props?: any;
    }>
  >;
}

const WitnessPageTabStepTwo = ({
  witnessInfo,
  setWitnessPageStep,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
}: PropsFromRedux & WitnessPageTabStepTwoProps) => {
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
  const [hbdExchangeRate, setHbdExchangeRate] = useState<PriceType>({
    base:
      FormatUtils.formatCurrencyValue(witnessInfo.hbd_exchange_rate_base, 3) +
      ' ' +
      witnessInfo.hbd_exchange_rate_base_symbol,
    quote:
      FormatUtils.formatCurrencyValue(witnessInfo.hbd_exchange_rate_quote, 3) +
      ' ' +
      witnessInfo.hbd_exchange_rate_quote_symbol,
  });

  const handleUpdateWitnessProps = async () => {
    if (!(formParams.new_signing_key as string).startsWith('STM')) {
      setErrorMessage('popup_html_public_key_needed');
      return;
    }
    formParams['key'] = formParams['new_signing_key']!;
    console.log('about to process: ', { formParams });
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
      console.log({ success }); //TODO to remove
      if (success) {
        setSuccessMessage('popup_success_witness_account_update', [
          `${activeAccount.name!}`,
        ]);
        //TODO what to do here?? move to step 1 but reloading data???
      } else {
        setErrorMessage('popup_error_witness_account_update', [
          `${activeAccount.name!}`,
        ]);
      }
    } catch (err: any) {
      console.log('Error: ', { err }); //TODO to remove
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

  useEffect(() => {
    handleFormParams('hbd_exchange_rate', hbdExchangeRate);
  }, [hbdExchangeRate]);

  const goBackStepOne = () => {
    setWitnessPageStep({ page: 1 });
  };

  return (
    <div className="witness-tab-page-step-two">
      <div className="form-container">
        <div className="column-line">
          <div className="row-line">
            <div className="row-line half-width">
              <InputComponent
                label="popup_html_witness_information_fee_label"
                type={InputType.TEXT}
                skipPlaceholderTranslation={true}
                placeholder="popup_html_witness_information_fee_label"
                value={
                  formParams.account_creation_fee?.toString().split(' ')[0]
                }
                onChange={(value) =>
                  handleFormParams(
                    'account_creation_fee',
                    value + ` ${BaseCurrencies.HIVE.toUpperCase()}`,
                  )
                }
              />
              <div className="label-title">
                {BaseCurrencies.HIVE.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="row-line">
            <div className="half-width">
              <InputComponent
                label="popup_html_witness_information_maximum_block_size_label"
                type={InputType.TEXT}
                skipPlaceholderTranslation={true}
                placeholder="Maximum Block Size"
                value={formParams.maximum_block_size}
                onChange={(value) =>
                  handleFormParams('maximum_block_size', value)
                }
              />
            </div>
          </div>
          <div className="row-line">
            <div className="label-title">
              {chrome.i18n.getMessage(
                'popup_html_witness_information_exchange_rate_base_label',
              )}
            </div>
            <div className="row-line half-width">
              <InputComponent
                type={InputType.TEXT}
                skipPlaceholderTranslation={true}
                placeholder="Base Exchange Rate"
                value={hbdExchangeRate.base.toString().split(' ')[0]}
                onChange={(value) =>
                  setHbdExchangeRate((prevExchangerate) => {
                    return {
                      ...prevExchangerate,
                      base: value + ` ${BaseCurrencies.HBD.toUpperCase()}`,
                    };
                  })
                }
              />
              <div className="label-title">
                {BaseCurrencies.HBD.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="row-line">
            <div className="label-title">
              {chrome.i18n.getMessage(
                'popup_html_witness_information_exchange_rate_quote_label',
              )}
            </div>
            <div className="row-line half-width">
              <InputComponent
                type={InputType.TEXT}
                skipPlaceholderTranslation={true}
                placeholder="Quote Exchange Rate"
                value={hbdExchangeRate.quote.toString().split(' ')[0]}
                onChange={(value) =>
                  setHbdExchangeRate((prevExchangerate) => {
                    return {
                      ...prevExchangerate,
                      quote: value + ` ${BaseCurrencies.HIVE.toUpperCase()}`,
                    };
                  })
                }
              />
              <div className="label-title">
                {BaseCurrencies.HIVE.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="row-line">
            <div className="label-title">
              {chrome.i18n.getMessage(
                'popup_html_witness_information_hbd_interest_rate_label',
              )}
            </div>
            <div className="row-line half-width">
              <InputComponent
                type={InputType.TEXT}
                skipPlaceholderTranslation={true}
                placeholder="Interest Rate(%)"
                value={formParams.hbd_interest_rate}
                onChange={(value) =>
                  handleFormParams('hbd_interest_rate', value)
                }
              />
            </div>
          </div>
          <div className="label-title padding-top">
            {chrome.i18n.getMessage(
              'popup_html_witness_information_signing_key_label',
            )}
          </div>
          <div className="customised-width">
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Signing Key"
              value={formParams.new_signing_key}
              onChange={(value) => handleFormParams('new_signing_key', value)}
            />
          </div>
          <div className="label-title padding-top">
            {chrome.i18n.getMessage('popup_html_witness_information_url_label')}
          </div>
          <div className="customised-width">
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Url"
              value={formParams.url}
              onChange={(value) => handleFormParams('url', value)}
            />
          </div>
        </div>
        <div className="padding-bottom padding-top">
          <OperationButtonComponent
            requiredKey={KeychainKeyTypesLC.active}
            onClick={() => handleUpdateWitnessProps()}
            label={'popup_html_operation_button_save'}
          />
        </div>
        <div className="padding-bottom">
          <ButtonComponent
            label={'popup_html_button_label_cancel'}
            onClick={() => goBackStepOne()}
          />
        </div>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessPageTabStepTwoComponent = connector(WitnessPageTabStepTwo);
