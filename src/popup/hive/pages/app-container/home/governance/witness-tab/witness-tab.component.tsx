import {
  PrivateKeyType,
  TransactionOptions,
  TransactionOptionsMetadata,
} from '@interfaces/keys.interface';
import { Witness } from '@interfaces/witness.interface';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
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
import FlatList from 'flatlist-react';
import { KeychainKeyTypes, KeychainKeyTypesLC } from 'hive-keychain-commons';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { MetadataPopup } from 'src/common-ui/metadata-popup/metadata-popup.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import AccountUtils from 'src/popup/hive/utils/account.utils';
import BlockchainTransactionUtils from 'src/popup/hive/utils/blockchain.utils';
import ProxyUtils from 'src/popup/hive/utils/proxy.utils';
import WitnessUtils from 'src/popup/hive/utils/witness.utils';
import * as ValidUrl from 'valid-url';

import { I18nUtils } from 'src/utils/i18n.utils';
const MAX_WITNESS_VOTE = 30;

interface WitnessTabProps {
  ranking: Witness[];
  hasError: boolean;
}

const WitnessTab = ({
  ranking,
  hasError,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  addCaptionToLoading,
  openModal,
  closeModal,
}: PropsFromRedux & WitnessTabProps) => {
  const [displayVotedOnly, setDisplayVotedOnly] = useState(false);
  const [hideNonActive, setHideNonActive] = useState(true);
  const [remainingVotes, setRemainingVotes] = useState<string | number>('...');
  const [filteredRanking, setFilteredRanking] = useState<Witness[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [votedWitnesses, setVotedWitnesses] = useState<string[]>([]);
  const [isFilterOpened, setIsFilterOpened] = useState(false);

  const [usingProxy, setUsingProxy] = useState<boolean>(false);
  const [keyType, setKeyType] = useState<PrivateKeyType>();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (activeAccount) {
      setKeyType(
        KeysUtils.getKeyType(
          activeAccount.keys.active!,
          activeAccount.keys.activePubkey!,
          activeAccount.account,
          activeAccount.account,
          KeychainKeyTypesLC.active,
        ),
      );
    }
  }, [activeAccount]);

  const init = async () => {
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );

    let proxy = await ProxyUtils.findUserProxy(activeAccount.account);

    setUsingProxy(proxy !== null);
    if (proxy) {
      initProxyVotes(proxy);
    } else {
      setVotedWitnesses(activeAccount.account.witness_votes);
    }
  };

  useEffect(() => {
    setVotedWitnesses(activeAccount.account.witness_votes);
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );
  }, [activeAccount]);

  useEffect(() => {
    if (ranking)
      setFilteredRanking(
        ranking.filter((witness) => {
          return (
            (witness.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
              witness.rank
                ?.toLowerCase()
                .includes(filterValue.toLowerCase())) &&
            ((displayVotedOnly && votedWitnesses.includes(witness.name)) ||
              !displayVotedOnly) &&
            ((hideNonActive &&
              witness.signing_key !==
                'STM1111111111111111111111111111111114T1Anm') ||
              !hideNonActive)
          );
        }),
      );
  }, [ranking, filterValue, displayVotedOnly, votedWitnesses, hideNonActive]);

  const initProxyVotes = async (proxy: string) => {
    const hiveAccounts = await AccountUtils.getAccount(proxy);
    setVotedWitnesses(hiveAccounts[0].witness_votes);
  };

  const getVotedWitnessesCount = () => {
    if (typeof remainingVotes !== 'number') return '...';
    return MAX_WITNESS_VOTE - remainingVotes;
  };

  const processClick = async (
    witness: Witness,
    options?: TransactionOptions,
  ) => {
    if (activeAccount.account.witness_votes.includes(witness.name)) {
      try {
        addToLoadingList('html_popup_unvote_witness_operation');

        const success = await WitnessUtils.unvoteWitness(
          witness,
          activeAccount.name!,
          activeAccount.keys.active!,
          options,
        );
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_unvote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        if (success) {
          if (success.isUsingMultisig) {
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else {
            setSuccessMessage('popup_success_unvote_wit', [`${witness.name}`]);
          }
        } else {
          setErrorMessage('popup_error_unvote_wit', [`${witness.name}`]);
        }
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        removeFromLoadingList('html_popup_unvote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    } else {
      try {
        addToLoadingList('html_popup_vote_witness_operation');
        const success = await WitnessUtils.voteWitness(
          witness,
          activeAccount.name!,
          activeAccount.keys.active!,
          options,
        );
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_vote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        if (success) {
          if (success.isUsingMultisig) {
            setSuccessMessage('multisig_transaction_sent_to_signers');
          } else {
            setSuccessMessage('popup_success_wit', [`${witness.name}`]);
          }
        } else {
          setErrorMessage('popup_error_wit', [`${witness.name}`]);
        }
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        removeFromLoadingList('html_popup_vote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    }
  };

  const handleVotedButtonClick = async (witness: Witness) => {
    if (usingProxy) {
      return;
    }

    if (keyType === PrivateKeyType.MULTISIG) {
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
                processClick(witness, { metaData: metadata });
                closeModal();
              }}
              onCancel={() => closeModal()}
            />
          ),
        });
      }
    } else {
      processClick(witness);
    }
  };

  const renderWitnessItem = (witness: Witness) => {
    return (
      <div
        data-testid="ranking-item"
        className="ranking-item"
        key={witness.name}>
        <div className="rank">
          <div className="active-rank">
            {witness.active_rank ? witness.active_rank : '-'}{' '}
          </div>
          {!hideNonActive &&
            witness.active_rank?.toString() !== witness.rank && (
              <div className="including-inactive">({witness.rank})</div>
            )}
        </div>
        <div
          className={
            'name ' +
            (witness.signing_key ===
            'STM1111111111111111111111111111111114T1Anm'
              ? 'not-active'
              : '')
          }>
          <div className="witness-name">@{witness.name}</div>
          {witness.url && ValidUrl.isWebUri(witness.url) && (
            <SVGIcon
              dataTestId={`link-to-witness-page-${witness.name}`}
              onClick={() => chrome.tabs.create({ url: witness.url })}
              icon={SVGIcons.GOVERNANCE_WITNESS_LINK}
              className="link-to-witness-page"></SVGIcon>
          )}
        </div>
        <SVGIcon
          dataTestId={`witness-voting-icon-${witness.name}`}
          className={
            'action ' +
            (votedWitnesses.includes(witness.name) ? 'voted' : 'not-voted') +
            ' ' +
            (usingProxy || !activeAccount.keys.active
              ? 'using-proxy-button'
              : '')
          }
          icon={SVGIcons.GOVERNANCE_WITNESS_UPVOTE_DOWNVOTE}
          onClick={() => handleVotedButtonClick(witness)}
          tooltipPosition="left"
          tooltipMessage={
            !activeAccount.keys.active
              ? 'popup_witness_key'
              : usingProxy
              ? 'html_popup_witness_vote_error_proxy'
              : undefined
          }
        />
      </div>
    );
  };

  return (
    <div data-testid="witness-tab" className="witness-tab">
      {!hasError && (
        <div className="ranking-container">
          <div className="ranking-filter">
            <div className="witness-toolbar">
              <div className="search-panel">
                <InputComponent
                  dataTestId="input-ranking-filter"
                  type={InputType.TEXT}
                  logo={SVGIcons.INPUT_SEARCH}
                  logoPosition="left"
                  placeholder="popup_html_search"
                  value={filterValue}
                  onChange={setFilterValue}
                />
              </div>
              {!usingProxy && (
                <div className="witness-status-tag votes-tag">
                  {getVotedWitnessesCount()}/{MAX_WITNESS_VOTE}
                </div>
              )}
              {usingProxy && (
                <div className="witness-status-tag proxy-tag">
                  {I18nUtils.getMessage('popup_html_proxy')} @
                  {activeAccount.account.proxy}
                </div>
              )}
              <button
                data-testid="witness-filter-button"
                className={`witness-filter-button ${
                  isFilterOpened ? 'selected' : ''
                }`}
                onClick={() => setIsFilterOpened(!isFilterOpened)}>
                <SVGIcon icon={SVGIcons.WALLET_HISTORY_FILTER_BUTTON} />
              </button>
            </div>

            <div
              className={`witness-filters ${
                isFilterOpened ? 'filter-opened' : 'filter-closed'
              }`}>
              <div
                data-testid="switches-panel-witness-voted_only"
                className={`filter-button ${
                  displayVotedOnly ? 'selected' : 'not-selected'
                }`}
                onClick={() => setDisplayVotedOnly(!displayVotedOnly)}>
                {I18nUtils.getMessage('html_popup_witness_display_voted_only')}
              </div>
              <div
                data-testid="switches-panel-witness-hide_inactive"
                className={`filter-button ${
                  hideNonActive ? 'selected' : 'not-selected'
                }`}
                onClick={() => setHideNonActive(!hideNonActive)}>
                {I18nUtils.getMessage('html_popup_witness_hide_inactive')}
              </div>
            </div>
          </div>

          <div aria-label="ranking" className="ranking">
            <FlatList list={filteredRanking} renderItem={renderWitnessItem} />
          </div>
        </div>
      )}
      {hasError && (
        <div className="error-witness">
          <SVGIcon icon={SVGIcons.MESSAGE_ERROR} />
          <div className="text">
            <div>
              {I18nUtils.getMessage(
                'popup_html_error_retrieving_witness_ranking',
              )}
            </div>
          </div>
        </div>
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
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
  addCaptionToLoading,
  openModal,
  closeModal,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessTabComponent = connector(WitnessTab);
