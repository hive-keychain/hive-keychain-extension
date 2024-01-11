import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
import {
  addCaptionToLoading,
  addToLoadingList,
  removeFromLoadingList,
} from 'src/popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import ProxyUtils from 'src/popup/hive/utils/proxy.utils';

const ProxyTab = ({
  activeAccount,
  refreshActiveAccount,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  addCaptionToLoading,
}: PropsFromRedux) => {
  const [proxyUsername, setProxyUsername] = useState('');
  const [keyType, setKeyType] = useState<PrivateKeyType>();

  useEffect(() => {
    if (activeAccount) {
      setKeyType(
        KeysUtils.getKeyType(
          activeAccount.keys.active!,
          activeAccount.keys.activePubkey!,
          activeAccount.account,
          activeAccount.account,
          KeychainKeyTypes.active,
        ),
      );
    }
  }, [activeAccount]);

  const setAsProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    if (keyType === PrivateKeyType.MULTISIG) {
      addCaptionToLoading('multisig_transmitting_to_multisig');
    }
    addToLoadingList('popup_html_setting_proxy', keyType);
    try {
      const success = await ProxyUtils.setAsProxy(
        proxyUsername,
        activeAccount.name!,
        activeAccount.keys.active!,
      );
      if (success) {
        if (success.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else {
          setSuccessMessage('popup_success_proxy', [proxyUsername]);
          refreshActiveAccount();
        }
      } else {
        setErrorMessage('html_popup_set_as_proxy_error');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      removeFromLoadingList('popup_html_setting_proxy');
    }
  };

  const removeProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    if (keyType === PrivateKeyType.MULTISIG) {
      addCaptionToLoading('multisig_transmitting_to_multisig');
    }
    addToLoadingList('popup_html_clearing_proxy', keyType);
    try {
      const success = await ProxyUtils.removeProxy(
        activeAccount.name!,
        activeAccount.keys.active!,
      );
      if (success) {
        if (success.isUsingMultisig) {
          setSuccessMessage('multisig_transaction_sent_to_signers');
        } else {
          refreshActiveAccount();
          setSuccessMessage('bgd_ops_unproxy', [`@${proxyUsername}`]);
        }
      } else {
        setErrorMessage('html_popup_clear_proxy_error');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      removeFromLoadingList('popup_html_clearing_proxy');
    }
  };

  return (
    <div data-testid="proxy-tab" className="proxy-tab">
      <div className="introduction">
        {chrome.i18n.getMessage(
          activeAccount.account.proxy.length > 0
            ? 'html_popup_witness_has_proxy'
            : 'html_popup_witness_proxy_definition',
        )}
      </div>

      {activeAccount.account.proxy.length > 0 && (
        <div data-testid="proxy-name" className="proxy-name">
          {chrome.i18n.getMessage('html_popup_currently_using_proxy', [
            activeAccount.account.proxy,
          ])}
        </div>
      )}

      {activeAccount.account.proxy.length === 0 && (
        <InputComponent
          dataTestId="input-username"
          value={proxyUsername}
          onChange={setProxyUsername}
          logo={NewIcons.INPUT_AT}
          placeholder="popup_html_proxy"
          type={InputType.TEXT}
        />
      )}

      <div className="fill-space"></div>

      {activeAccount.account.proxy.length === 0 && (
        <OperationButtonComponent
          dataTestId="operation-set-as-proxy-button"
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_set_as_proxy'}
          onClick={() => setAsProxy()}
        />
      )}
      {activeAccount.account.proxy.length > 0 && (
        <OperationButtonComponent
          dataTestId="operation-clear-proxy"
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_clear_proxy'}
          onClick={() => removeProxy()}
        />
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
  refreshActiveAccount,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  addCaptionToLoading,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProxyTabComponent = connector(ProxyTab);
