import { EVMConfirmationPageParams } from '@common-ui/confirmation-page/confirmation-page.interface';
import { EvmAddressComponent } from '@common-ui/evm/evm-address/evm-address.component';
import { joiResolver } from '@hookform/resolvers/joi';
import { AutoCompleteValues } from '@interfaces/autocomplete.interface';
import { Screen } from '@interfaces/screen.interface';
import {
  EvmActiveAccount,
  EvmErc1155TokenCollectionItem,
} from '@popup/evm/interfaces/active-account.interface';
import {
  EvmUserHistoryItemDetail,
  EvmUserHistoryItemDetailType,
} from '@popup/evm/interfaces/evm-tokens-history.interface';
import {
  EvmSmartContractInfo,
  EvmSmartContractInfoErc1155,
  EvmSmartContractInfoErc721,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { ProviderTransactionData } from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import type { EvmNftCollectionListItem } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { ERC1155Abi, ERC721Abi } from '@popup/evm/reference-data/abi.data';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmNftDisplayUtils } from '@popup/evm/utils/evm-nft-display.utils';
import { EvmLedgerUtils } from '@popup/evm/utils/evm-ledger.utils';
import { EvmTransactionDisplayUtils } from '@popup/evm/utils/evm-transaction-display.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import { setErrorMessage } from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ethers } from 'ethers';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { EvmNftMedia } from 'src/common-ui/evm/nft-media/nft-media.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { FormUtils } from 'src/utils/form.utils';
import Logger from 'src/utils/logger.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
interface EvmNftTransferForm {
  receiverAddress: string;
  amount: number;
  selectedToken: EvmSmartContractInfo;
  nftId: string;
}

export interface EvmNftTransferFormParams {
  receiverAddress?: string;
  receiverUsername?: string;
  amount?: number;
  nftId?: string;
  selectedToken?: EvmSmartContractInfo;
}

interface EvmNftTransferOwnProps {
  collectionItem: EvmNftCollectionListItem;
  initialFormParams?: EvmNftTransferFormParams;
}

const transferFormRules = FormUtils.createRules<EvmNftTransferForm>({
  receiverAddress: Joi.string().required(),
  amount: Joi.number().required().max(Joi.ref('$balance')),
  selectedToken: Joi.object().required(),
});

const EvmNftTransferForm = ({
  collectionItem,
  initialFormParams,
  chain,
  localAccounts,
  activeAccount,
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  navigateToWithParams,
}: PropsFromRedux) => {
  const restoredReceiverAddress =
    initialFormParams?.receiverUsername ||
    initialFormParams?.receiverAddress ||
    '';
  const { control, handleSubmit, setValue, watch } =
    useForm<EvmNftTransferForm>({
      defaultValues: {
        receiverAddress: restoredReceiverAddress,
        selectedToken: collectionItem.collection.tokenInfo,
        amount: initialFormParams?.amount ?? 1,
        nftId: collectionItem.item.id,
      },
      resolver: (values, context, options) => {
        const resolver = joiResolver<Joi.ObjectSchema<EvmNftTransferForm>>(
          transferFormRules,
          { context: { balance: balance }, errors: { render: true } },
        );
        return resolver(values, { balance: balance }, options);
      },
    });

  const balance =
    collectionItem.collection.tokenInfo.type === EVMSmartContractType.ERC1155
      ? (collectionItem.item as EvmErc1155TokenCollectionItem).balance
      : 1;

  const [autocompleteValues, setAutocompleteValues] =
    useState<AutoCompleteValues>();

  const loadAutocomplete = async (isCancelled: () => boolean) => {
    const values = await EvmAddressesUtils.getWhiteListAutocomplete(
      chain,
      localAccounts,
      activeAccount.wallet.address,
    );

    if (isCancelled()) return;

    setAutocompleteValues(values);

    const enrichedValues =
      await EvmAddressesUtils.enrichWhiteListAutocomplete(values);

    if (isCancelled()) return;

    setAutocompleteValues(enrichedValues);
  };

  useEffect(() => {
    let cancelled = false;
    void loadAutocomplete(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [activeAccount, chain, localAccounts]);

  const handleClickOnSend = async (form: EvmNftTransferForm) => {
    const recipientValidation =
      await EvmAddressesUtils.validateTransferRecipient(
        form.receiverAddress,
        chain.chainId,
        localAccounts,
      );
    if (!recipientValidation.valid) {
      setErrorMessage(
        recipientValidation.messageKey,
        recipientValidation.messageParams ?? [],
      );
      return;
    }
    const receiverAddress = recipientValidation.address;

    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation({
        to: receiverAddress,
        tokenContract: collectionItem.collection.tokenInfo.contractAddress,
        chainId: chain.chainId,
        tokenType: collectionItem.collection.tokenInfo.type,
        nftTokenId: collectionItem.item.id,
      });

    let fields = [
      {
        label: 'evm_operation_smart_contract_address',
        value: (
          <EvmAddressComponent
            address={collectionItem.collection.tokenInfo.contractAddress}
            chainId={chain.chainId}
            forceFormattedAddress
            canCopy
            localAccounts={localAccounts}
          />
        ),
      },
      {
        label: 'popup_html_transfer_from',
        value: (
          <EvmAddressComponent
            address={activeAccount.address}
            chainId={chain.chainId}
            canCopy
            localAccounts={localAccounts}
          />
        ),
      },
      {
        label: 'popup_html_transfer_to',
        value: (
          <EvmAddressComponent
            address={receiverAddress}
            chainId={chain.chainId}
            canCopy
            localAccounts={localAccounts}
          />
        ),
        warnings: await EvmTransactionParserUtils.getAddressWarning(
          receiverAddress,
          chain.chainId,
          transactionInfo,
          localAccounts,
        ),
      },
      {
        label: 'evm_nft_token_id',
        value: (
          <div className="value-content-horizontal">
            <span>{form.nftId}</span>
          </div>
        ),
      },
      {
        label: 'popup_html_transfer_amount',
        value: (
          <div className="value-content-horizontal">
            <span>{form.amount}</span>
          </div>
        ),
      },
    ];

    let transactionData: ProviderTransactionData = {
      from: activeAccount.address,
      type: chain.defaultTransactionType,
      to: watch('selectedToken.contractAddress'),
      data: await encodeTransferData(
        form.selectedToken as
          | EvmSmartContractInfoErc1155
          | EvmSmartContractInfoErc721,
        activeAccount,
        receiverAddress,
        form.amount,
        form.nftId,
      ),
      value: '0x0',
    };
    const ledgerClearSigningWarning =
      EvmLedgerUtils.getClearSigningFallbackWarning(
        activeAccount.wallet,
        transactionData.data,
      );
    if (ledgerClearSigningWarning) {
      const smartContractField = fields.find(
        (field) => field.label === 'evm_operation_smart_contract_address',
      );
      if (smartContractField) {
        smartContractField.warnings = [
          ...(smartContractField.warnings ?? []),
          ledgerClearSigningWarning,
        ];
      }
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      message: I18nUtils.getMessage('popup_html_transfer_confirm_text'),
      fields: fields,
      title: 'evm_nft_transfer',
      formParams: watch(),
      hasGasFee: true,
      tokenInfo: form.selectedToken,
      receiverAddress,
      amount: form.amount,
      wallet: activeAccount.wallet,
      transactionData: transactionData,
      afterConfirmAction: async (gasFee: GasFeeEstimationBase) => {
        addToLoadingList('evm_nft_transfer');
        try {
          const detailFields = [
            {
              label:
                collectionItem.item.metadata.name ??
                `${collectionItem.collection.tokenInfo.name} #${form.nftId}`,
              value: form.nftId,
              type: EvmUserHistoryItemDetailType.IMAGE,
              imageUrl: collectionItem.item.metadata.image,
            },
            {
              label: 'popup_html_transfer_from',
              value: activeAccount.address,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            } as EvmUserHistoryItemDetail,
            {
              label: 'popup_html_transfer_to',
              value: receiverAddress,
              type: EvmUserHistoryItemDetailType.ADDRESS,
            } as EvmUserHistoryItemDetail,
            {
              label: 'evm_nft_token_id',
              value: form.nftId,
              type: EvmUserHistoryItemDetailType.BASE,
            } as EvmUserHistoryItemDetail,
            {
              label: 'popup_html_transfer_amount',
              value: form.amount.toString(),
              type: EvmUserHistoryItemDetailType.BASE,
            } as EvmUserHistoryItemDetail,
          ];
          const displayContext = {
            pageTitle: 'evm_nft_transfer',
            initialDisplayNfts: true,
            detailFields,
            tokenInfo: form.selectedToken,
            receiverAddress,
            amount: form.amount,
          };
          const transactionResponse = await EvmTransactionsUtils.send(
            activeAccount.wallet,
            {
              value: transactionData.value,
              to: transactionData.to,
              type: Number(transactionData.type),
              data: transactionData.data,
            },
            gasFee,
            chain.chainId,
            undefined,
            displayContext,
          );
          const pendingTransaction =
            await EvmTransactionsUtils.getPendingTransaction(
              transactionResponse.hash,
              chain.chainId,
            );

          navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
            ...EvmTransactionDisplayUtils.buildResultNavigationParams({
              transactionResponse,
              displayItem: pendingTransaction?.displayItem,
              gasFee,
              transactionData,
              context: displayContext,
            }),
          });
        } catch (error) {
          Logger.error('Error during transfer', error);
          setErrorMessage('popup_html_transfer_failed');
        } finally {
          removeFromLoadingList('evm_nft_transfer');
        }
      },
    } as EVMConfirmationPageParams);
  };

  const encodeTransferData = async (
    tokenInfo: EvmSmartContractInfoErc1155 | EvmSmartContractInfoErc721,
    activeAccount: EvmActiveAccount,
    receiverAddress: string,
    amount: number,
    tokenId: string,
  ) => {
    const contractInterface = new ethers.Interface(
      tokenInfo.type === EVMSmartContractType.ERC1155 ? ERC1155Abi : ERC721Abi,
    );

    if (tokenInfo.type === EVMSmartContractType.ERC1155) {
      return contractInterface.encodeFunctionData('safeTransferFrom', [
        activeAccount.address,
        receiverAddress,
        Number(tokenId),
        Number(amount),
        '0x',
      ]);
    } else if (tokenInfo.type === EVMSmartContractType.ERC721) {
      return contractInterface.encodeFunctionData(
        'safeTransferFrom(address,address,uint256)',
        [activeAccount.address, receiverAddress, Number(tokenId)],
      );
    } else {
      throw new Error('Invalid token type');
    }
  };

  const submitTransfer = () => {
    void handleSubmit(handleClickOnSend)();
  };

  const isErc1155 =
    collectionItem.collection.tokenInfo.type === EVMSmartContractType.ERC1155;
  const watchedAmount = watch('amount');
  const quantity = Number(watchedAmount) || 1;
  const maxQuantity = Math.max(1, balance);
  const setQuantity = (next: number) => {
    const clamped = Math.min(maxQuantity, Math.max(1, next));
    setValue('amount', clamped, { shouldValidate: true });
  };
  const displayName = EvmNftDisplayUtils.getNftDisplayName(
    collectionItem.item,
    collectionItem.collection.tokenInfo.name,
  );
  const collectionName = collectionItem.collection.tokenInfo.name?.trim();
  const standard = EvmNftDisplayUtils.formatNftStandard(
    collectionItem.collection.tokenInfo.type,
  );

  return (
    <div
      className="nft-send-form"
      data-testid="nft-send-form"
      onClick={(event) => event.stopPropagation()}>
      <div className="nft-send-summary">
        <EvmNftMedia
          className="nft-send-summary-media"
          src={collectionItem.item.metadata.image}
        />
        <div className="nft-send-summary-copy">
          <div className="nft-send-summary-name">{displayName}</div>
          {collectionName && (
            <div className="nft-send-summary-collection">{collectionName}</div>
          )}
          <div className="nft-send-summary-meta">
            {`#${collectionItem.item.id} · ${standard}`}
          </div>
        </div>
      </div>
      <FormInputComponent
        name="receiverAddress"
        control={control}
        type={InputType.TEXT}
        logo={SVGIcons.INPUT_AT}
        placeholder="evm_nft_recipient_placeholder"
        label="evm_nft_recipient"
        autocompleteValues={autocompleteValues}
        onEnterPress={submitTransfer}
      />

      {isErc1155 && (
        <div className="nft-quantity">
          <div className="label">{I18nUtils.getMessage('evm_nft_quantity')}</div>
          <div className="nft-quantity-stepper" data-testid="nft-quantity-stepper">
            <button
              type="button"
              className="nft-quantity-step"
              aria-label={I18nUtils.getMessage('evm_nft_quantity_decrease')}
              data-testid="nft-quantity-decrease"
              disabled={quantity <= 1}
              onClick={() => setQuantity(quantity - 1)}>
              −
            </button>
            <span className="nft-quantity-value" data-testid="nft-quantity-value">
              {quantity}
            </span>
            <button
              type="button"
              className="nft-quantity-step"
              aria-label={I18nUtils.getMessage('evm_nft_quantity_increase')}
              data-testid="nft-quantity-increase"
              disabled={quantity >= balance}
              onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
          <div className="nft-quantity-owned" data-testid="nft-quantity-owned">
            {I18nUtils.getMessage('evm_nft_you_own', [String(balance)])}
          </div>
        </div>
      )}
      <ButtonComponent
        onClick={submitTransfer}
        label="popup_html_continue"
        additionalClass="send-button"
        height="medium"
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  addToLoadingList,
  removeFromLoadingList,
  setErrorMessage,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector> & EvmNftTransferOwnProps;

export const EvmNftTransferFormComponent = connector(EvmNftTransferForm);
