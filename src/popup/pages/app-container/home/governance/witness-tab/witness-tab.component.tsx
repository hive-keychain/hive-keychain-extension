import KeychainApi from '@api/keychain';
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
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import FlatList from 'flatlist-react';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ReactTooltip from 'react-tooltip';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import HiveUtils from 'src/utils/hive.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import WitnessUtils from 'src/utils/witness.utils';
import * as ValidUrl from 'valid-url';
import './witness-tab.component.scss';

const MAX_WITNESS_VOTE = 30;

const WitnessTab = ({
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
}: PropsFromRedux) => {
  const [displayVotedOnly, setDisplayVotedOnly] = useState(false);
  const [hideNonActive, setHideNonActive] = useState(true);
  const [remainingVotes, setRemainingVotes] = useState<string | number>('...');
  const [ranking, setRanking] = useState<Witness[]>([]);
  const [filteredRanking, setFilteredRanking] = useState<Witness[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [votedWitnesses, setVotedWitnesses] = useState<string[]>([]);

  const [usingProxy, setUsingProxy] = useState<boolean>(false);

  useEffect(() => {
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );
    setUsingProxy(activeAccount.account.proxy.length > 0);
    initWitnessRanking();
    if (activeAccount.account.proxy.length > 0) {
      initProxyVotes();
    } else {
      setVotedWitnesses(activeAccount.account.witness_votes);
    }
  }, []);

  useEffect(() => {
    setVotedWitnesses(activeAccount.account.witness_votes);
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );
  }, [activeAccount]);

  useEffect(() => {
    setFilteredRanking(
      ranking.filter((witness) => {
        return (
          (witness.name?.toLowerCase().includes(filterValue.toLowerCase()) ||
            witness.rank?.toLowerCase().includes(filterValue.toLowerCase())) &&
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

  const initProxyVotes = async () => {
    const hiveAccounts = await HiveUtils.getClient().database.getAccounts([
      activeAccount.account.proxy,
    ]);
    setVotedWitnesses(hiveAccounts[0].witness_votes);
  };

  const initWitnessRanking = async () => {
    addToLoadingList('html_popup_load_witness_ranking_operation');
    const ranking = (await KeychainApi.get('/hive/v2/witnesses-ranks')).data;
    setRanking(ranking);
    setFilteredRanking(ranking);
    removeFromLoadingList('html_popup_load_witness_ranking_operation');
  };

  const handleVotedButtonClick = async (witness: Witness) => {
    if (usingProxy) {
      return;
    }
    if (activeAccount.account.witness_votes.includes(witness.name)) {
      try {
        addToLoadingList('html_popup_unvote_witness_operation');
        const transactionResult = await WitnessUtils.unvoteWitness(
          witness,
          activeAccount,
        );
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_unvote_witness_operation');
        const transactionConfirmResult =
          await BlockchainTransactionUtils.tryConfirmTransaction(
            transactionResult.id,
          );
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        if (transactionConfirmResult.error) {
          setErrorMessage(
            'html_popup_witness_unvote_transaction_not_had_error',
          );
        } else {
          refreshActiveAccount();
          setSuccessMessage('popup_success_unvote_wit', [`${witness.name}`]);
        }
      } catch (err) {
        setErrorMessage('popup_error_unvote_wit', [`${witness.name}`]);
        console.log(err);
      } finally {
        removeFromLoadingList('html_popup_unvote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    } else {
      try {
        addToLoadingList('html_popup_vote_witness_operation');
        const transactionResult = await WitnessUtils.voteWitness(
          witness,
          activeAccount,
        );

        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_vote_witness_operation');
        const transactionConfirmResult =
          await BlockchainTransactionUtils.tryConfirmTransaction(
            transactionResult.id,
          );
        removeFromLoadingList('html_popup_confirm_transaction_operation');

        if (transactionConfirmResult.error) {
          setErrorMessage('html_popup_witness_vote_transaction_not_had_error');
        } else {
          refreshActiveAccount();
          setSuccessMessage('popup_success_wit', [`${witness.name}`]);
        }
      } catch (err) {
        setErrorMessage('popup_error_wit', [`${witness.name}`]);
        console.log(err);
      } finally {
        removeFromLoadingList('html_popup_vote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    }
  };

  const renderWitnessItem = (witness: Witness) => {
    return (
      <div className="ranking-item" key={witness.name}>
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
            <span
              onClick={() => chrome.tabs.create({ url: witness.url })}
              className="material-icons-outlined link-to-witness-page">
              {Icons.OPEN_IN_NEW}
            </span>
          )}
        </div>
        <div className="action">
          <img
            className={
              (votedWitnesses.includes(witness.name) ? 'voted' : 'not-voted') +
              ' ' +
              (usingProxy ? 'using-proxy' : '')
            }
            src="assets/images/voted.png"
            onClick={() => handleVotedButtonClick(witness)}
            data-for={`${witness.name}-tooltip`}
            data-tip={
              usingProxy
                ? chrome.i18n.getMessage('html_popup_witness_vote_error_proxy')
                : ''
            }
            data-iscapture="true"
          />
          <ReactTooltip
            id={`${witness.name}-tooltip`}
            place="top"
            type="light"
            effect="solid"
            multiline={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="witness-tab">
      {!usingProxy && (
        <div className="remaining-votes">
          {chrome.i18n.getMessage('popup_html_witness_remaining', [
            remainingVotes,
          ])}
        </div>
      )}
      {usingProxy && (
        <div className="using-proxy">
          {chrome.i18n.getMessage('html_popup_currently_using_proxy', [
            activeAccount.account.proxy,
          ])}
        </div>
      )}

      <div
        onClick={() =>
          chrome.tabs.create({ url: 'https://hive.arcange.eu/witnesses/' })
        }
        className="link-to-arcange">
        <a>
          {' '}
          {chrome.i18n.getMessage('html_popup_link_to_witness_website')}
          <span className="material-icons-outlined outside-link">
            {Icons.OPEN_IN_NEW}
          </span>
        </a>
      </div>

      <div className="ranking-container">
        <div className="ranking-filter">
          <InputComponent
            type={InputType.TEXT}
            placeholder="popup_html_search"
            value={filterValue}
            onChange={setFilterValue}
          />
          <div className="switches-panel">
            <CheckboxComponent
              title="html_popup_witness_display_voted_only"
              checked={displayVotedOnly}
              onChange={() => {
                setDisplayVotedOnly(!displayVotedOnly);
              }}></CheckboxComponent>
            <CheckboxComponent
              title="html_popup_witness_hide_inactive"
              checked={hideNonActive}
              onChange={() => {
                setHideNonActive(!hideNonActive);
              }}></CheckboxComponent>
          </div>
        </div>
        <div
          className="ranking"
          data-for={`no-private-key-tooltip`}
          data-tip={
            activeAccount.keys.active
              ? ''
              : chrome.i18n.getMessage('popup_witness_key')
          }
          data-iscapture="true">
          <FlatList
            list={filteredRanking}
            renderItem={renderWitnessItem}
            renderOnScroll
          />
        </div>
        <ReactTooltip
          id={`no-private-key-tooltip`}
          place="top"
          type="light"
          effect="solid"
          multiline={true}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessTabComponent = connector(WitnessTab);
