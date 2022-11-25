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
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import AccountUtils from 'src/utils/account.utils';
import ProxyUtils from 'src/utils/proxy.utils';
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
    init();
  }, []);

  const init = async () => {
    setRemainingVotes(
      MAX_WITNESS_VOTE - activeAccount.account.witnesses_voted_for,
    );

    let proxy = await ProxyUtils.findUserProxy(activeAccount.account);

    setUsingProxy(proxy !== null);
    initWitnessRanking();
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

  const initProxyVotes = async (proxy: string) => {
    const hiveAccounts = await AccountUtils.getAccount(proxy);
    setVotedWitnesses(hiveAccounts[0].witness_votes);
  };

  const initWitnessRanking = async () => {
    setLoading(true);
    let requestResult;
    try {
      requestResult = await KeychainApi.get('/hive/v2/witnesses-ranks');
      if (requestResult?.data !== '') {
        const ranking = requestResult?.data;
        setRanking(ranking);
        setFilteredRanking(ranking);
      } else {
        throw new Error('Witness-ranks data error');
      }
    } catch (err) {
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
        const success = await WitnessUtils.unvoteWitness(
          witness,
          activeAccount,
        );
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_unvote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        if (success) {
          setSuccessMessage('popup_success_unvote_wit', [`${witness.name}`]);
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
        const success = await WitnessUtils.voteWitness(witness, activeAccount);
        addToLoadingList('html_popup_confirm_transaction_operation');
        removeFromLoadingList('html_popup_vote_witness_operation');
        await BlockchainTransactionUtils.delayRefresh();
        removeFromLoadingList('html_popup_confirm_transaction_operation');
        refreshActiveAccount();
        if (success) {
          setSuccessMessage('popup_success_wit', [`${witness.name}`]);
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

  const renderWitnessItem = (witness: Witness) => {
    return (
      <div
        aria-label="ranking-item"
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
            <Icon
              ariaLabel={'link-to-witness-page'}
              onClick={() => chrome.tabs.create({ url: witness.url })}
              name={Icons.OPEN_IN_NEW}
              type={IconType.OUTLINED}
              additionalClassName="link-to-witness-page"></Icon>
          )}
        </div>
        <Icon
          ariaLabel="witness-voting-icon"
          additionalClassName={
            'action ' +
            (votedWitnesses.includes(witness.name) ? 'voted' : 'not-voted') +
            ' ' +
            (usingProxy || !activeAccount.keys.active ? 'using-proxy' : '')
          }
          name={Icons.ARROW_CIRCLE_UP}
          type={IconType.OUTLINED}
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
    <div aria-label="witness-tab" className="witness-tab">
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
        aria-label="link-to-arcange"
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
              ariaLabel="input-ranking-filter"
              type={InputType.TEXT}
              placeholder="popup_html_search"
              value={filterValue}
              onChange={setFilterValue}
            />
            <div className="switches-panel">
              <CheckboxComponent
                ariaLabel="switches-panel-witness-voted_only"
                title="html_popup_witness_display_voted_only"
                checked={displayVotedOnly}
                onChange={() => {
                  setDisplayVotedOnly(!displayVotedOnly);
                }}></CheckboxComponent>
              <CheckboxComponent
                ariaLabel="switches-panel-witness-hide_inactive"
                title="html_popup_witness_hide_inactive"
                checked={hideNonActive}
                onChange={() => {
                  setHideNonActive(!hideNonActive);
                }}></CheckboxComponent>
            </div>
          </div>

          <div aria-label="ranking" className="ranking">
            <FlatList
              list={filteredRanking}
              renderItem={renderWitnessItem}
              renderOnScroll
              renderWhenEmpty={() => {
                return (
                  hasError && (
                    <div aria-label="error-witness" className="error-witness">
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
        </div>
      )}

      {isLoading && (
        <div
          style={{
            height: '300px',
            display: 'flex',
            justifyContent: 'center',
          }}>
          <RotatingLogoComponent></RotatingLogoComponent>
        </div>
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
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessTabComponent = connector(WitnessTab);
