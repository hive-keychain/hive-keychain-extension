import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
} from '@interfaces/keychain.interface';
import {
  PrivateKeyType,
  TransactionOptions,
  TransactionOptionsMetadata,
} from '@interfaces/keys.interface';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import {
  addCaptionToLoading,
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { closeModal, openModal } from '@popup/multichain/actions/modal.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { MetadataPopup } from 'src/common-ui/metadata-popup/metadata-popup.component';
import { refreshActiveAccount } from 'src/popup/hive/actions/active-account.actions';
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
  openModal,
  closeModal,
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
          KeychainKeyTypesLC.active,
        ),
      );
    }
  }, [activeAccount]);

  const processSetAsProxy = async (options?: TransactionOptions) => {
    addToLoadingList('popup_html_setting_proxy', keyType);
    try {
      const success = await ProxyUtils.setAsProxy(
        proxyUsername,
        activeAccount.name!,
        activeAccount.keys.active!,
        options,
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

  const handleClickOnSetAsProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    if (keyType === PrivateKeyType.MULTISIG) {
      const twoFaAccounts = await MultisigUtils.get2FAAccounts(
        activeAccount.account,
        KeychainKeyTypes.active,
      );

      let initialMetadata = {} as TransactionOptionsMetadata;
      for (const account of twoFaAccounts) {
        if (!initialMetadata.twoFACodes) initialMetadata.twoFACodes = {};
        initialMetadata.twoFACodes[account] = '';
      }
      if (twoFaAccounts.length > 0) {
        openModal({
          title: 'popup_html_transaction_metadata',
          children: (
            <MetadataPopup
              initialMetadata={initialMetadata}
              onSubmit={(metadata: TransactionOptionsMetadata) => {
                addCaptionToLoading('multisig_transmitting_to_2fa');
                processSetAsProxy({ metaData: metadata });
                closeModal();
              }}
              onCancel={() => closeModal()}
            />
          ),
        });
      }
    } else {
      processSetAsProxy();
    }
  };

  const processRemoveProxy = async (options?: TransactionOptions) => {
    addToLoadingList('popup_html_clearing_proxy', keyType);
    try {
      const success = await ProxyUtils.removeProxy(
        activeAccount.name!,
        activeAccount.keys.active!,
        options,
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

  const handleClickOnRemoveProxy = async () => {
    if (!activeAccount.keys.active) {
      setErrorMessage('html_popup_proxy_requires_active_key');
    }
    if (keyType === PrivateKeyType.MULTISIG) {
      const twoFaAccounts = await MultisigUtils.get2FAAccounts(
        activeAccount.account,
        KeychainKeyTypes.active,
      );

      let initialMetadata = {} as TransactionOptionsMetadata;
      for (const account of twoFaAccounts) {
        if (!initialMetadata.twoFACodes) initialMetadata.twoFACodes = {};
        initialMetadata.twoFACodes[account] = '';
      }
      if (twoFaAccounts.length > 0) {
        openModal({
          title: 'popup_html_transaction_metadata',
          children: (
            <MetadataPopup
              initialMetadata={initialMetadata}
              onSubmit={(metadata: TransactionOptionsMetadata) => {
                addCaptionToLoading('multisig_transmitting_to_2fa');
                processSetAsProxy({ metaData: metadata });
                closeModal();
              }}
              onCancel={() => closeModal()}
            />
          ),
        });
      }
    } else {
      processRemoveProxy();
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
          logo={SVGIcons.INPUT_AT}
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
          onClick={() => handleClickOnSetAsProxy()}
        />
      )}
      {activeAccount.account.proxy.length > 0 && (
        <OperationButtonComponent
          dataTestId="operation-clear-proxy"
          requiredKey={KeychainKeyTypesLC.active}
          label={'html_popup_clear_proxy'}
          onClick={() => handleClickOnRemoveProxy()}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.hive.activeAccount,
  };
};

const connector = connect(mapStateToProps, {
  refreshActiveAccount,
  setErrorMessage,
  setSuccessMessage,
  addToLoadingList,
  removeFromLoadingList,
  addCaptionToLoading,
  openModal,
  closeModal,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ProxyTabComponent = connector(ProxyTab);
