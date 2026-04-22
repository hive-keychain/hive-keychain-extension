import { ResultMessagePageComponent } from '@common-ui/result-message-page/result-message-page.component';
import { ResultMessage } from '@dialog/interfaces/messages.interface';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React from 'react';

type Props = {
  data: ResultMessage;
  onClose?: () => void;
};

export const RequestResponse = ({ data, onClose }: Props) => {
  if (data.msg.success) {
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        close();
      }
    }, 3000);
  }

  const getErrorMessage = () => {
    switch (data.command) {
      case DialogCommand.ANSWER_EVM_REQUEST: {
        return <>{data.msg.message}</>;
      }
      case DialogCommand.ANSWER_REQUEST: {
        return (
          <>
            {data.msg.message.split(/<br\s?\/?>/g).map((msg, index) => (
              <p key={`p-${index}`} style={{ wordBreak: 'break-word' }}>
                {msg}
              </p>
            ))}
          </>
        );
      }
    }
  };

  return (
    <ResultMessagePageComponent
      type={data.msg.success ? 'success' : 'error'}
      title={
        data.msg.success
          ? 'message_container_title_success'
          : 'message_container_title_fail'
      }
      message={getErrorMessage() as unknown as string}
      skipMessageTranslation={true}
      autoCloseDelayMs={data.msg.success ? 3000 : undefined}
      onClose={() => window.close()}
    />
  );
};
