import { EvmRequest } from '@interfaces/evm-provider.interface';
import { TransactionConfirmationFields } from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import React, { useEffect, useState } from 'react';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

interface SignatureRequestMessage {
  message: {
    contents: string;
    from: {
      name: string;
      wallets: string[];
    };
    to: {
      name: string;
      wallets: string[];
    }[];
    attachment: string;
  };
  primaryType: string;
  domain: {
    chainId: string;
    name: string;
    verifyingContract: string;
    version: string;
  };
}

export const SignTypedData = (props: Props) => {
  const { accounts, data, request } = props;

  const [message, setMessage] = useState<SignatureRequestMessage>(
    typeof request.params[1] === 'string'
      ? JSON.parse(request.params[1])
      : request.params[1],
  );
  const [target, setTarget] = useState<string>(request.params[0]);

  const warningHook = useTransactionHook(data, request);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let transactionConfirmationFields = {
      otherFields: [],
    } as TransactionConfirmationFields;
    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation(
        data.dappInfo.domain,
      );
    transactionConfirmationFields.otherFields.push(
      await warningHook.getDomainWarnings(transactionInfo),
    );
    warningHook.setFields(transactionConfirmationFields);
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_data_title')}
      fields={<EvmTransactionWarningsComponent warningHook={warningHook} />}
      // fields={
      //   <>

      //     <RequestItem
      //       title="dialog_evm_domain"
      //       content={`${data.dappInfo.domain}`}
      //     />
      //     <RequestItem
      //       title="dialog_evm_sign_request_interacting_with"
      //       content={`${EvmFormatUtils.formatAddress(
      //         message.domain.verifyingContract,
      //       )}`}
      //     />
      //     <Separator type="horizontal" fullSize />
      //     <RequestItem
      //       title="dialog_evm_sign_request_primary_type"
      //       content={`${message.primaryType}`}
      //     />
      //     <RequestItem
      //       title="dialog_evm_sign_request_message"
      //       content={`${message.message.contents}`}
      //     />
      //     <RequestItem
      //       title="dialog_from"
      //       content={`${message.message.from.name}`}
      //     />
      //     <>
      //       {message.message.from.wallets.map((walletAddress: string) => (
      //         <RequestItem
      //           key={walletAddress}
      //           title=""
      //           content={`${EvmFormatUtils.formatAddress(walletAddress)}`}
      //         />
      //       ))}
      //     </>
      //     <>
      //       {message.message.to.map((to, index) => (
      //         <React.Fragment key={`to-${index}`}>
      //           <RequestItem title="dialog_to" content={`${to.name}`} />
      //           {to.wallets.map((walletAddress: string) => (
      //             <RequestItem
      //               key={walletAddress}
      //               title=""
      //               content={`${EvmFormatUtils.formatAddress(walletAddress)}`}
      //             />
      //           ))}
      //         </React.Fragment>
      //       ))}
      //     </>
      //   </>
      // }
      warningHook={warningHook}></EvmOperation>
  );
};
