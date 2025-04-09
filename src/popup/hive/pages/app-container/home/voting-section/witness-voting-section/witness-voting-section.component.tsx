import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import {
  TransactionOptions,
  TransactionOptionsMetadata,
} from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import {
  addCaptionToLoading,
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { MetadataPopup } from 'src/common-ui/metadata-popup/metadata-popup.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
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
  addCaptionToLoading,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const processVoteForWitness = async (
    account: string,
    options?: TransactionOptions,
  ) => {
    try {
      addToLoadingList('html_popup_vote_witness_operation');
      const transactionConfirmed = await WitnessUtils.voteWitness(
        toWitnessObject(account),
        activeAccount.name!,
        activeAccount.keys.active!,
        options,
      );
      addToLoadingList('html_popup_confirm_transaction_operation');
      removeFromLoadingList('html_popup_vote_witness_operation');
      if (transactionConfirmed) {
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        if (transactionConfirmed.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else setSuccessMessage(`html_popup_vote_${account}_witness_success`);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      removeFromLoadingList('html_popup_vote_witness_operation');
      removeFromLoadingList('html_popup_confirm_transaction_operation');
    }
  };

  const handleVoteForWitnessClicked = async (account: string) => {
    if (activeAccount.account.witnesses_voted_for === 30) {
      setErrorMessage('html_popup_vote_stoodkev_witness_error_30_votes');
    } else {
      const twoFaAccounts = await MultisigUtils.get2FAAccounts(
        activeAccount.account,
        KeychainKeyTypes.active,
      );

      let initialMetadata = {} as TransactionOptionsMetadata;
      for (const account of twoFaAccounts) {
        if (!initialMetadata.twoFACodes) initialMetadata.twoFACodes = {};
        initialMetadata.twoFACodes[account] = '';
      }

      if (twoFaAccounts.length > 0) {
        openModal({
          title: 'popup_html_transaction_metadata',
          children: (
            <MetadataPopup
              initialMetadata={initialMetadata}
              onSubmit={(metadata: TransactionOptionsMetadata) => {
                addCaptionToLoading('multisig_transmitting_to_2fa');
                processVoteForWitness(account, { metaData: metadata });
                closeModal();
              }}
              onCancel={() => closeModal()}
            />
          ),
        });
      } else {
        processVoteForWitness(account);
      }
    }
  };

  let voteForAccount: string | undefined = undefined;
  if (activeAccount.account.proxy.length === 0) {
    for (const acc of [
      'stoodkev',
      // 'cedricguillas'
    ]) {
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
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  refreshActiveAccount,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  addCaptionToLoading,
  openModal,
  closeModal,
});

type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessVotingSectionComponent = connector(WitnessVotingSection);
