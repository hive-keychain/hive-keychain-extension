import BlockchainTransactionUtils from '@hiveapp/utils/blockchain.utils';
import WitnessUtils from '@hiveapp/utils/witness.utils';
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
          dataTestId="vote-for-stoodkev-witness"
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