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
import {
  EvmTransactionType,
  ProviderTransactionData,
} from '@popup/evm/interfaces/evm-transactions.interface';
import { GasFeeEstimationBase } from '@popup/evm/interfaces/gas-fee.interface';
import { EvmNftCollectionListItem } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { ERC1155Abi, ERC721Abi } from '@popup/evm/reference-data/abi.data';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { EthersUtils } from '@popup/evm/utils/ethers.utils';
import { EvmAddressesUtils } from '@popup/evm/utils/evm-addresses.utils';
import { EvmFormatUtils } from '@popup/evm/utils/evm-format.utils';
import { EvmTransactionParserUtils } from '@popup/evm/utils/evm-transaction-parser.utils';
import { EvmTransactionsUtils } from '@popup/evm/utils/evm-transactions.utils';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/multichain/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/multichain/actions/message.actions';
import { navigateToWithParams } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ethers, Wallet } from 'ethers';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { FormUtils } from 'src/utils/form.utils';
import Logger from 'src/utils/logger.utils';

interface EvmNftTransferForm {
  receiverAddress: string;
  amount: number;
  selectedToken: EvmSmartContractInfo;
  nftId: string;
}

const transferFormRules = FormUtils.createRules<EvmNftTransferForm>({
  receiverAddress: Joi.string().required(),
  amount: Joi.number().required().positive().max(Joi.ref('$balance')),
  selectedToken: Joi.object().required(),
});

const EvmNftTransfer = ({
  collectionItem,
  formParams,
  chain,
  localAccounts,
  activeAccount,
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  setSuccessMessage,
  setErrorMessage,
  navigateToWithParams,
}: PropsFromRedux) => {
  const { control, handleSubmit, setValue, watch } =
    useForm<EvmNftTransferForm>({
      defaultValues: {
        receiverAddress: formParams.receiverAddress
          ? formParams.receiverUsername
          : '',
        selectedToken: collectionItem.collection.tokenInfo,
        amount: EVMSmartContractType.ERC1155 ? 0 : 1,
        nftId: collectionItem.item.id,
      },
      resolver: (values, context, options) => {
        const balance =
          collectionItem.collection.tokenInfo.type ===
          EVMSmartContractType.ERC1155
            ? (collectionItem.item as EvmErc1155TokenCollectionItem).balance
            : 1;
        const resolver = joiResolver<Joi.ObjectSchema<EvmNftTransferForm>>(
          transferFormRules,
          { context: { balance: balance }, errors: { render: true } },
        );
        return resolver(values, { balance: balance }, options);
      },
    });

  const [autocompleteValues, setAutocompleteValues] =
    useState<AutoCompleteValues>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_nft_transfer',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    setAutocompleteValues(
      await EvmAddressesUtils.getWhiteListAutocomplete(chain, localAccounts),
    );
  };

  const handleClickOnSend = async (form: EvmNftTransferForm) => {
    // encode data
    const transactionInfo =
      await EvmTransactionParserUtils.verifyTransactionInformation();

    let fields = [
      {
        label: '',
        value: <img src={collectionItem.item.metadata.image} />,
        valueClassName: 'nft-image',
      },
      {
        label: 'evm_operation_smart_contract_address',
        value: EvmFormatUtils.formatAddress(
          collectionItem.collection.tokenInfo.address,
        ),
      },
      {
        label: 'popup_html_transfer_from',
        value: (
          <EvmAddressComponent
            address={activeAccount.address}
            chainId={chain.chainId}
          />
        ),
      },
      {
        label: 'popup_html_transfer_to',
        value: (
          <EvmAddressComponent
            address={form.receiverAddress}
            chainId={chain.chainId}
          />
        ),
        warnings: await EvmTransactionParserUtils.getAddressWarning(
          form.receiverAddress,
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
      type: EvmTransactionType.EIP_1559,
      to: watch('selectedToken.address'),
      data: await encodeTransferData(
        form.selectedToken as
          | EvmSmartContractInfoErc1155
          | EvmSmartContractInfoErc721,
        activeAccount,
        form.receiverAddress,
        form.amount,
        form.nftId,
      ),
      value: '0x0',
    };
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      method: null,
      message: chrome.i18n.getMessage('popup_html_transfer_confirm_text'),
      fields: fields,
      title: 'evm_nft_transfer',
      formParams: watch(),
      hasGasFee: true,
      tokenInfo: form.selectedToken,
      receiverAddress: form.receiverAddress,
      amount: form.amount,
      wallet: activeAccount.wallet,
      transactionData: transactionData,
      afterConfirmAction: async (gasFee: GasFeeEstimationBase) => {
        addToLoadingList('evm_nft_transfer');
        try {
          const transactionResponse = await EvmTransactionsUtils.send(
            activeAccount.wallet,
            {
              value: transactionData.value,
              to: transactionData.to,
              type: Number(EvmTransactionType.EIP_1559),
              data: transactionData.data,
            },
            gasFee,
            chain.chainId,
          );

          navigateToWithParams(EvmScreen.EVM_TRANSFER_RESULT_PAGE, {
            pageTitle: 'evm_nft_transfer',
            transactionResponse: transactionResponse,
            detailFields: [
              {
                value: form.nftId,
                type: EvmUserHistoryItemDetailType.IMAGE,
              },
              {
                label: 'popup_html_transfer_from',
                value: activeAccount.address,
                type: EvmUserHistoryItemDetailType.ADDRESS,
              } as EvmUserHistoryItemDetail,
              {
                label: 'popup_html_transfer_to',
                value: form.receiverAddress,
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
            ],
            tokenInfo: form.selectedToken,
            transactionData: transactionData,
            gasFee: gasFee,
          });
          setSuccessMessage('evm_transaction_broadcasted');
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
    const provider = await EthersUtils.getProvider(chain);
    const connectedWallet = new Wallet(
      activeAccount.wallet.signingKey,
      provider,
    );
    const contract = new ethers.Contract(
      tokenInfo.address!,
      tokenInfo.type === EVMSmartContractType.ERC1155 ? ERC1155Abi : ERC721Abi,
      connectedWallet,
    );

    if (tokenInfo.type === EVMSmartContractType.ERC1155) {
      return contract.interface.encodeFunctionData('safeTransferFrom', [
        activeAccount.address,
        receiverAddress,
        tokenId,
        amount,
        '0x',
      ]);
    } else if (tokenInfo.type === EVMSmartContractType.ERC721) {
      return contract.interface.encodeFunctionData('safeTransferFrom', [
        activeAccount.address,
        receiverAddress,
        tokenId,
      ]);
    } else {
      throw new Error('Invalid token type');
    }
  };

  return (
    <div
      className="evm-nft-transfer-funds-page"
      data-testid={`${Screen.EVM_NFT_TRANSFER_PAGE}-page`}>
      <FormContainer onSubmit={handleClickOnSend}>
        <div className="form-fields">
          <EvmNftDetails
            collection={collectionItem.collection}
            nft={collectionItem.item}
            expanded={true}
            nftSize="small"
          />
          <FormInputComponent
            name="receiverAddress"
            control={control}
            type={InputType.TEXT}
            logo={SVGIcons.INPUT_AT}
            placeholder="evm_nft_transfer_address"
            label="evm_nft_transfer_address"
            autocompleteValues={autocompleteValues}
          />

          {collectionItem.collection.tokenInfo.type ===
            EVMSmartContractType.ERC1155 && (
            <FormInputComponent
              name="amount"
              control={control}
              type={InputType.TEXT}
              placeholder="popup_html_amount"
              label="popup_html_amount"
            />
          )}
        </div>
        <ButtonComponent
          onClick={handleSubmit(handleClickOnSend)}
          label={'popup_html_send_transfer'}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.evm.activeAccount,
    collectionItem: state.navigation.params
      .collectionItem as EvmNftCollectionListItem,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    localAccounts: state.evm.accounts,
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  addToLoadingList,
  removeFromLoadingList,
  setSuccessMessage,
  setErrorMessage,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNFTTransferComponent = connector(EvmNftTransfer);
