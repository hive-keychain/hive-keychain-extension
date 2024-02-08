import { RequestId, RequestPost } from '@interfaces/keychain.interface';
import { Rpc } from '@interfaces/rpc.interface';
import React from 'react';
import { Separator } from 'src/common-ui/separator/separator.component';
import CollaspsibleItem from 'src/dialog/components/collapsible-item/collapsible-item';
import Operation from 'src/dialog/components/operation/operation';
import RequestItem from 'src/dialog/components/request-item/request-item';

type Props = {
  data: RequestPost & RequestId;
  domain: string;
  tab: number;
  rpc: Rpc;
};

const Post = (props: Props) => {
  const { data } = props;
  return (
    <Operation
      title={chrome.i18n.getMessage('dialog_title_post')}
      {...props}
      canWhitelist>
      <RequestItem title="dialog_account" content={`@${data.username}`} />
      <Separator type={'horizontal'} fullSize />
      {data.title ? (
        <>
          <RequestItem title="dialog_title" content={data.title} />
          <Separator type={'horizontal'} fullSize />
        </>
      ) : (
        <></>
      )}

      <RequestItem title="dialog_permlink" content={data.permlink} />
      <Separator type={'horizontal'} fullSize />
      <>
        {data.parent_username && (
          <>
            <RequestItem
              title="dialog_pu"
              content={`@${data.parent_username}`}
            />
            <Separator type={'horizontal'} fullSize />
          </>
        )}
      </>
      <RequestItem title="dialog_pp" content={data.parent_perm} />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem title="dialog_body" content={data.body} />
      <Separator type={'horizontal'} fullSize />
      <CollaspsibleItem title="dialog_meta" content={data.json_metadata} pre />
    </Operation>
  );
};

export default Post;
