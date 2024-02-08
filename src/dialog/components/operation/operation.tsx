import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import RequestUsername from 'src/dialog/components/request-username/request-username';

type Props = {
  title: string;
  children: JSX.Element[];
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

  const genericOnConfirm = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: data,
        tab: tab,
        domain: domain,
        keep,
      },
    });
  };

  return (
    <div className="operation">
      <div
        style={{
          height: canWhitelist ? '70%' : '85%',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <div>
          <DialogHeader title={title} />
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
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

      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default Operation;
