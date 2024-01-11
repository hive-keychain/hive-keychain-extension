import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { Witness } from '@interfaces/witness.interface';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import {
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';
import BlockchainTransactionUtils from 'src/popup/hive/utils/blockchain.utils';
import WitnessUtils from 'src/popup/hive/utils/witness.utils';

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
          if (transactionConfirmed.isUsingMultisig) {
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else
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
      {voteForAccount && (
        <OperationButtonComponent
          dataTestId="vote-for-stoodkev-witness"
          labelParams={[`@${voteForAccount}`]}
          onClick={() => {
            handleVoteForWitnessClicked(voteForAccount!);
          }}
          label={'html_popup_vote_for_witness'}
          requiredKey={KeychainKeyTypesLC.active}
          height="small"
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
