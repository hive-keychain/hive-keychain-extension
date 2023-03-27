import { KeychainApi } from '@api/keychain';
import { WitnessProps } from '@hiveio/dhive/lib/utils';
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
import { Icons } from '@popup/icons.enum';
import WitnessPageTabItemComponent from '@popup/pages/app-container/home/governance/witness-page-tab/witness-page-tab-item.component/witness-page-tab-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import AccountUtils from 'src/utils/account.utils';
import BlockchainTransactionUtils from 'src/utils/blockchain.utils';
import { BaseCurrencies } from 'src/utils/currency.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import WitnessUtils from 'src/utils/witness.utils';
import * as ValidUrl from 'valid-url';
import './witness-page-tab.component.scss';

const MAX_WITNESS_VOTE = 30;

interface WitnessPageTabProps {
  witnessAccountInfo: any; //TODO type?
}

const WitnessPageTab = ({
  witnessAccountInfo,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  setSuccessMessage,
  refreshActiveAccount,
}: PropsFromRedux & WitnessPageTabProps) => {
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

  //new ones
  const [isExpandablePanelOpened, setExpandablePanelOpened] = useState(false);
  const [formParams, setFormParams] = useState<{
    owner: string;
    props: WitnessProps & { url: string };
  }>({
    owner: witnessAccountInfo.owner,
    props: {
      account_creation_fee: witnessAccountInfo.props.account_creation_fee,
      account_subsidy_budget: witnessAccountInfo.props.account_subsidy_budget,
      account_subsidy_decay: witnessAccountInfo.props.account_subsidy_decay,
      maximum_block_size: witnessAccountInfo.props.maximum_block_size,
      hbd_exchange_rate: witnessAccountInfo.hbd_exchange_rate,
      hbd_interest_rate: witnessAccountInfo.props.hbd_interest_rate,
      new_signing_key: witnessAccountInfo.signing_key,
      //TODO here, when submitting in test(i guess that will be done by quentin)
      key: witnessAccountInfo.signing_key,
      url: witnessAccountInfo.url,
    },
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    init();
  }, []);

  //TODO here the update should be using witness_set_properties
  //if neesed check on https://gitlab.syncad.com/hive/hive/-/blob/master/doc/witness_parameters.md
  //also here: https://developers.hive.io/apidefinitions/#broadcast_ops_witness_set_properties

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
      requestResult = await KeychainApi.get('hive/v2/witnesses-ranks');
      if (!!requestResult && requestResult !== '') {
        const ranking = requestResult;
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
          activeAccount.name!,
          activeAccount.keys.active!,
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
        const success = await WitnessUtils.voteWitness(
          witness,
          activeAccount.name!,
          activeAccount.keys.active!,
        );
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
    <div aria-label="witness-tab-page" className="witness-tab-page">
      {/* {!usingProxy && (
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
      )} */}

      <div className="text">
        {chrome.i18n.getMessage('popup_html_witness_page_text')}
      </div>
      <div className="page-information">
        <div className="row-line">
          <WitnessPageTabItemComponent
            label={'Owner'}
            data={witnessAccountInfo.owner}
          />
          <Icon
            name={Icons.EXPAND_MORE}
            type={IconType.OUTLINED}
            onClick={() => setExpandablePanelOpened(!isExpandablePanelOpened)}
            tooltipMessage={'popup_html_witness_page_expand_more_tooltip'}
            tooltipPosition={'bottom'}
            additionalClassName={
              isExpandablePanelOpened ? 'rotate-icon-180' : 'non-rotate-icon'
            }
          />
        </div>
        <WitnessPageTabItemComponent
          label={'Created'}
          data={witnessAccountInfo.created}
          isDate={true}
        />
        <WitnessPageTabItemComponent
          //TODO add "external link icon" to the component when isUrl
          label={'Last confirmed block num'}
          data={`https://hiveblocks.com/b/${witnessAccountInfo.last_confirmed_block_num}`}
          isUrl={true}
        />
        <WitnessPageTabItemComponent
          label={'Signing key'}
          data={witnessAccountInfo.signing_key}
          extraClassName={'small-text'}
        />
        <WitnessPageTabItemComponent
          label={'Hbd exchange rate'}
          data={witnessAccountInfo.hbd_exchange_rate as Object}
        />
        <WitnessPageTabItemComponent
          label={'Available account subsidies'}
          data={witnessAccountInfo.available_witness_account_subsidies}
        />

        {/* //TODO to be expandable from here */}
        {isExpandablePanelOpened && (
          <div>
            <WitnessPageTabItemComponent
              label={'Id'}
              data={witnessAccountInfo.id}
            />
            <WitnessPageTabItemComponent
              label={'Votes'}
              data={witnessAccountInfo.votes}
            />
            <WitnessPageTabItemComponent
              label={'Total missed'}
              data={witnessAccountInfo.total_missed}
            />
            <WitnessPageTabItemComponent
              label={'Last hbd exchange update'}
              data={witnessAccountInfo.last_hbd_exchange_update}
              isDate={true}
            />
            <WitnessPageTabItemComponent
              label={'Running version'}
              data={witnessAccountInfo.running_version}
            />
            <WitnessPageTabItemComponent
              label={'Hardfork version vote'}
              data={witnessAccountInfo.hardfork_version_vote}
            />
            <WitnessPageTabItemComponent
              label={'Hardfork time vote'}
              data={witnessAccountInfo.hardfork_time_vote}
              isDate={true}
            />
            <WitnessPageTabItemComponent
              label={'URL'}
              data={witnessAccountInfo.url}
              isUrl={true}
              //TODO add clickeable to the component
            />
          </div>
        )}
      </div>
      {editMode && (
        <div className="form-container">
          <div className="column-line">
            <div>Account creation fee</div>
            <div className="row-line">
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={
                  formParams.props.account_creation_fee
                    ?.toString()
                    .split(' ')[0]
                }
                onChange={() => {}}
              />
              <div>{BaseCurrencies.HIVE.toUpperCase()}</div>
            </div>
            <div className="row-line">
              <div>Account subsidy budget</div>
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.account_subsidy_budget}
                onChange={() => {}}
              />
            </div>
            <div className="row-line">
              <div>Account subsidy decay</div>
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.account_subsidy_decay}
                onChange={() => {}}
              />
            </div>
            <div className="row-line">
              <div>Maximum block size</div>
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.maximum_block_size}
                onChange={() => {}}
              />
            </div>
            <div>Hbd exchange rate</div>
            <div className="row-line">
              <div>Base</div>
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.hbd_exchange_rate?.base}
                onChange={() => {}}
              />
            </div>
            <div className="row-line">
              <div>Quote</div>
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.hbd_exchange_rate?.quote}
                onChange={() => {}}
              />
            </div>
            <div>Hbd interest rate</div>
            <div className="row-line">
              <InputComponent
                type={InputType.TEXT}
                // logo={Icons.AT}
                skipPlaceholderTranslation={true}
                //TODO add to locales + remove skip
                placeholder=""
                value={formParams.props.hbd_interest_rate}
                onChange={() => {}}
              />
              <div>{BaseCurrencies.HIVE.toUpperCase()}</div>
            </div>
            <div>New Signing Key</div>
            <InputComponent
              type={InputType.TEXT}
              // logo={Icons.AT}
              skipPlaceholderTranslation={true}
              //TODO add to locales + remove skip
              placeholder=""
              value={formParams.props.new_signing_key}
              onChange={() => {}}
            />
            <div>URL</div>
            <InputComponent
              type={InputType.TEXT}
              // logo={Icons.AT}
              skipPlaceholderTranslation={true}
              //TODO add to locales + remove skip
              placeholder=""
              value={formParams.props.url}
              onChange={() => {}}
            />
          </div>
          <OperationButtonComponent
            requiredKey={KeychainKeyTypesLC.active}
            onClick={() => {}}
            label={'popup_html_operation_button_save'}
          />
        </div>
      )}
      <ButtonComponent
        //TODO add to locales, remove skip
        //finish the update/save logic
        label={editMode ? 'UPDATE' : 'EDIT'}
        onClick={() => setEditMode(!editMode)}
        skipLabelTranslation={true}
      />
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

export const WitnessPageTabComponent = connector(WitnessPageTab);
