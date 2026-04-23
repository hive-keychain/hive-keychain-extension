import { KeychainRequest } from 'hive-keychain-commons';
import React from 'react';
import { ResultMessagePageComponent } from 'src/common-ui/result-message-page/result-message-page.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: {
    message: string;
    success: boolean;
    data: KeychainRequest;
  };
};
const RequestResponse = ({ data }: Props) => {
  return (
    <ResultMessagePageComponent
      type={data.msg.success ? 'success' : 'error'}
      title={
        data.msg.success
          ? 'message_container_title_success'
          : 'message_container_title_fail'
      }
      message={data.msg.message}
      skipMessageTranslation={true}
      autoCloseDelayMs={data.msg.success ? 3000 : undefined}
      onClose={() => window.close()}
    />
  );
};

export default RequestResponse;
