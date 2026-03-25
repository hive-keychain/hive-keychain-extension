import { SVGIcons } from '@common-ui/icons.enum';
import { ModalComponent } from '@common-ui/modal/modal.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import SignTransaction, {
  SignFromLedgerRequestMessage,
} from '@dialog/hive/sign-transaction/sign-transaction';
import {
  DialogQueueMessage,
  ErrorMessage,
  EvmRequestMessage,
  FeedbackMessage,
  HiveRequestMessage,
  RequestAddEvmChainMessage,
  ResultMessage,
} from '@dialog/interfaces/messages.interface';
import { DialogError } from '@dialog/multichain/error/error';
import { RequestConfirmation } from '@dialog/multichain/request/request-confirmation/request-confirmation';
import { RequestResponse } from '@dialog/multichain/request/request-response/request-response';
import AddAccountQR, {
  AddAccountQRMessage,
} from '@dialog/pages/add-account-qr/add-account-qr';
import {
  KeylessUsernameComponent,
  KeylessUsernameMessage,
} from '@dialog/pages/keyless-username/keyless-username';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';

interface Props {
  message:
    | SignFromLedgerRequestMessage
    | KeylessUsernameMessage
    | AddAccountQRMessage
    | HiveRequestMessage
    | EvmRequestMessage
    | RequestAddEvmChainMessage;
  feedBackMessage: FeedbackMessage | null;
  setFeedBackMessage: (feedBackMessage: FeedbackMessage | null) => void;
}

export const DialogConfirmationPage = ({
  message,
  feedBackMessage,
  setFeedBackMessage,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [requestQueue, setRequestQueue] = useState<DialogQueueMessage[]>([]);
  const afterCancel = () => {};

  const isConfirmMessage = (
    currentMessage: Props['message'],
  ): currentMessage is HiveRequestMessage | EvmRequestMessage => {
    return (
      'command' in currentMessage &&
      (currentMessage.command === DialogCommand.SEND_DIALOG_CONFIRM ||
        currentMessage.command === DialogCommand.SEND_DIALOG_CONFIRM_EVM)
    );
  };

  useEffect(() => {
    if (isConfirmMessage(message)) {
      setRequestQueue((previousQueue) => {
        const snapshotQueue =
          message.queue?.length &&
          message.queue.every((item) => 'command' in item)
            ? message.queue
            : null;
        const nextQueue = snapshotQueue
          ? snapshotQueue
          : (() => {
              const next = [...previousQueue];
              const existingIndex = next.findIndex(
                (item) =>
                  item.command === message.command &&
                  item.tab === message.tab &&
                  item.request.request_id === message.request.request_id,
              );
              if (existingIndex >= 0) {
                next[existingIndex] = message;
              } else {
                next.push(message);
              }
              return next;
            })();

        const nextSelectedIndex = snapshotQueue
          ? Math.max((message.queuePosition ?? 1) - 1, 0)
          : previousQueue.length === 0
            ? 0
            : selectedIndex;

        setSelectedIndex(nextSelectedIndex);
        return nextQueue;
      });
    } else {
      setRequestQueue([]);
      setSelectedIndex(0);
    }
  }, [message, selectedIndex]);

  useEffect(() => {
    if (selectedIndex >= requestQueue.length && requestQueue.length > 0) {
      setSelectedIndex(requestQueue.length - 1);
    }
  }, [requestQueue, selectedIndex]);

  const displayRequest = (displayedMessage: Props['message']) => {
    if (!('command' in displayedMessage)) {
      return <SignTransaction data={displayedMessage} />;
    }

    switch (displayedMessage.command) {
      case DialogCommand.SEND_DIALOG_CONFIRM:
      case DialogCommand.SEND_DIALOG_CONFIRM_EVM:
        return (
          <RequestConfirmation
            message={displayedMessage as HiveRequestMessage | EvmRequestMessage}
            afterCancel={afterCancel}
          />
        );
      case DialogCommand.ANONYMOUS_KEYLESS_OP:
        return (
          <KeylessUsernameComponent
            data={displayedMessage as KeylessUsernameMessage}
          />
        );
      case DialogCommand.SIGN_WITH_LEDGER:
        return <SignTransaction data={displayedMessage as any} />;
      case DialogCommand.ADD_ACCOUNT:
        return <AddAccountQR data={displayedMessage as AddAccountQRMessage} />;
      default:
        return <div>Default screen</div>;
    }
  };

  const displayFeedBackMessage = (
    feedbackMessage: ResultMessage | ErrorMessage,
  ) => {
    switch (feedbackMessage.command) {
      case DialogCommand.SEND_DIALOG_ERROR:
        return (
          <DialogError
            data={feedbackMessage}
            onClose={() => setFeedBackMessage(null)}
          />
        );

      case DialogCommand.ANSWER_REQUEST:
      case DialogCommand.ANSWER_EVM_REQUEST:
        return (
          <RequestResponse
            data={feedbackMessage}
            onClose={() => setFeedBackMessage(null)}
          />
        );
    }
  };

  const queueItems = isConfirmMessage(message)
    ? requestQueue.length
      ? requestQueue
      : [message]
    : [message];
  const displayedMessage =
    (queueItems[selectedIndex] as Props['message']) ?? message;
  const queueSize = queueItems.length;
  const queuePosition = queueSize > 1 ? selectedIndex + 1 : 1;

  return (
    <div className="dialog-confirmation-page">
      {queueSize > 1 && (
        <div className="multiple-page-container">
          {selectedIndex > 0 && (
            <SVGIcon
              className="previous-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() => setSelectedIndex(selectedIndex - 1)}
            />
          )}
          {queuePosition} / {queueSize}
          {selectedIndex < queueItems.length - 1 && (
            <SVGIcon
              className="next-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() => setSelectedIndex(selectedIndex + 1)}
            />
          )}
        </div>
      )}
      {displayRequest(displayedMessage)}
      {feedBackMessage && (
        <ModalComponent>
          {displayFeedBackMessage(feedBackMessage)}
        </ModalComponent>
      )}
    </div>
  );
};
