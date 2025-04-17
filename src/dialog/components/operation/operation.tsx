import {
  KeychainKeyTypes,
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import { TransactionOptions } from '@interfaces/keys.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { MultisigUtils } from '@popup/hive/utils/multisig.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import RequestUsername from 'src/dialog/components/request-username/request-username';
import { useDomainCheck } from 'src/dialog/hooks/domain-check';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { getRequiredWifType } from 'src/utils/requests.utils';

type Props = {
  title: string;
  children: (JSX.Element | undefined)[];
  onConfirm?: () => void;
  data: KeychainRequest;
  domain: string;
  tab: number;
  canWhitelist?: boolean;
  header?: string;
  checkboxLabelOverride?: string;
  accounts?: string[];
  username?: string;
  setUsername?: (username: string) => void;
  redHeader?: boolean;
};

const Operation = ({
  title,
  children,
  onConfirm,
  domain,
  tab,
  data,
  header,
  checkboxLabelOverride,
  canWhitelist = false,
  accounts,
  username,
  redHeader,
  setUsername,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useMultisig, setUseMultisig] = useState(false);
  const [twoFABots, setTwoFABots] = useState<{ [botName: string]: string }>({});
  const domainHeader = useDomainCheck({ ...data, domain });

  useEffect(() => {
    if (data && (username || data.username)) checkForMultsig();
  }, [data, username]);

  const saveIsMultisig = async () => {
    if (useMultisig) {
      LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.__REQUEST_HANDLER,
      ).then((data) => {
        data.isMultisig = true;

        LocalStorageUtils.saveValueInLocalStorage(
          LocalStorageKeyEnum.__REQUEST_HANDLER,
          data,
        );
      });
    }
  };
  const checkForMultsig = async () => {
    let useMultisig = false;
    const name = (username || data.username)!;

    if (
      [
        KeychainRequestTypes.signBuffer,
        KeychainRequestTypes.signTx,
        KeychainRequestTypes.encode,
        KeychainRequestTypes.decode,
        KeychainRequestTypes.addAccount,
      ].includes(data.type)
    ) {
      setUseMultisig(false);
      return;
    }
    const method = getRequiredWifType(data).toLowerCase();
    const initiatorAccount = await AccountUtils.getExtendedAccount(name);
    const localAccount = await AccountUtils.getAccountFromLocalStorage(name);

    switch (method) {
      case KeychainKeyTypesLC.active: {
        if (data.key || localAccount?.keys.active) {
          useMultisig = KeysUtils.isUsingMultisig(
            localAccount?.keys.active!,
            initiatorAccount,
            localAccount?.keys.activePubkey?.startsWith('@')
              ? localAccount?.keys.activePubkey.replace('@', '')
              : localAccount?.name!,
            method,
          );
          setUseMultisig(useMultisig);

          if (useMultisig) {
            const accounts = await MultisigUtils.get2FAAccounts(
              initiatorAccount,
              KeychainKeyTypes.active,
            );

            accounts.forEach((acc) =>
              setTwoFABots((old) => {
                return { ...old, [acc]: '' };
              }),
            );
          }
        }
        break;
      }
      case KeychainKeyTypesLC.posting: {
        if (data.key || localAccount?.keys.posting) {
          useMultisig = KeysUtils.isUsingMultisig(
            localAccount?.keys.posting!,
            initiatorAccount,
            localAccount?.keys.postingPubkey?.startsWith('@')
              ? localAccount?.keys.postingPubkey.replace('@', '')
              : localAccount?.name!,
            method,
          );
          setUseMultisig(useMultisig);

          if (useMultisig) {
            const accounts = await MultisigUtils.get2FAAccounts(
              initiatorAccount,
              KeychainKeyTypes.posting,
            );

            accounts.forEach((acc) =>
              setTwoFABots((old) => {
                return { ...old, [acc]: '' };
              }),
            );
          }
        }
        break;
      }
      default:
        setUseMultisig(false);
    }
  };

  const genericOnConfirm = () => {
    setLoading(true);
    const metadata = { twoFACodes: twoFABots };
    saveIsMultisig();
    chrome.runtime.sendMessage({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: data,
        tab: tab,
        domain: domain,
        keep,
        options: { metaData: metadata } as TransactionOptions,
      },
    });
  };

  return (
    <div className="operation">
      <div
        className="scrollable"
        style={{
          height: canWhitelist ? '70%' : '85%',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '16px',
        }}>
        <div>
          <DialogHeader title={title} />
          {domainHeader && (
            <div className={`operation-header operation-red`}>
              {domainHeader}
            </div>
          )}
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
            </div>
          )}

          {useMultisig && (
            <div
              data-testid="use-multisig-message"
              className="multisig-message">
              <img src="/assets/images/multisig/logo.png" className="logo" />
              <div className="message">
                {chrome.i18n.getMessage('multisig_disclaimer_message')}
              </div>
            </div>
          )}

          {accounts && (
            <RequestUsername
              accounts={accounts}
              username={username!}
              setUsername={setUsername!}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flex: 1,
            flexDirection: 'column',
          }}>
          <div className="operation-body">
            <div className="fields">{...children}</div>
          </div>
        </div>
      </div>
      {twoFABots && Object.keys(twoFABots).length > 0 && (
        <div className="two-fa-codes-panel">
          {Object.entries(twoFABots).map(([botName, code]) => (
            <InputComponent
              key={`${botName}-2fa-code`}
              type={InputType.TEXT}
              value={code}
              onChange={(value) => {
                setTwoFABots((old) => {
                  return { ...old, [botName]: value };
                });
              }}
              label={chrome.i18n.getMessage('multisig_bot_two_fa_code', [
                botName,
              ])}
              skipLabelTranslation
            />
          ))}
        </div>
      )}
      {canWhitelist && (
        <CheckboxPanelComponent
          onChange={setKeep}
          checked={keep}
          skipTranslation
          title={
            checkboxLabelOverride ||
            chrome.i18n.getMessage('dialog_no_prompt', [
              data.type,
              data.username!,
              domain,
            ])
          }
        />
      )}

      {!loading && (
        <div className={`operation-buttons `}>
          <ButtonComponent
            label="dialog_cancel"
            type={ButtonType.ALTERNATIVE}
            onClick={() => {
              window.close();
            }}
            height="small"
          />
          <ButtonComponent
            type={ButtonType.IMPORTANT}
            label="dialog_confirm"
            onClick={onConfirm || genericOnConfirm}
            height="small"
          />
        </div>
      )}

      <LoadingComponent
        hide={!loading}
        caption={
          useMultisig
            ? twoFABots && Object.keys(twoFABots).length > 0
              ? 'multisig_transmitting_to_2fa'
              : 'multisig_transmitting_to_multisig'
            : undefined
        }
      />
    </div>
  );
};

export default Operation;
