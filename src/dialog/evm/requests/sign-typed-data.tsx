import { EvmRequest } from '@interfaces/evm-provider.interface';
import {
  TransactionConfirmationField,
  TransactionConfirmationFields,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import {
  EvmInputDisplayType,
  EvmTransactionParserUtils,
} from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmFormatUtils } from '@popup/evm/utils/format.utils';
import React, { useEffect, useState } from 'react';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { EvmAccountImage } from 'src/common-ui/evm/evm-account-image/evm-account-image.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmTransactionWarningsComponent } from 'src/dialog/evm/requests/transaction-warnings/transaction-warning.component';
import { useTransactionHook } from 'src/dialog/evm/requests/transaction-warnings/transaction.hook';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';
import FormatUtils from 'src/utils/format.utils';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

interface SignTypedDataMessage {
  domain: {
    chainId?: string;
    name?: string;
    verifyingContract?: string;
    version?: string;
    salt?: string;
  };
  message: any;
  primaryType: string;
  types: any;
}

export const SignTypedData = (props: Props) => {
  const { accounts, data, request } = props;

  const [message, setMessage] = useState<SignTypedDataMessage>(
    typeof request.params[1] === 'string'
      ? JSON.parse(request.params[1])
      : request.params[1],
  );
  const [target, setTarget] = useState<string>(request.params[0]);

  const transactionHook = useTransactionHook(data, request);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    let transactionConfirmationFields = {
      otherFields: [],
      operationName: chrome.i18n.getMessage('dialog_evm_sign_data_title'),
    } as TransactionConfirmationFields;

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation(
        data.dappInfo.domain,
      );
    transactionConfirmationFields.otherFields.push(
      await transactionHook.getDomainWarnings(transactionInfo),
    );

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.STRING,
      name: 'evm_chain_id',
      value: formatValue(message.domain.chainId, EvmInputDisplayType.STRING),
    });

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.CONTRACT_ADDRESS,
      name: 'dialog_evm_sign_request_interacting_with',
      value: formatValue(
        message.domain.verifyingContract,
        EvmInputDisplayType.CONTRACT_ADDRESS,
      ),
    });

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.STRING,
      name: 'evm_domain_name',
      value: formatValue(message.domain.name, EvmInputDisplayType.STRING),
    });

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.STRING,
      name: 'evm_domain_version',
      value: formatValue(message.domain.version, EvmInputDisplayType.STRING),
    });

    const lastChain = await EvmChainUtils.getLastEvmChain();

    const accountDisplay = await transactionHook.getWalletAddressInput(
      target,
      lastChain.chainId,
      transactionInfo,
    );

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.WALLET_ADDRESS,
      name: 'evm_target_account',
      value: accountDisplay.value,
    } as TransactionConfirmationField);

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.STRING_CENTERED,
      value: chrome.i18n.getMessage('evm_sign_typed_data_message'),
    });

    transactionConfirmationFields.otherFields.push({
      type: EvmInputDisplayType.STRING,
      name: chrome.i18n.getMessage('evm_sign_typed_data_message_primary_type'),
      value: message.primaryType,
    } as TransactionConfirmationField);

    const baseType = message.types[message.primaryType];

    transactionConfirmationFields = parseTypes(
      baseType,
      message.message,
      transactionConfirmationFields,
      0,
    );

    transactionHook.setFields(transactionConfirmationFields);
  };

  const parseTypes = (
    baseType: any,
    data: any,
    transactionConfirmationFields: TransactionConfirmationFields,
    level: number,
  ) => {
    for (const field of baseType) {
      const isArray = field.type.includes('[]');

      let type = field.type;
      if (isArray) {
        type = field.type.replace('[]', '');
      }

      if (Object.keys(message.types).includes(type)) {
        transactionConfirmationFields.otherFields.push({
          type: EvmInputDisplayType.STRING,
          value: '',
          name: field.name,
          style: { paddingLeft: 12 * level },
        });
        if (isArray) {
          for (const d of data[field.name]) {
            transactionConfirmationFields = parseTypes(
              message.types[type],
              d,
              transactionConfirmationFields,
              level + 1,
            );
          }
        } else {
          transactionConfirmationFields = parseTypes(
            message.types[type],
            data[field.name],
            transactionConfirmationFields,
            level + 1,
          );
        }
      } else {
        transactionConfirmationFields.otherFields.push({
          type: type,
          name: field.name,
          value: isArray ? (
            <div className="list">
              {data[field.name].map((item: any) => (
                <span>{formatValue(item, type)}</span>
              ))}
            </div>
          ) : (
            formatValue(data[field.name], type)
          ),
          style: { paddingLeft: 12 * level },
        });
      }
    }
    return transactionConfirmationFields;
  };

  const formatValue = (value: any, inputDisplayType: EvmInputDisplayType) => {
    let formatedValue;
    switch (inputDisplayType) {
      case EvmInputDisplayType.ADDRESS:
      case EvmInputDisplayType.CONTRACT_ADDRESS:
      case EvmInputDisplayType.WALLET_ADDRESS: {
        const formattedAddress = EvmFormatUtils.formatAddress(value);

        formatedValue = (
          <div className="value-content-horizontal">
            <EvmAccountImage address={value} />
            <CustomTooltip message={value} skipTranslation>
              <span>{formattedAddress}</span>
            </CustomTooltip>
          </div>
        );
        break;
      }
      case EvmInputDisplayType.UINT256: {
        formatedValue = FormatUtils.withCommas(value, 0);
        break;
      }
      case EvmInputDisplayType.NUMBER: {
        formatedValue = FormatUtils.withCommas(value);
        break;
      }
      case EvmInputDisplayType.BYTES:
      case EvmInputDisplayType.STRING: {
        formatedValue = String(value);
        break;
      }
      default:
        formatedValue = 'default';
    }
    return formatedValue;
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={data.tab}
      title={chrome.i18n.getMessage('dialog_evm_sign_data_title')}
      fields={<EvmTransactionWarningsComponent warningHook={transactionHook} />}
      warningHook={transactionHook}></EvmOperation>
  );
};
