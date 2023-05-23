import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
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
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-voting-section.component.scss';

const toWitnessObject = (name: string): Witness => ({
  name,
});

const WitnessVotingSection = ({
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const handleVoteForWitnessClicked = async (account: string) => {
    if (activeAccount.account.witnesses_voted_for === 30) {
      setErrorMessage('html_popup_vote_stoodkev_witness_error_30_votes');
    } else {
      try {
        addToLoadingList('html_popup_vote_witness_operation');
        const transactionConfirmed = await WitnessUtils.voteWitness(
          toWitnessObject(account),
          activeAccount.name!,
          activeAccount.keys.active!,
        );
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_vote_witness_operation');
        if (transactionConfirmed) {
          await BlockchainTransactionUtils.delayRefresh();
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          refreshActiveAccount();
          setSuccessMessage(`html_popup_vote_${account}_witness_success`);
        }
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        removeFromLoadingList('html_popup_vote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    }
  };
  let voteForAccount: string | undefined = undefined;
  if (activeAccount.account.proxy.length === 0) {
    for (const acc of ['stoodkev', 'cedricguillas']) {
      if (!activeAccount.account.witness_votes.includes(acc)) {
        voteForAccount = acc;
        break;
      }
    }
  }
  return (
    <div className="witness-voting-section">
      <div className="text">
        {chrome.i18n.getMessage('html_popup_made_with_love_by_stoodkev')}
      </div>
      {voteForAccount && (
        <OperationButtonComponent
          ariaLabel="vote-for-stoodkev-witness"
          labelParams={[`@${voteForAccount}`]}
          onClick={() => {
            handleVoteForWitnessClicked(voteForAccount!);
          }}
          label={'html_popup_vote_for_witness'}
          requiredKey={KeychainKeyTypesLC.active}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
  };
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
