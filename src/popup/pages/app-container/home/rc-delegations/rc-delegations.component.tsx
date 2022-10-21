import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { RCDelegationValue } from '@interfaces/rc-delegation.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import { setErrorMessage } from '@popup/actions/message.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { RcDelegationsUtils } from 'src/utils/rc-delegations.utils';

import './rc-delegations.component.scss';

const RCDelegations = ({
  activeAccount,
  currencyLabels,
  properties,
  setTitleContainerProperties,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [username, setUsername] = useState('');
  const [value, setValue] = useState<RCDelegationValue>({
    hpValue: '0.000',
    rcValue: '',
  });
  const [available, setAvailable] = useState<RCDelegationValue>();

  const [totalIncoming, setTotalIncoming] = useState<RCDelegationValue>();
  const [totalOutgoing, setTotalOutgoing] = useState<RCDelegationValue>();
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  useEffect(() => {
    setTitleContainerProperties({ title: 'popup_html_delegate_rc' });
    initRCDelegations();
    loadAutocompleteTransferUsernames();
    console.log(activeAccount);
  }, []);

  const initRCDelegations = async () => {
    setTotalIncoming({
      hpValue: RcDelegationsUtils.gigaRcToHp(
        activeAccount.rc.received_delegated_rc.toString(),
        properties,
      ),
      rcValue: RcDelegationsUtils.rcToGigaRc(
        activeAccount.rc.received_delegated_rc,
      ),
    });
    setTotalOutgoing({
      hpValue: RcDelegationsUtils.gigaRcToHp(
        activeAccount.rc.delegated_rc.toString(),
        properties,
      ),
      rcValue: RcDelegationsUtils.rcToGigaRc(activeAccount.rc.delegated_rc),
    });

    const availableRc =
      (activeAccount.rc.max_rc * activeAccount.rc.percentage) / 100;

    setAvailable({
      hpValue: RcDelegationsUtils.gigaRcToHp(
        availableRc.toString(),
        properties,
      ),
      rcValue: RcDelegationsUtils.rcToGigaRc(availableRc),
    });
  };

  const handleValueChange = (value: string) => {
    setValue({
      hpValue: RcDelegationsUtils.gigaRcToHp(value, properties),
      rcValue: value,
    });
  };

  useEffect(() => console.log(value), [value]);

  const goToIncomings = () => {
    console.log('goToIncoming');
  };

  const goToOutgoings = () => {
    console.log('goToOutgoings');
  };

  const handleButtonClick = async () => {
    if (username.trim().length === 0) {
      setErrorMessage('popup_html_username_missing');
      return;
    }
    addToLoadingList('html_popup_delegate_rc_operation');
    const res = await RcDelegationsUtils.sendDelegation(
      RcDelegationsUtils.gigaRcToRc(parseFloat(value.rcValue)),
      username,
      activeAccount,
    );
    removeFromLoadingList('html_popup_delegate_rc_operation');
  };

  const loadAutocompleteTransferUsernames = async () => {
    const favoriteUsers = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    setAutocompleteTransferUsernames(
      favoriteUsers ? favoriteUsers[activeAccount.name!] : [],
    );
  };

  const setToPresetValue = (value: number) => {
    setValue({
      hpValue: value.toFixed(3),
      rcValue: RcDelegationsUtils.hpToGigaRc(value.toString(), properties),
    });
  };

  return (
    <div className="rc-delegations-page" aria-label="rc-delegations-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_rc_delegations_text')}
      </div>

      <div className="rc-delegations-summary" aria-label="delegations-summary">
        <div
          className="total-incoming"
          onClick={goToIncomings}
          aria-label="total-incoming">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_incoming')}
          </div>
          <div className="value">
            {totalIncoming && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  totalIncoming.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  + {FormatUtils.withCommas(totalIncoming.rcValue.toString())} G
                  RC
                </span>
              </CustomTooltip>
            )}
            {!totalIncoming && <span>...</span>}
          </div>
        </div>
        <div
          className="total-outgoing"
          onClick={goToOutgoings}
          aria-label="total-outgoing">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_outgoing')}
          </div>
          <div className="value">
            {totalOutgoing && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  totalOutgoing.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  - {FormatUtils.withCommas(totalOutgoing.rcValue.toString())} G
                  RC
                </span>
              </CustomTooltip>
            )}
            {!totalOutgoing && <span>...</span>}
          </div>
        </div>
        <div className="total-available">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_available')}
          </div>
          <div className="value">
            {available && (
              <CustomTooltip
                skipTranslation
                position="left"
                message={`≈ ${FormatUtils.withCommas(
                  available.hpValue.toString(),
                )} ${currencyLabels.hp}`}>
                <span className="rc-value">
                  {FormatUtils.withCommas(available?.rcValue.toString())} G RC
                </span>
              </CustomTooltip>
            )}
            {!available && <span>...</span>}
          </div>
        </div>
      </div>

      <div className="form-container">
        <InputComponent
          ariaLabel="input-username"
          value={username}
          onChange={setUsername}
          logo={Icons.AT}
          placeholder="popup_html_username"
          type={InputType.TEXT}
          autocompleteValues={autocompleteTransferUsernames}
        />

        <div className="amount-panel">
          <div className="amount-input-panel">
            <InputComponent
              ariaLabel="amount-input"
              type={InputType.NUMBER}
              placeholder="0.000"
              skipPlaceholderTranslation={true}
              hint={`≈ ${value?.hpValue} ${currencyLabels.hp}`}
              skipHintTranslation
              value={value?.rcValue}
              step={Number(RcDelegationsUtils.hpToGigaRc('5', properties))}
              onChange={handleValueChange}
            />
          </div>
          <div className="currency">G RC</div>
        </div>

        <div className="preset-button-panels">
          <div className="preset-button" onClick={() => setToPresetValue(5)}>
            5 HP
          </div>
          <div className="preset-button" onClick={() => setToPresetValue(10)}>
            10 HP
          </div>
          <div className="preset-button" onClick={() => setToPresetValue(50)}>
            50 HP
          </div>
          <div className="preset-button" onClick={() => setToPresetValue(100)}>
            100 HP
          </div>
        </div>
      </div>

      <OperationButtonComponent
        ariaLabel="rc-delegate-operation-submit-button"
        label={'popup_html_delegate_to_user'}
        onClick={() => handleButtonClick()}
        requiredKey={KeychainKeyTypesLC.posting}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    properties: state.globalProperties,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const RcDelegationsComponent = connector(RCDelegations);
