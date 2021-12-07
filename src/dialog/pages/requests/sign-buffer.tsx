import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import React from 'react';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestSignBuffer & RequestId;
  domain: string;
  tab: number;
  testnet: boolean;
  accounts?: string[];
};

const SignBuffer = (props: Props) => {
  const { data, domain, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
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
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <RequestItem title="dialog_message" content={data.message} />
    </Operation>
  );
};

export default SignBuffer;
