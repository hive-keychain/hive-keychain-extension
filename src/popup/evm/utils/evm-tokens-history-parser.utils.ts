import { AvalancheApi } from '@popup/evm/api/avalanche.api';
import { BlockscoutApi } from '@popup/evm/api/blockscout.api';
import { EvmAddressType } from '@popup/evm/interfaces/evm-addresses.interface';
import { EvmSettings } from '@popup/evm/interfaces/evm-settings.interface';
import {
  EvmTokenTransferInHistoryItem,
  EvmTokenTransferOutHistoryItem,
  EvmUserHistoryItem,
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
  EvmUserHistoryItemType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EVMSmartContractType,
  EvmSmartContractInfo,
} from '@popup/evm/interfaces/evm-tokens.interface';
import {
  AvalancheNativeTransactionType,
  EvmTransactionDecodedData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import {
  BlockExplorerType,
  EvmChain,
} from '@popup/multichain/interfaces/chains.interface';
import { ethers } from 'ethers';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';

const parseEvent = async (
  event: any,
  chain: EvmChain,
  walletAddress: string,
  allTokensMetadata: EvmSmartContractInfo[],
  evmSettings?: EvmSettings,
) => {
  let historyItem = { ...getCommonHistoryItem(event) } as EvmUserHistoryItem;

  // parse event

  switch (chain.blockExplorerApi?.type) {
    case BlockExplorerType.AVALANCHE_SCAN: {
      if (event.token) {
        const details: EvmUserHistoryItemDetail[] = [];
        details.push({
          label: 'popup_html_evm_transaction_info_from',
          value: event.from,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        });
        details.push({
          label: 'popup_html_evm_transaction_info_to',
          value: event.to,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        });

        const addressDetails = await EvmAddressesUtils.getAddressDetails(
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? event.to
            : event.from,
          chain.chainId,
        );

        switch (event.token.type) {
          case EVMSmartContractType.ERC20: {
            const amount = ethers.formatUnits(
              event.value,
              event.token.decimals,
            );
            const amountS = FormatUtils.withCommas(
              amount,
              event.token.decimals,
              true,
            );

            details.push({
              label: 'popup_html_transfer_amount',
              value: `${amountS} ${event.token!.symbol.toString()}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            });

            if (
              event.to.toLowerCase() === walletAddress.toLowerCase() &&
              Number(amount) === 0 &&
              (await EvmAddressesUtils.isPotentialSpoofing(event.from))
            ) {
              historyItem.warningMessage = chrome.i18n.getMessage(
                'evm_history_warning_potential_zero_amount_scam',
              );
            }

            historyItem.label = chrome.i18n.getMessage(
              event.from.toLowerCase() === walletAddress.toLowerCase()
                ? 'popup_html_evm_history_transfer_out'
                : event.from === ethers.ZeroAddress
                ? 'evm_history_operation_transfer_in_no_sender'
                : 'popup_html_evm_history_transfer_in',
              [
                amountS,
                event.token!.symbol,
                addressDetails.label ?? addressDetails.formattedAddress,
              ],
            );

            break;
          }
          case EVMSmartContractType.ERC721: {
            details.unshift({
              label: `${event.token.name}#${Number(event.token.tokenId)}`,
              value: event.token.tokenId,
              type: EvmUserHistoryItemDetailType.IMAGE,
            });

            historyItem.label = chrome.i18n.getMessage(
              event.from.toLowerCase() === walletAddress.toLowerCase()
                ? 'evm_history_operation_safe_transfer_from_erc721_out'
                : event.from === ethers.ZeroAddress
                ? 'evm_history_operation_safe_transfer_from_erc721_in_no_sender'
                : 'evm_history_operation_safe_transfer_from_erc721_in',
              [
                event.token!.symbol,
                event.token!.tokenId,
                addressDetails.label ?? addressDetails.formattedAddress,
              ],
            );

            break;
          }
          case EVMSmartContractType.ERC1155: {
            details.unshift({
              label: `${event.token.name}#${Number(event.token.tokenId)}`,
              value: event.token.tokenId,
              type: EvmUserHistoryItemDetailType.IMAGE,
            });

            historyItem.label = chrome.i18n.getMessage(
              event.from.toLowerCase() === walletAddress.toLowerCase()
                ? 'evm_history_operation_safe_transfer_from_erc1155_out'
                : event.from === ethers.ZeroAddress
                ? 'evm_history_operation_safe_transfer_from_erc1155_in_no_sender'
                : 'evm_history_operation_safe_transfer_from_erc1155_in',
              [
                event.value,
                event.token!.symbol,
                event.token!.tokenId,
                addressDetails.label ?? addressDetails.formattedAddress,
              ],
            );
            break;
          }
        }

        historyItem.pageTitle = 'popup_html_transfer_funds';
        historyItem.tokenInfo = event.token;
        historyItem.detailFields = details;
      } else {
        switch (event.method) {
          case AvalancheNativeTransactionType.CONTRACT_CALL: {
            // native event
            const amount = EvmFormatUtils.etherToWei(
              Number(event.value),
            ).toString();
            const amountS = FormatUtils.withCommas(amount, 18, true);

            const mainToken = allTokensMetadata.find(
              (t) => t.type == EVMSmartContractType.NATIVE,
            );
            const token = allTokensMetadata.find(
              (t) =>
                t.type !== EVMSmartContractType.NATIVE &&
                t.contractAddress.toLowerCase() === event.to.toLowerCase(),
            );

            const details: EvmUserHistoryItemDetail[] = [];
            details.push({
              label: 'popup_html_evm_transaction_info_from',
              value: event.from,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            });
            details.push({
              label: 'popup_html_evm_transaction_info_to',
              value: event.to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            });
            details.push({
              label: 'popup_html_transfer_amount',
              value: `${amountS} ${mainToken!.symbol.toString()}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            });
            historyItem.detailFields = details;
            historyItem.pageTitle = 'evm_pay_to_smart_contract';
            historyItem.tokenInfo = mainToken;

            historyItem.label = chrome.i18n.getMessage(
              'popup_html_evm_history_transfer_out',
              [amountS, mainToken!.symbol, token ? token.name : event.to],
            );
            break;
          }
          case AvalancheNativeTransactionType.NATIVE_TRANSFER: {
            historyItem = await getNativeTransferData(
              event,
              chain,
              walletAddress,
              allTokensMetadata,
              historyItem,
            );
            break;
          }
        }
      }

      break;
    }
    case BlockExplorerType.BLOCKSCOUT:
    case BlockExplorerType.ETHERSCAN: {
      if (
        (event.to === ethers.ZeroAddress && event.input === ethers.ZeroHash) ||
        (event.from === walletAddress.toLowerCase() &&
          event.to.toLowerCase() === walletAddress.toLowerCase())
      ) {
        historyItem.isCanceled = true;
        historyItem.label = chrome.i18n.getMessage(
          'evm_history_canceled_transaction',
        );
        historyItem.pageTitle = 'evm_history_canceled_transaction';
        historyItem.detailFields = [];
      } else if (
        event.contractAddress?.length > 0 &&
        (!event.to || event.to.length === 0)
      ) {
        // contract creation
        const details: EvmUserHistoryItemDetail[] = [];
        details.push({
          label: 'evm_created_smart_contract',
          value: event.contractAddress,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        });

        historyItem = {
          ...historyItem,
          type: EvmUserHistoryItemType.SMART_CONTRACT_CREATION,
        };

        historyItem.label = chrome.i18n.getMessage(
          'evm_history_smart_contract_creation_message',
          [EvmFormatUtils.formatAddress(event.contractAddress)],
        );
        historyItem.pageTitle = 'evm_history_smart_contract_creation';
        historyItem.detailFields = details;
      } else if (!!event.functionName || event.functionName.length > 0) {
        const functionName = event.functionName.split('(')[0];
        console.log(functionName, event);
        let label = '';
        let pageTitle = '';

        switch (functionName) {
          case 'transfer': {
            pageTitle = 'evm_transfer';
            const fromDetails = await EvmAddressesUtils.getAddressDetails(
              event.from,
              chain.chainId,
            );
            const toDetails = await EvmAddressesUtils.getAddressDetails(
              event.to,
              chain.chainId,
            );

            if (event.to.toLowerCase() === walletAddress.toLowerCase()) {
              // transfer in
              label = chrome.i18n.getMessage(
                'evm_history_operation_transfer_in',
                [
                  ethers.formatUnits(event.value, event.tokenDecimals),
                  event.tokenSymbol,
                  fromDetails.formattedAddress,
                ],
              );
            } else {
              // transfer out
              label = chrome.i18n.getMessage(
                'evm_history_operation_transfer_out',
                [
                  ethers.formatUnits(event.value, event.tokenDecimals),
                  event.tokenSymbol,
                  toDetails.formattedAddress,
                ],
              );
            }
            break;
          }
          case 'transferFrom': {
            pageTitle = 'evm_transfer';
            switch (event.type) {
              case EVMSmartContractType.ERC20: {
                const fromDetails = await EvmAddressesUtils.getAddressDetails(
                  event.from,
                  chain.chainId,
                );
                const toDetails = await EvmAddressesUtils.getAddressDetails(
                  event.to,
                  chain.chainId,
                );

                if (event.to.toLowerCase() === walletAddress.toLowerCase()) {
                  // transfer in
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_transfer_in',
                    [
                      ethers.formatUnits(event.value, event.tokenDecimals),
                      event.tokenSymbol,
                      fromDetails.formattedAddress,
                    ],
                  );
                } else {
                  // transfer out
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_transfer_out',
                    [
                      ethers.formatUnits(event.value, event.tokenDecimals),
                      event.tokenSymbol,
                      toDetails.formattedAddress,
                    ],
                  );
                }
                break;
              }
              case EVMSmartContractType.ERC721: {
                const fromDetails = await EvmAddressesUtils.getAddressDetails(
                  event.from,
                  chain.chainId,
                );
                const toDetails = await EvmAddressesUtils.getAddressDetails(
                  event.to,
                  chain.chainId,
                );

                pageTitle = 'evm_transfer';
                if (event.to.toLowerCase() === walletAddress.toLowerCase()) {
                  // transfer in
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc721_in',
                    [
                      event.tokenName,
                      event.tokenID,
                      fromDetails.formattedAddress,
                    ],
                  );
                } else {
                  // transfer out
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc721_out',
                    [
                      event.tokenName,
                      event.tokenID,
                      toDetails.formattedAddress,
                    ],
                  );
                }
                break;
              }
            }
          }
          case 'safeTransferFrom': {
            pageTitle = 'evm_transfer';
            switch (event.type) {
              case EVMSmartContractType.ERC721: {
                const fromDetails = await EvmAddressesUtils.getAddressDetails(
                  event.from,
                  chain.chainId,
                );
                const toDetails = await EvmAddressesUtils.getAddressDetails(
                  event.to,
                  chain.chainId,
                );
                if (event.to.toLowerCase() === walletAddress.toLowerCase()) {
                  // transfer in
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc721_in',
                    [
                      event.tokenName,
                      event.tokenID,
                      fromDetails.formattedAddress,
                    ],
                  );
                } else {
                  // transfer out
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc721_out',
                    [
                      event.tokenName,
                      event.tokenID,
                      toDetails.formattedAddress,
                    ],
                  );
                }
                break;
              }
              case EVMSmartContractType.ERC1155: {
                const fromDetails = await EvmAddressesUtils.getAddressDetails(
                  event.from,
                  chain.chainId,
                );
                const toDetails = await EvmAddressesUtils.getAddressDetails(
                  event.to,
                  chain.chainId,
                );
                if (event.to.toLowerCase() === walletAddress.toLowerCase()) {
                  // transfer in
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc1155_in',
                    [
                      event.tokenValue,
                      event.tokenName,
                      event.tokenID,
                      fromDetails.formattedAddress,
                    ],
                  );
                } else {
                  // transfer out
                  label = chrome.i18n.getMessage(
                    'evm_history_operation_safe_transfer_from_erc1155_out',
                    [
                      event.tokenValue,
                      event.tokenName,
                      event.tokenID,
                      toDetails.formattedAddress,
                    ],
                  );
                }
                break;
              }
            }
          }
          case 'safeBatchTransferFrom': {
            pageTitle = 'evm_transfer';
            //only 1155
            // TODO: implement
            break;
          }
          case 'mint': {
            switch (event.type) {
              case EVMSmartContractType.ERC721:
              case EVMSmartContractType.ERC1155:
                label = chrome.i18n.getMessage(
                  'evm_history_operation_mintNFTs',
                  [event.tokenName, event.tokenID],
                );
                pageTitle = 'evm_mint';
                break;
            }
          }
          case 'mintBatch': {
            // only 1155
            //TODO need to find a transaction to test this
            label = chrome.i18n.getMessage(
              'evm_history_operation_mint_batch',
              [],
            );
            break;
          }
          case 'safeMint': {
            // only 721
            label = chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
              event.tokenName,
              event.tokenID,
            ]);
            pageTitle = 'evm_mint';
            break;
          }

          default: {
            label = chrome.i18n.getMessage(
              'evm_history_operation_generic_smart_contract_messages',
              [
                functionName,
                event.tokenName,
                EvmFormatUtils.formatAddress(event.contractAddress),
              ],
            );
            pageTitle = 'evm_history_smart_contract';
            break;
          }
        }

        const details: EvmUserHistoryItemDetail[] = [];
        details.push({
          label: 'evm_operation_smart_contract_address',
          value: event.contractAddress,
          type: EvmUserHistoryItemDetailType.ADDRESS,
        });

        historyItem = {
          ...historyItem,
          type: EvmUserHistoryItemType.SMART_CONTRACT,
          pageTitle: pageTitle,
          label: label,
          detailFields: details,
        };
      } else if (
        event.to &&
        event.to.length > 0 &&
        event.input &&
        event.input.replace('0x', '').length > 0 &&
        event.input.replace(ethers.ZeroHash, '').length > 0
      ) {
        let decodedData;
        // Smart contract (parse transaction)
        try {
          historyItem = {
            ...historyItem,
            type: EvmUserHistoryItemType.SMART_CONTRACT,
          };
          decodedData = await EvmTransactionParserUtils.parseData(
            event.input,
            chain,
          );

          const specificData = await getSpecificData(
            chain,
            event.contractAddress.length > 0
              ? event.contractAddress.toLowerCase()
              : event.to.toLowerCase(),
            event.from.toLowerCase(),
            walletAddress.toLowerCase(),
            decodedData,
            allTokensMetadata,
            event,
            evmSettings,
          );

          if (!specificData) return;

          historyItem.label = specificData.label;
          historyItem.pageTitle = specificData.pageTitle;
          historyItem.receiverAddress = specificData.receiverAddress;
          historyItem.detailFields = specificData.detailFields;
          historyItem.tokenInfo = specificData.tokenInfo;
        } catch (err) {
          console.log(event);
          Logger.error(err as string);
          const defaultLabel =
            event.from.toLowerCase() === walletAddress.toLowerCase()
              ? 'evm_history_default_out_smart_contract_operation'
              : 'evm_history_default_in_smart_contract_operation';

          historyItem.label = chrome.i18n.getMessage(defaultLabel);
          historyItem.pageTitle = defaultLabel;
          // history.events.push(historyItem);
        }
      } else if (
        (await EvmAddressesUtils.getAddressType(event.to, chain)) ===
        EvmAddressType.WALLET_ADDRESS
      ) {
        // Normal transaction
        historyItem = await getNativeTransferData(
          event,
          chain,
          walletAddress,
          allTokensMetadata,
          historyItem,
        );
      } else {
        console.log('no match', event);
        Logger.error(`${event.hash} match no condition`);
        const defaultLabel =
          event.from.toLowerCase() === walletAddress.toLowerCase()
            ? 'evm_history_default_out_smart_contract_operation'
            : 'evm_history_default_in_smart_contract_operation';

        historyItem.label = chrome.i18n.getMessage(defaultLabel);
        historyItem.pageTitle = defaultLabel;
      }
      break;
    }

    default:
      break;
  }

  return historyItem;
};

const getNativeTransferData = async (
  event: any,
  chain: EvmChain,
  walletAddress: string,
  allTokensMetadata: EvmSmartContractInfo[],
  historyItem: EvmUserHistoryItem,
) => {
  const mainToken = allTokensMetadata.find(
    (t) => t.type === EVMSmartContractType.NATIVE,
  );
  // native event
  const amount = EvmFormatUtils.etherToWei(Number(event.value)).toString();
  const amountS = FormatUtils.withCommas(amount, 18, true);

  const addressDetails = await EvmAddressesUtils.getAddressDetails(
    event.from.toLowerCase() === walletAddress.toLowerCase()
      ? event.to
      : event.from,
    chain.chainId,
  );

  if (
    event.to.toLowerCase() === walletAddress.toLowerCase() &&
    Number(amount) === 0 &&
    (await EvmAddressesUtils.isPotentialSpoofing(event.from))
  ) {
    historyItem.warningMessage = chrome.i18n.getMessage(
      'evm_history_warning_potential_zero_amount_scam',
    );
  }

  const details: EvmUserHistoryItemDetail[] = [];
  details.push({
    label: 'popup_html_evm_transaction_info_from',
    value: event.from,
    type: EvmUserHistoryItemDetailType.ADDRESS,
  });
  details.push({
    label: 'popup_html_evm_transaction_info_to',
    value: event.to,
    type: EvmUserHistoryItemDetailType.ADDRESS,
  });
  details.push({
    label: 'popup_html_transfer_amount',
    value: `${amountS} ${mainToken!.symbol.toString()}`,
    type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
  });

  historyItem = {
    ...historyItem,
    type:
      event.from.toLowerCase() === walletAddress.toLowerCase()
        ? EvmUserHistoryItemType.TRANSFER_OUT
        : EvmUserHistoryItemType.TRANSFER_IN,
    from: event.from,
    to: event.to,
    amount: amount,
    isCanceled: Number(event.value) === 0,
    label: chrome.i18n.getMessage(
      event.from.toLowerCase() === walletAddress.toLowerCase()
        ? 'popup_html_evm_history_transfer_out'
        : 'popup_html_evm_history_transfer_in',
      [
        amountS,
        mainToken!.symbol,
        addressDetails.label ?? addressDetails.formattedAddress,
      ],
    ),
    detailFields: details,
    pageTitle: 'popup_html_transfer_funds',
    tokenInfo: mainToken,
  } as EvmTokenTransferInHistoryItem | EvmTokenTransferOutHistoryItem;
  return historyItem;
};

const getSpecificData = async (
  chain: EvmChain,
  contractAddress: string,
  broadcaster: string,
  walletAddress: string,
  decodedData: EvmTransactionDecodedData | undefined,
  metadata: EvmSmartContractInfo[],
  event: any,
  evmSettings?: EvmSettings,
): Promise<EvmHistoryItemSpecificData | undefined> => {
  const details: EvmUserHistoryItemDetail[] = [];

  const defaultLabel =
    broadcaster.toLowerCase() === walletAddress.toLowerCase()
      ? 'evm_history_default_out_smart_contract_operation'
      : 'evm_history_default_in_smart_contract_operation';

  let result: EvmHistoryItemSpecificData = {
    label: chrome.i18n.getMessage(defaultLabel),
    pageTitle: defaultLabel,
    detailFields: details,
  };
  const tokenMetadata = metadata.find(
    (md) =>
      md.type !== EVMSmartContractType.NATIVE &&
      md.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
  );

  let name;
  let symbol;

  if (tokenMetadata) {
    if (
      evmSettings &&
      tokenMetadata.type !== EVMSmartContractType.NATIVE &&
      ((tokenMetadata.possibleSpam &&
        !evmSettings.smartContracts.displayPossibleSpam) ||
        (!tokenMetadata.verifiedContract &&
          !evmSettings.smartContracts.displayNonVerifiedContracts))
    ) {
      Logger.info('Non displayed because of settings');
      return;
    }

    name = tokenMetadata.name ?? tokenMetadata.symbol;
    symbol = tokenMetadata.symbol;
  } else {
    let abi;
    switch (chain.blockExplorerApi?.type) {
      case BlockExplorerType.BLOCKSCOUT:
        abi = await BlockscoutApi.getAbi(chain as EvmChain, contractAddress);
        break;
      case BlockExplorerType.AVALANCHE_SCAN: {
        abi = await AvalancheApi.getAbi(chain as EvmChain, contractAddress);
        break;
      }
    }

    if (abi) {
      try {
        const contract = new ethers.Contract(contractAddress, JSON.parse(abi));
        [name, symbol] = await Promise.all([
          contract.name(),
          contract.symbol(),
        ]);
      } catch (err) {
        name = EvmFormatUtils.formatAddress(contractAddress);
        symbol = 'No symbol';
      }
    } else {
      name = EvmFormatUtils.formatAddress(contractAddress);
      symbol = 'NO symbol 2';
    }
  }

  if (decodedData) {
    switch (decodedData.operationName) {
      case 'safeTransferFrom': {
        const from = decodedData.inputs[0].value.toLowerCase();
        const to = decodedData.inputs[1].value.toLowerCase();

        const fromDetails = await EvmAddressesUtils.getAddressDetails(
          from,
          chain.chainId,
        );
        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        if (decodedData.inputs.length === 5) {
          if (to === walletAddress)
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc1155_in',
                [
                  decodedData.inputs[3].value,
                  name,
                  decodedData.inputs[2].value,
                  fromDetails.label ?? fromDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              receiverAddress: walletAddress,
              detailFields: [
                {
                  label: `${decodedData.inputs[3].value} ${name}#${Number(
                    decodedData.inputs[2].value,
                  )}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          else {
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc1155_out',
                [
                  decodedData.inputs[3].value,
                  name,
                  decodedData.inputs[2].value,
                  toDetails.label ?? toDetails.formattedAddress,
                  ,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${decodedData.inputs[3].value} ${name}#${Number(
                    decodedData.inputs[2].value,
                  )}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          }
        } else if (decodedData.inputs.length === 3) {
          if (to === walletAddress)
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc721_in',
                [
                  name,
                  decodedData.inputs[2].value,
                  fromDetails.label ?? fromDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${name}#${Number(decodedData.inputs[2].value)}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          else {
            result = {
              label: chrome.i18n.getMessage(
                'evm_history_operation_safe_transfer_from_erc721_out',
                [
                  name,
                  decodedData.inputs[2].value,
                  toDetails.label ?? toDetails.formattedAddress,
                ],
              ),
              pageTitle: 'evm_transfer',
              detailFields: [
                {
                  label: `${name}#${Number(decodedData.inputs[2].value)}`,
                  value: decodedData.inputs[2].value,
                  type: EvmUserHistoryItemDetailType.IMAGE,
                },
                {
                  label: 'popup_html_evm_transaction_info_from',
                  value: from,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
                {
                  label: 'popup_html_evm_transaction_info_to',
                  value: to,
                  type: EvmUserHistoryItemDetailType.ADDRESS,
                },
              ],
            };
          }
        }
        break;
      }
      case 'transfer': {
        const to = decodedData.inputs[0].value.toLowerCase();

        const isTransferIn = to === walletAddress;
        const amount = Number(decodedData.inputs[1].value) / 1000000;

        const broadcasterDetails = await EvmAddressesUtils.getAddressDetails(
          broadcaster,
          chain.chainId,
        );
        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        result = {
          label: chrome.i18n.getMessage(
            isTransferIn
              ? 'evm_history_operation_transfer_in'
              : 'evm_history_operation_transfer_out',
            [
              amount,
              symbol,
              isTransferIn
                ? broadcasterDetails.label ??
                  broadcasterDetails.formattedAddress
                : toDetails.label ?? toDetails.formattedAddress,
            ],
          ),
          pageTitle: 'evm_transfer',
          detailFields: [
            {
              label: 'popup_html_transfer_amount',
              value: `${amount.toString()} ${symbol}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            },
            {
              label: 'popup_html_evm_transaction_info_from',
              value: broadcaster,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
            {
              label: 'popup_html_evm_transaction_info_to',
              value: to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
        break;
      }
      case 'transferFrom': {
        const from = decodedData.inputs[0].value.toLowerCase();
        const to = decodedData.inputs[1].value.toLowerCase();

        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );
        const fromDetails = await EvmAddressesUtils.getAddressDetails(
          from,
          chain.chainId,
        );

        const isTransferIn = to === walletAddress;
        const amount = Number(decodedData.inputs[2].value) / 1000000;

        result = {
          label: chrome.i18n.getMessage(
            isTransferIn
              ? 'evm_history_operation_transfer_in'
              : 'evm_history_operation_transfer_out',
            [
              amount,
              symbol,
              isTransferIn
                ? fromDetails.label ?? fromDetails.formattedAddress
                : toDetails.label ?? toDetails.formattedAddress,
            ],
          ),
          pageTitle: 'evm_transfer',
          detailFields: [
            {
              label: 'popup_html_transfer_amount',
              value: `${amount.toString()} ${symbol}`,
              type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
            },
            {
              label: 'popup_html_evm_transaction_info_from',
              value: from,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
            {
              label: 'popup_html_evm_transaction_info_to',
              value: to,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
        break;
      }
      case 'approve': {
        const to = decodedData.inputs[0].value;

        const toDetails = await EvmAddressesUtils.getAddressDetails(
          to,
          chain.chainId,
        );

        const amount = Number(decodedData.inputs[1].value) / 1000000;
        if (tokenMetadata?.type === EVMSmartContractType.ERC20) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc20',
              [toDetails.label ?? toDetails.formattedAddress, amount, symbol],
            ),
            pageTitle: 'evm_approval',
            detailFields: [
              {
                label: 'popup_html_transfer_amount',
                value: `${amount.toString()} ${symbol}`,
                type: EvmUserHistoryItemDetailType.TOKEN_AMOUNT,
              },
              {
                label: 'popup_html_evm_transaction_info_from',
                value: broadcaster,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              },
              {
                label: 'popup_html_evm_transaction_info_to',
                value: to,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              },
            ],
          };
        } else if (tokenMetadata?.type === EVMSmartContractType.ERC721) {
          result = {
            label: chrome.i18n.getMessage(
              'evm_history_operation_approve_out_erc721',
              [
                toDetails.label ?? toDetails.formattedAddress,
                name,
                decodedData.inputs[1].value,
              ],
            ),
            pageTitle: 'evm_approval',
            detailFields: [
              {
                label: `${name}#${Number(decodedData.inputs[1].value)}`,
                value: decodedData.inputs[1].value,
                type: EvmUserHistoryItemDetailType.IMAGE,
              },
              {
                label: 'popup_html_evm_transaction_info_from',
                value: broadcaster,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              },
              {
                label: 'popup_html_evm_transaction_info_to',
                value: to,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              },
            ],
          };
        }
        break;
      }
      case 'mintBatch': {
        const details = [];
        for (let i = 0; i < decodedData.inputs[1].value.length; i++) {
          details.push({
            label: `${decodedData.inputs[2].value[i]} ${name}#${Number(
              decodedData.inputs[1].value[i],
            )}`,
            value: decodedData.inputs[1].value[i],
            type: EvmUserHistoryItemDetailType.IMAGE,
          });
        }

        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mint_batch', [
            decodedData.inputs[1].value.length,
            name,
          ]),
          pageTitle: 'evm_mint_batch',
          detailFields: [
            ...details,
            {
              label: 'popup_html_evm_transaction_info_from',
              value: broadcaster,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            },
          ],
        };
        break;
      }

      case 'mintNFTs': {
        result = {
          label: chrome.i18n.getMessage('evm_history_operation_mintNFTs', [
            name,
            decodedData.inputs[0].value,
          ]),
          pageTitle: 'evm_mint',
          detailFields: [
            {
              label: `${name}#${Number(decodedData.inputs[0].value)}`,
              value: decodedData.inputs[0].value,
              type: EvmUserHistoryItemDetailType.IMAGE,
            },
          ],
        };
        break;
      }
      default: {
        result = {
          label: chrome.i18n.getMessage(
            'evm_history_operation_generic_smart_contract_messages',
            [
              decodedData.operationName,
              name,
              EvmFormatUtils.formatAddress(contractAddress),
            ],
          ),
          pageTitle: 'evm_broadcast',
          detailFields: [],
        };
        break;
      }
    }
  }

  result.detailFields.push({
    label: 'evm_history_smart_contract',
    value: contractAddress,
    type: EvmUserHistoryItemDetailType.ADDRESS,
  });

  result.tokenInfo = tokenMetadata;
  return result;
};

const getCommonHistoryItem = (e: any) => {
  return {
    blockNumber: e.blockNumber,
    transactionHash: e.hash,
    transactionIndex: e.transactionIndex,
    nonce: Number(e.nonce),
    timestamp: e.timeStamp * 1000,
    type: EvmUserHistoryItemType.BASE_TRANSACTION,
  };
};

export const EvmTokensHistoryParserUtils = {
  parseEvent,
};

interface EvmHistoryItemSpecificData {
  label: string;
  pageTitle: string;
  receiverAddress?: string;
  detailFields: EvmUserHistoryItemDetail[];
  tokenInfo?: EvmSmartContractInfo;
}
