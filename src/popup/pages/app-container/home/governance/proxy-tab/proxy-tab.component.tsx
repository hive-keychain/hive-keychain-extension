import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { refreshActiveAccount } from '@popup/actions/active-account.actions';
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
}: PropsFromRedux) => {
  const [proxyUsername, setProxyUsername] = useState('');

  const setAsProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    const response = await WitnessUtils.setAsProxy(
      proxyUsername,
      activeAccount,
    );
    if (response.id) {
      setSuccessMessage('popup_success_proxy', [`@${proxyUsername}`]);
    } else {
      setErrorMessage('html_popup_clear_proxy_error');
    }
    refreshActiveAccount();
  };
  const removeProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    const response = await WitnessUtils.removeProxy(activeAccount);
    refreshActiveAccount();
    if (response.id) {
      setSuccessMessage('bgd_ops_unproxy', [`@${proxyUsername}`]);
    } else {
      setErrorMessage('html_popup_clear_proxy_error');
    }
  };

  return (
    <div className="proxy-tab">
      <div className="introduction">
        {chrome.i18n.getMessage(
          activeAccount.account.proxy.length > 0
            ? 'html_popup_witness_has_proxy'
            : 'html_popup_witness_proxy_definition',
        )}
      </div>

      {activeAccount.account.proxy.length > 0 && (
        <div className="proxy-name">
          {chrome.i18n.getMessage('html_popup_currently_using_proxy', [
            activeAccount.account.proxy,
          ])}
        </div>
      )}

      {activeAccount.account.proxy.length === 0 && (
        <InputComponent
          value={proxyUsername}
          onChange={setProxyUsername}
          logo={Icons.AT}
          placeholder="popup_html_proxy"
          type={InputType.TEXT}
        />
      )}
      {activeAccount.account.proxy.length === 0 && (
        <OperationButtonComponent
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_set_as_proxy'}
          onClick={() => setAsProxy()}
          fixToBottom
        />
      )}
      {activeAccount.account.proxy.length > 0 && (
        <OperationButtonComponent
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProxyTabComponent = connector(ProxyTab);
