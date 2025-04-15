import { joiResolver } from '@hookform/resolvers/joi';
import { Screen } from '@interfaces/screen.interface';
import { EvmErc1155TokenCollectionItem } from '@popup/evm/interfaces/active-account.interface';
import {
  EvmSmartContractInfo,
  EVMSmartContractType,
} from '@popup/evm/interfaces/evm-tokens.interface';
import { EvmNftCollectionListItem } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-collection/evm-nft-collection.component';
import { EvmNftDetails } from '@popup/evm/pages/home/evm-nft-pages/evm-nft-details/evm-ntf-details.component';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { EvmChain } from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import Joi from 'joi';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { FormUtils } from 'src/utils/form.utils';

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
  setTitleContainerProperties,
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

  useEffect(() => {
    setTitleContainerProperties({
      title: 'evm_nft_transfer',
      isBackButtonEnabled: true,
    });
  }, []);

  const handleClickOnSend = async (form: EvmNftTransferForm) => {
    console.log('sending ', { form });
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmNFTTransferComponent = connector(EvmNftTransfer);
