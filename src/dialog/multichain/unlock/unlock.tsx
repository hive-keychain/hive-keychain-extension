import { BackgroundMessage } from '@background/multichain/background-message.interface';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { VaultKey } from '@reference-data/vault-message-key.enum';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import {
  BackgroundType,
  CheckboxPanelComponent,
} from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { DialogHeader } from 'src/dialog/components/dialog-header/dialog-header.component';
import { CommunicationUtils } from 'src/utils/communication.utils';
import { I18nUtils } from 'src/utils/i18n.utils';
import LegalDocumentsUtils from 'src/utils/legal-documents.utils';
import VaultUtils from 'src/utils/vault.utils';

type Props = {
  data: UnlockMessage;
  wrongMk?: boolean;
  index?: number;
};

type UnlockMessage = {
  command: DialogCommand;
  msg: {
    success: false;
    error: 'locked';
    result: null;
    data: KeychainRequest | EvmRequest;
    message: string;
    display_msg: string;
    wrongMk?: boolean;
  };
  tab: number;
  domain: string;
};
export default ({ data, index }: Props) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [wrongMk, setWrongMk] = useState(false);
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState(false);
  const isLoginPendingRef = useRef(false);
  const isVaultCheckPendingRef = useRef(false);
  const needsAcceptanceRef = useRef(false);
  const acceptedTermsRef = useRef(false);
  needsAcceptanceRef.current = needsAcceptance;
  acceptedTermsRef.current = acceptedTerms;

  useEffect(() => {
    setWrongMk(data.msg.wrongMk!);
    if (data.msg.wrongMk && password.length > 0) {
      setLoading(false);
      isLoginPendingRef.current = false;
    } else if (password.length === 0) {
      setLoading(false);
      isLoginPendingRef.current = false;
    }
  }, [data]);

  useEffect(() => {
    let isCancelled = false;
    void LegalDocumentsUtils.needsLegalDocumentAcceptance().then((needed) => {
      if (!isCancelled) {
        setNeedsAcceptance(needed);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  const sendUnlockRequest = useCallback((mk: string, fromUser = false) => {
    if (needsAcceptanceRef.current && !acceptedTermsRef.current) {
      if (fromUser) {
        setAcceptanceError(true);
      }
      return;
    }

    if (isLoginPendingRef.current) {
      return;
    }

    isLoginPendingRef.current = true;
    setLoading(true);
    if (needsAcceptanceRef.current) {
      void LegalDocumentsUtils.acceptLegalDocumentHashes();
    }
    void CommunicationUtils.runtimeSendMessage({
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        data,
        tab: data.tab,
        mk,
        domain: data.domain,
        request_id: data.msg.data.request_id,
      },
    });
  }, [data]);

  useEffect(() => {
    let isCancelled = false;
    const onWalletLockStateChanged = (message: BackgroundMessage) => {
      if (
        message.command !==
          BackgroundCommand.EVM_WALLET_LOCK_STATE_CHANGED ||
        isLoginPendingRef.current ||
        isVaultCheckPendingRef.current
      ) {
        return;
      }

      isVaultCheckPendingRef.current = true;
      void VaultUtils.getValueFromVault(VaultKey.__MK)
        .then((mkFromStorage) => {
          if (!isCancelled && mkFromStorage && !isLoginPendingRef.current) {
            sendUnlockRequest(mkFromStorage);
          }
        })
        .finally(() => {
          isVaultCheckPendingRef.current = false;
        });
    };

    chrome.runtime.onMessage.addListener(onWalletLockStateChanged);
    return () => {
      isCancelled = true;
      chrome.runtime.onMessage.removeListener(onWalletLockStateChanged);
    };
  }, [sendUnlockRequest]);

  const login = () => sendUnlockRequest(password, true);

  return (
    <div className="unlock-page">
      <DialogHeader title={I18nUtils.getMessage('dialog_header_unlock')} />
      <DialogCaption text={I18nUtils.getMessage('bgd_auth_locked_desc')} />
      <InputComponent
        value={password}
        onChange={setPassword}
        logo=""
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
      />
      {needsAcceptance && (
        <CheckboxPanelComponent
          onChange={() => {
            setAcceptedTerms(!acceptedTerms);
            setAcceptanceError(false);
          }}
          checked={acceptedTerms}
          backgroundType={BackgroundType.FILLED}
          text="accept_terms_and_condition"
          dataTestId="accept-terms-and-condition"
        />
      )}
      {acceptanceError && (
        <div className="error">
          {I18nUtils.getMessage('html_popup_sign_up_need_accept_pp')}
        </div>
      )}
      {wrongMk && (
        <div className="error">
          {I18nUtils.getMessage('dialog_header_wrong_pwd')}
        </div>
      )}
      <div className="fill-space"></div>
      <div className="button-panel">
        <ButtonComponent
          label={'dialog_cancel'}
          type={ButtonType.ALTERNATIVE}
          onClick={() => {
            window.close();
          }}
        />
        <ButtonComponent
          label={'dialog_unlock'}
          onClick={login}
          type={ButtonType.IMPORTANT}
        />
      </div>
      <LoadingComponent hide={!loading} />
    </div>
  );
};
