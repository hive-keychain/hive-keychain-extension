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
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setLoading] = useState(false);

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
    setLoading(true);
    const requestResult = await KeychainApi.get('/hive/v2/witnesses-ranks');
    if (requestResult.data !== '') {
      const ranking = requestResult.data;
      setRanking(ranking);
      setFilteredRanking(ranking);
    } else {
      setErrorMessage('popup_html_error_retrieving_witness_ranking');
      setHasError(true);
    }
    setLoading(false);
  };

  const handleVotedButtonClick = async (witness: Witness) => {
    if (usingProxy) {
      return;
    }
    if (activeAccount.account.witness_votes.includes(witness.name)) {
      try {
        addToLoadingList('html_popup_unvote_witness_operation');
        await WitnessUtils.unvoteWitness(witness, activeAccount);
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_unvote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        setSuccessMessage('popup_success_unvote_wit', [`${witness.name}`]);
      } catch (err) {
        setErrorMessage('popup_error_unvote_wit', [`${witness.name}`]);
        Logger.error(err);
      } finally {
        removeFromLoadingList('html_popup_unvote_witness_operation');
        removeFromLoadingList('html_popup_confirm_transaction_operation');
      }
    } else {
      try {
        addToLoadingList('html_popup_vote_witness_operation');
        await WitnessUtils.voteWitness(witness, activeAccount);

        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_vote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');

        refreshActiveAccount();
        setSuccessMessage('popup_success_wit', [`${witness.name}`]);
      } catch (err) {
        setErrorMessage('popup_error_wit', [`${witness.name}`]);
        Logger.error(err);
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
            <Icon
              onClick={() => chrome.tabs.create({ url: witness.url })}
              name={Icons.OPEN_IN_NEW}
              type={IconType.OUTLINED}
              additionalClassName="link-to-witness-page"></Icon>
          )}
        </div>
        <img
          className={
            'action ' +
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
    );
  };

  return (
    <div className="witness-tab">
      {!usingProxy && (
        <div className="remaining-votes">
          {chrome.i18n.getMessage('popup_html_witness_remaining', [
            remainingVotes + '',
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
          <Icon
            name={Icons.OPEN_IN_NEW}
            type={IconType.OUTLINED}
            additionalClassName="outside-link"></Icon>
        </a>
      </div>

      {!isLoading && (
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
              renderWhenEmpty={() => {
                return (
                  hasError && (
                    <div className="error-witness">
                      <Icon name={Icons.ERROR} type={IconType.OUTLINED}></Icon>
                      <span>
                        {chrome.i18n.getMessage(
                          'popup_html_error_retrieving_witness_ranking',
                        )}
                      </span>
                    </div>
                  )
                );
              }}
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
      )}

      {isLoading && <RotatingLogoComponent></RotatingLogoComponent>}
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
