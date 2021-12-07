import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import React, { useEffect, useState } from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestSignBuffer & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
  accounts?: string[];
};

const SignBuffer = (props: Props) => {
  const { data, domain, accounts } = props;
  const [username, setUsername] = useState('');
  useEffect(() => {
    if (data.username) setUsername(data.username);
    else {
      data.username = accounts![0];
      setUsername(accounts![0]);
    }
  }, [accounts, data.username]);
  const renderUsername = () => {
    return !accounts ? (
      <RequestItem title={'dialog_account'} content={`@${data.username}`} />
    ) : (
      <></>
    );
  };
  return (
    <Operation
      title={data.title || chrome.i18n.getMessage('dialog_title_sign')}
      header={
        data.username
          ? chrome.i18n.getMessage('dialog_desc_sign', [
              domain,
              data.method.toLowerCase(),
              data.username,
            ])
          : chrome.i18n.getMessage('dialog_desc_user_unknown', [
              domain,
              data.method.toLowerCase(),
            ])
      }
      checkboxLabel={chrome.i18n.getMessage('dialog_no_prompt_verify', [
        data.username,
        domain,
      ])}
      {...props}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}
      accounts={accounts}
      username={username}
      setUsername={(us: string) => {
        data.username = us;
        setUsername(us);
      }}>
      {renderUsername()}
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default SignBuffer;
