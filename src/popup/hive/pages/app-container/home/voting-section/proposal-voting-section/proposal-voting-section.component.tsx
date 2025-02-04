import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import {
  TransactionOptions,
  TransactionOptionsMetadata,
} from '@interfaces/keys.interface';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { addCaptionToLoading } from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { MetadataPopup } from 'src/common-ui/metadata-popup/metadata-popup.component';
import { PopupContainer } from 'src/common-ui/popup-container/popup-container.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import ProposalUtils from 'src/popup/hive/utils/proposal.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const ProposalVotingSection = ({
  activeAccount,
  isMessageContainerDisplayed,
  globalProperties,
  setSuccessMessage,
  setErrorMessage,
  addCaptionToLoading,
  openModal,
  closeModal,
}: PropsFromRedux) => {
  const [hasVoted, sethasVoted] = useState(true);
  const [forceClosed, setForcedClosed] = useState(false);

  useEffect(() => {
    if (activeAccount.name) {
      initHasVotedForProposal();
    }
  }, [activeAccount]);

  const initHasVotedForProposal = async () => {
    if (
      await ProposalUtils.isRequestingProposalVotes(globalProperties.globals!)
    ) {
      let localSkipped = await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.PROPOSAL_SKIPPED,
      );

      localSkipped =
        localSkipped &&
        localSkipped[activeAccount.name!] &&
        localSkipped[activeAccount.name!].includes(Config.KEYCHAIN_PROPOSAL);

      // Consider as already voted if it is, or if the account has a proxy or few HP
      const hasVoted =
        (await ProposalUtils.hasVotedForProposal(activeAccount.name!)) ||
        !!activeAccount.account.proxy.length ||
        FormatUtils.toHP(
          activeAccount.account.vesting_shares.toString(),
          globalProperties.globals,
        ) < 100 ||
        localSkipped;
      sethasVoted(hasVoted);
    }
  };

  const handleVoteForProposalClicked = async () => {
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
              processVote({ metaData: metadata });
              closeModal();
            }}
            onCancel={() => closeModal()}
          />
        ),
      });
    } else {
      processVote();
    }
  };

  const processVote = async (options?: TransactionOptions) => {
    const success = await ProposalUtils.voteForKeychainProposal(
      activeAccount.name!,
      activeAccount.keys.active!,
      options,
    );
    if (success) {
      if (success.isUsingMultisig) {
        setSuccessMessage('multisig_transaction_sent_to_signers');
      } else setSuccessMessage('popup_html_kc_proposal_vote_successful');
    } else {
      setErrorMessage('popup_html_proposal_vote_fail');
    }
    setForcedClosed(true);
  };

  const handleReadClicked = () => {
    chrome.tabs.create({
      url: `https://peakd.com/me/proposals/${Config.KEYCHAIN_PROPOSAL}`,
    });
  };

  const handleClose = async (event: any) => {
    event.nativeEvent.stopImmediatePropagation();
    setForcedClosed(true);
    let localSkipped = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.PROPOSAL_SKIPPED,
    );

    if (!localSkipped) {
      localSkipped = {};
    }
    if (!localSkipped[activeAccount.name!]) {
      localSkipped[activeAccount.name!] = [];
    }

    await LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.PROPOSAL_SKIPPED,
      {
        ...localSkipped,
        [activeAccount.name!]: [
          ...localSkipped[activeAccount.name!],
          Config.KEYCHAIN_PROPOSAL,
        ],
      },
    );
  };
  if (forceClosed || hasVoted) return null;
  return (
    <PopupContainer className="proposal-voting-section">
      <div className="popup-title">
        <SVGIcon icon={SVGIcons.TOP_BAR_CLOSE_BTN} onClick={handleClose} />
        {chrome.i18n.getMessage('popup_html_proposal_vote')}
      </div>
      <div className="caption">
        {chrome.i18n.getMessage('popup_html_proposal_request')}
      </div>
      <div className="popup-footer">
        <ButtonComponent
          type={ButtonType.ALTERNATIVE}
          dataTestId="button-read-proposal"
          onClick={handleReadClicked}
          label={'html_popup_read'}
          height="small"
        />
        <OperationButtonComponent
          dataTestId="vote-key-chain-proposal"
          requiredKey={KeychainKeyTypesLC.active}
          onClick={handleVoteForProposalClicked}
          label={'html_popup_vote'}
          height="small"
        />
      </div>
    </PopupContainer>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
    isMessageContainerDisplayed: state.message.key.length > 0,
    globalProperties: state.hive.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
  addCaptionToLoading,
  openModal,
  closeModal,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProposalVotingSectionComponent = connector(ProposalVotingSection);
