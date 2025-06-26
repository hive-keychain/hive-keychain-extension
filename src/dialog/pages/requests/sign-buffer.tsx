import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSignBuffer,
} from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import UsernameWithAvatar from 'src/common-ui/username-with-avatar/username-with-avatar';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';
import { useAnonymousRequest } from 'src/dialog/hooks/anonymous-requests';

type Props = {
  data: RequestSignBuffer & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
  accounts?: string[];
};

const SignBuffer = (props: Props) => {
  const { data, domain, accounts } = props;
  const anonymousProps = useAnonymousRequest(data, accounts);
  const renderUsername = () => {
    return !accounts && data.username ? (
      <>
        <UsernameWithAvatar title={'dialog_account'} username={data.username} />
        <Separator type={'horizontal'} fullSize />
      </>
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
      checkboxLabelOverride={chrome.i18n.getMessage('dialog_no_prompt_verify', [
        data.username!,
        domain,
      ])}
      canWhitelist={data.method.toLowerCase() !== KeychainKeyTypesLC.active}
      {...props}
      {...anonymousProps}>
      {renderUsername()}
      <RequestItem
        title="dialog_message"
        content={
          data.message.length > 500
            ? data.message.substring(0, 500) + ' ...'
            : data.message
        }
      />
    </Operation>
  );
};

export default SignBuffer;
