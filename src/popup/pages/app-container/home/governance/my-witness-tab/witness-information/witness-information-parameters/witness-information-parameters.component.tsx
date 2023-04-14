import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { fetchAccountTransactions } from '@popup/actions/transaction.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
//TODO change scss name file & check
import './witness-information-parameters.component.scss';

interface WitnessParametersInformationProps {
  witnessInfo: any;
}

// signing key
// blocksize
// fee : (account creation fee)
// interest rate ( % => need to divide it by 100)

const WitnessInformationParameters = ({
  witnessInfo,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  fetchAccountTransactions,
}: PropsFromRedux & WitnessParametersInformationProps) => {
  //TODO clean up & finish

  return (
    <div className="witness-information-parameters">
      <div className="label-title">Signing key</div>
      <div className="smaller-text">{witnessInfo.signing_key}</div>
      <div className="row-container">
        <div className="label-title">Blocksize</div>
        <div>{witnessInfo.maximum_block_size}</div>
      </div>
      <div className="row-container">
        <div className="label-title">Account creation fee</div>
        <div>
          {witnessInfo.account_creation_fee}{' '}
          {witnessInfo.account_creation_fee_symbol}
        </div>
      </div>
      <div className="row-container">
        <div className="label-title">Interest rate %</div>
        <div>
          {(parseFloat(witnessInfo.hbd_interest_rate) / 100).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyPrices: state.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  navigateToWithParams,
  fetchAccountTransactions,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessInformationParametersComponent = connector(
  WitnessInformationParameters,
);
