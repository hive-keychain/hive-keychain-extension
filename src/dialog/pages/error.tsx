import React from 'react';
import { ResultMessagePageComponent } from 'src/common-ui/result-message-page/result-message-page.component';

type Props = {
  data: ErrorMessage;
};

type ErrorMessage = {
  msg: { display_msg: string };
};

const DialogError = ({ data }: Props) => {
  return (
    <ResultMessagePageComponent
      type="error"
      title="message_container_title_fail"
      message={data.msg.display_msg}
      skipMessageTranslation={true}
      onClose={() => window.close()}
    />
  );
};

export default DialogError;
