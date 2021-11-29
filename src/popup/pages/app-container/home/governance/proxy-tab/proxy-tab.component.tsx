import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './proxy-tab.component.scss';

const ProxyTab = ({ activeAccount }: PropsFromRedux) => {
  const [proxyUsername, setProxyUsername] = useState('');

  const setAsProxy = async () => {};
  const removeProxy = async () => {};

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
          logo="arobase"
          placeholder="popup_html_proxy"
          type={InputType.TEXT}
        />
      )}
      {activeAccount.account.proxy.length === 0 && (
        <ButtonComponent
          label={'html_popup_set_as_proxy'}
          onClick={setAsProxy}
        />
      )}
      {activeAccount.account.proxy.length > 0 && (
        <ButtonComponent
          label={'html_popup_clear_proxy'}
          onClick={removeProxy}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProxyTabComponent = connector(ProxyTab);
