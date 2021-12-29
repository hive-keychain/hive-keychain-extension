import KeychainApi from '@api/keychain';
import { Witness } from '@interfaces/witness.interface';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { setLoading } from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import FlatList from 'flatlist-react';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ReactTooltip from 'react-tooltip';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import HiveUtils from 'src/utils/hive.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './witness-tab.component.scss';

const MAX_WITNESS_VOTE = 30;

const WitnessTab = ({
  activeAccount,
  setLoading,
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
    setLoading(true);
    const ranking = (await KeychainApi.get('/hive/v2/witnesses-ranks')).data;
    setRanking(ranking);
    setFilteredRanking(ranking);
    setLoading(false);
  };

  const handleVotedButtonClick = async (witness: Witness) => {
    if (usingProxy) {
      return;
    }
    setLoading(true);
    if (activeAccount.account.witness_votes.includes(witness.name)) {
      try {
        await WitnessUtils.unvoteWitness(witness, activeAccount);
        setSuccessMessage('popup_success_unvote_wit', [`${witness.name}`]);
        refreshActiveAccount();
      } catch (err) {
        setErrorMessage('popup_error_unvote_wit', [`${witness.name}`]);
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await WitnessUtils.voteWitness(witness, activeAccount);
        setSuccessMessage('popup_success_wit', [`${witness.name}`]);
        refreshActiveAccount();
      } catch (err) {
        setErrorMessage('popup_error_wit', [`${witness.name}`]);
        console.log(err);
      } finally {
        setLoading(false);
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
          @{witness.name}
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

      <div className="ranking-container">
        <div className="ranking-filter">
          <InputComponent
            type={InputType.TEXT}
            placeholder="popup_html_search"
            value={filterValue}
            onChange={setFilterValue}
          />
          <div className="switches-panel">
            <SwitchComponent
              title="html_popup_witness_display_voted_only"
              checked={displayVotedOnly}
              onChange={() => {
                setDisplayVotedOnly(!displayVotedOnly);
              }}></SwitchComponent>
            <SwitchComponent
              title="html_popup_witness_hide_inactive"
              checked={hideNonActive}
              onChange={() => {
                setHideNonActive(!hideNonActive);
              }}></SwitchComponent>
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
  setLoading,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WitnessTabComponent = connector(WitnessTab);
