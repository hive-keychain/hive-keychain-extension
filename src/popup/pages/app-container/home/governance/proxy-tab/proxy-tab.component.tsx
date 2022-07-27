import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
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
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import WitnessUtils from 'src/utils/witness.utils';
import './proxy-tab.component.scss';

const ProxyTab = ({
  activeAccount,
  refreshActiveAccount,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
}: PropsFromRedux) => {
  const [proxyUsername, setProxyUsername] = useState('');

  const setAsProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    addToLoadingList('popup_html_setting_proxy');
    if (await WitnessUtils.setAsProxy(proxyUsername, activeAccount)) {
      setSuccessMessage('popup_success_proxy', [proxyUsername]);
      refreshActiveAccount();
    } else {
      setErrorMessage('html_popup_set_as_proxy_error');
    }
    removeFromLoadingList('popup_html_setting_proxy');
  };
  const removeProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    addToLoadingList('popup_html_clearing_proxy');
    if (await WitnessUtils.removeProxy(activeAccount)) {
      refreshActiveAccount();
      setSuccessMessage('bgd_ops_unproxy', [`@${proxyUsername}`]);
    } else {
      setErrorMessage('html_popup_clear_proxy_error');
    }
    removeFromLoadingList('popup_html_clearing_proxy');
  };

  return (
    <div aria-label="proxy-tab" className="proxy-tab">
      <div className="introduction">
        {chrome.i18n.getMessage(
          activeAccount.account.proxy.length > 0
            ? 'html_popup_witness_has_proxy'
            : 'html_popup_witness_proxy_definition',
        )}
      </div>

      {activeAccount.account.proxy.length > 0 && (
        <div aria-label="proxy-name" className="proxy-name">
          {chrome.i18n.getMessage('html_popup_currently_using_proxy', [
            activeAccount.account.proxy,
          ])}
        </div>
      )}

      {activeAccount.account.proxy.length === 0 && (
        <InputComponent
          ariaLabel="input-username"
          value={proxyUsername}
          onChange={setProxyUsername}
          logo={Icons.AT}
          placeholder="popup_html_proxy"
          type={InputType.TEXT}
        />
      )}
      {activeAccount.account.proxy.length === 0 && (
        <OperationButtonComponent
          ariaLabel="operation-set-as-proxy-button"
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_set_as_proxy'}
          onClick={() => setAsProxy()}
          fixToBottom
        />
      )}
      {activeAccount.account.proxy.length > 0 && (
        <OperationButtonComponent
          ariaLabel="operation-clear-proxy"
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_clear_proxy'}
          onClick={() => removeProxy()}
          fixToBottom
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  refreshActiveAccount,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProxyTabComponent = connector(ProxyTab);
