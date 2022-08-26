import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import CheckboxComponent, {
  LabelAlignment,
} from 'src/common-ui/checkbox/checkbox.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import RequestUsername from 'src/dialog/components/request-username/request-username';
import './operation.scss';

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
    <div aria-label="dialog-operation-component" className="operation">
      <div>
        <DialogHeader ariaLabel="operation" title={title} />
        {header && (
          <div
            aria-label="operation_header"
            className={`operation_header ${redHeader ? 'operation-red' : ''}`}>
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

      <div className="operation_body">{...children}</div>
      <div className={`operation_footer ${canWhitelist ? '' : 'no-whitelist'}`}>
        <div aria-label="whitelist-operation" className={`whitelist_operation`}>
          {canWhitelist && (
            <CheckboxComponent
              ariaLabel="checkbox-set-keep"
              onChange={setKeep}
              checked={keep}
              skipTranslation
              alignment={LabelAlignment.CENTER}
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
        </div>
        <div className={`operation_buttons ${loading ? 'hide' : ''}`}>
          <ButtonComponent
            ariaLabel="dialog_cancel-button"
            label="dialog_cancel"
            type={ButtonType.STROKED}
            onClick={() => {
              window.close();
            }}
          />
          <ButtonComponent
            ariaLabel="dialog_confirm-button"
            type={ButtonType.RAISED}
            label="dialog_confirm"
            onClick={onConfirm || genericOnConfirm}
          />
        </div>
      </div>
      <LoadingComponent hide={!loading} />
    </div>
  );
};

export default Operation;
