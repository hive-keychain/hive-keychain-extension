import { SVGIcons } from '@common-ui/icons.enum';
import { ModalComponent } from '@common-ui/modal/modal.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import SignTransaction, {
  SignFromLedgerRequestMessage,
} from '@dialog/hive/sign-transaction/sign-transaction';
import {
  ErrorMessage,
  EvmRequestMessage,
  FeedbackMessage,
  HiveRequestMessage,
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
    | EvmRequestMessage;
  feedBackMessage: FeedbackMessage | null;
  setFeedBackMessage: (feedBackMessage: FeedbackMessage | null) => void;
}

type RequestsMessages = (HiveRequestMessage | EvmRequestMessage)[];

export const DialogConfirmationPage = ({
  message,
  feedBackMessage,
  setFeedBackMessage,
}: Props) => {
  const [displayedRequestIndex, setDisplayedRequestIndex] = useState(0);
  const [requestsMessages, setRequestsMessages] = useState<RequestsMessages>(
    [],
  );
  const [displayedRequest, setDisplayedRequest] = useState<
    HiveRequestMessage | EvmRequestMessage
  >();

  const closeFeedBackMessage = () => {
    if (feedBackMessage) {
      const index = requestsMessages.findIndex(
        (message) =>
          message.request.request_id ===
            (feedBackMessage as any).msg.request_id &&
          message.tab === feedBackMessage.msg.tab,
      );
      const newMessages = requestsMessages.splice(index, 1);

      if (newMessages.length === 0) {
        console.log('should close dialog', feedBackMessage);
        // window.close();
      }
      setDisplayedRequestIndex((prev) => {
        return prev === 0 ? 0 : prev - 1;
      });
      setRequestsMessages(newMessages);
      setFeedBackMessage(null);
    }
  };

  useEffect(() => {
    setRequestsMessages([...requestsMessages, message] as RequestsMessages);
  }, [message]);

  useEffect(() => {
    if (requestsMessages.length > 0) {
      setDisplayedRequest(requestsMessages[displayedRequestIndex]);
    }
  }, [requestsMessages, displayedRequestIndex]);

  const displayRequest = (displayedMessage: any) => {
    switch (displayedMessage.command) {
      case DialogCommand.SEND_DIALOG_CONFIRM:
      case DialogCommand.SEND_DIALOG_CONFIRM_EVM:
        return <RequestConfirmation message={displayedMessage} />;
      case DialogCommand.ANONYMOUS_KEYLESS_OP:
        return <KeylessUsernameComponent data={displayedMessage} />;
      case DialogCommand.SIGN_WITH_LEDGER:
        return <SignTransaction data={displayedMessage} />;
      case DialogCommand.ADD_ACCOUNT:
        return <AddAccountQR data={displayedMessage} />;
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
            onClose={() => closeFeedBackMessage()}
          />
        );

      case DialogCommand.ANSWER_REQUEST:
      case DialogCommand.ANSWER_EVM_REQUEST:
        return (
          <RequestResponse
            data={feedbackMessage}
            onClose={() => closeFeedBackMessage()}
          />
        );
    }
  };

  return (
    <div className="dialog-confirmation-page">
      {requestsMessages.length > 1 && (
        <div className="multiple-page-container">
          {displayedRequestIndex > 0 && (
            <SVGIcon
              className="previous-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() =>
                setDisplayedRequestIndex(displayedRequestIndex - 1)
              }
            />
          )}
          {displayedRequestIndex + 1} / {requestsMessages.length}
          {displayedRequestIndex < requestsMessages.length - 1 && (
            <SVGIcon
              className="next-button"
              icon={SVGIcons.GLOBAL_ARROW_RIGHT}
              onClick={() =>
                setDisplayedRequestIndex(displayedRequestIndex + 1)
              }
            />
          )}
        </div>
      )}
      {displayedRequest && <>{displayRequest(displayedRequest)}</>}
      {feedBackMessage && (
        <ModalComponent>
          {displayFeedBackMessage(feedBackMessage)}
        </ModalComponent>
      )}
    </div>
  );
};
