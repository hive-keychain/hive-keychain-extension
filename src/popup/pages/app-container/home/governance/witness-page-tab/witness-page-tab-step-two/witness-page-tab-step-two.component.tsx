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
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import { BaseCurrencies } from 'src/utils/currency.utils';
import WitnessUtils from 'src/utils/witness.utils';
//TODO here check on scss what it not needed.
import './witness-page-tab-step-two.component.scss';

interface WitnessPageTabStepTwoProps {
  witnessAccountInfo: any; //TODO type?
  setWitnessPageStep: React.Dispatch<React.SetStateAction<number>>;
}

const WitnessPageTabStepTwo = ({
  witnessAccountInfo,
  setWitnessPageStep,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
}: PropsFromRedux & WitnessPageTabStepTwoProps) => {
  const [formParams, setFormParams] = useState<WitnessProps>({
    account_creation_fee: witnessAccountInfo.props.account_creation_fee,
    account_subsidy_budget: witnessAccountInfo.props.account_subsidy_budget,
    account_subsidy_decay: witnessAccountInfo.props.account_subsidy_decay,
    maximum_block_size: witnessAccountInfo.props.maximum_block_size,
    hbd_exchange_rate: witnessAccountInfo.hbd_exchange_rate,
    hbd_interest_rate: witnessAccountInfo.props.hbd_interest_rate,
    new_signing_key: witnessAccountInfo.signing_key,
    key: witnessAccountInfo.signing_key,
    url: witnessAccountInfo.url,
  });
  const [hbdExchangeRate, setHbdExchangeRate] = useState<PriceType>(
    witnessAccountInfo.hbd_exchange_rate,
  );

  const handleUpdateWitnessProps = async () => {
    //TODO validation
    //check if any other needed?
    if (!(formParams.new_signing_key as string).startsWith('STM')) {
      setErrorMessage('popup_html_public_key_needed');
      return;
    }
    //add owner
    formParams['key'] = formParams['new_signing_key']!;
    console.log('about to process: ', { formParams });
    //execute operation + loading
    try {
      addToLoadingList('html_popup_update_witness_operation');
      const success = await WitnessUtils.sendWitnessAccountUpdateOperation(
        activeAccount.name!,
        activeAccount.keys.posting!, //TODO change to activeKey to really test the OP
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
    setWitnessPageStep(1);
  };

  return (
    <div aria-label="witness-tab-page" className="witness-tab-page">
      <div className="form-container">
        <div className="column-line">
          <div>Account creation fee</div>
          <div className="row-line">
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Account Creation Fee"
              value={formParams.account_creation_fee?.toString().split(' ')[0]}
              onChange={(value) =>
                handleFormParams(
                  'account_creation_fee',
                  value + ` ${BaseCurrencies.HIVE.toUpperCase()}`,
                )
              }
            />
            <div>{BaseCurrencies.HIVE.toUpperCase()}</div>
          </div>
          <div className="row-line">
            <div>Account subsidy budget</div>
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Account Subsidt Budget"
              value={formParams.account_subsidy_budget}
              onChange={(value) =>
                handleFormParams('account_subsidy_budget', value)
              }
            />
          </div>
          <div className="row-line">
            <div>Account subsidy decay</div>
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Account Subsidy Decay"
              value={formParams.account_subsidy_decay}
              onChange={(value) =>
                handleFormParams('account_subsidy_decay', value)
              }
            />
          </div>
          <div className="row-line">
            <div>Maximum block size</div>
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Maximum Block Size"
              value={formParams.maximum_block_size}
              onChange={(value) =>
                handleFormParams('maximum_block_size', value)
              }
            />
          </div>
          <div>Hbd exchange rate</div>
          <div className="row-line">
            <div>Base</div>
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
            <div>{BaseCurrencies.HBD.toUpperCase()}</div>
          </div>
          <div className="row-line">
            <div>Quote</div>
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
            <div>{BaseCurrencies.HIVE.toUpperCase()}</div>
          </div>
          <div>Hbd interest rate</div>
          <div className="row-line">
            <InputComponent
              type={InputType.TEXT}
              skipPlaceholderTranslation={true}
              placeholder="Interest Rate(%)"
              value={formParams.hbd_interest_rate}
              onChange={(value) => handleFormParams('hbd_interest_rate', value)}
            />
            <div>{BaseCurrencies.HIVE.toUpperCase()}</div>
          </div>
          <div>New Signing Key</div>
          <InputComponent
            type={InputType.TEXT}
            skipPlaceholderTranslation={true}
            placeholder="Signing Key"
            value={formParams.new_signing_key}
            onChange={(value) => handleFormParams('new_signing_key', value)}
          />
          <div>URL</div>
          <InputComponent
            type={InputType.TEXT}
            skipPlaceholderTranslation={true}
            placeholder="Url"
            value={formParams.url}
            onChange={(value) => handleFormParams('url', value)}
          />
        </div>
        <div>
          <OperationButtonComponent
            //TODO change to active after tests
            requiredKey={KeychainKeyTypesLC.posting}
            onClick={() => handleUpdateWitnessProps()}
            label={'popup_html_operation_button_save'}
            additionalClass={'margin-bottom margin-top'}
          />
          <ButtonComponent
            label={'popup_html_button_label_cancel'}
            onClick={() => goBackStepOne()}
            additionalClass={'margin-bottom'}
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
