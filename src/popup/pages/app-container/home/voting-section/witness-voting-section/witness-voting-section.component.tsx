import { Witness } from '@interfaces/witness.interface';
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
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-voting-section.component.scss';

const STOODKEV_WITNESS: Witness = {
  name: 'stoodkev',
};

const WitnessVotingSection = ({
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const handleVoteForWitnessClicked = async () => {
    if (activeAccount.account.witnesses_voted_for === 30) {
      setErrorMessage('html_popup_vote_stoodkev_witness_error_30_votes');
    } else {
      addToLoadingList('html_popup_vote_witness_operation');
      const result = await WitnessUtils.voteWitness(
        STOODKEV_WITNESS,
        activeAccount,
      );
      addToLoadingList('html_popup_confirm_transaction_operation');
      removeFromLoadingList('html_popup_vote_witness_operation');
      if (result.id) {
        const transactionConfirmation =
          await BlockchainTransactionUtils.tryConfirmTransaction(result.id);
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        if (transactionConfirmation.error) {
          setErrorMessage('html_popup_witness_vote_transaction_not_had_error');
        } else {
          refreshActiveAccount();
          setSuccessMessage('html_popup_vote_stoodkev_witness_success');
        }
      }
    }
  };

  return (
    <div className="witness-voting-section">
      <div className="text">
        {chrome.i18n.getMessage('html_popup_made_with_love_by_stoodkev')}
      </div>
      <ButtonComponent
        onClick={handleVoteForWitnessClicked}
        label={'html_popup_vote_for_witness'}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  refreshActiveAccount,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingSectionComponent = connector(WitnessVotingSection);
