import { joiResolver } from '@hookform/resolvers/joi';
import { resetNav } from '@popup/multichain/actions/navigation.actions';
import {
  BlockExplorer,
  BlockExporerType,
  ChainType,
  EvmMainToken,
  HiveMainTokens,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import Joi from 'joi';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ConnectedProps, connect } from 'react-redux';
import { FormContainer } from 'src/common-ui/_containers/form-container/form-container.component';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxFormComponent } from 'src/common-ui/checkbox/checkbox/form-checkbox.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormInputComponent } from 'src/common-ui/input/form-input.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { FormUtils } from 'src/utils/form.utils';

interface NewChainForm {
  name: string;
  symbol: string;
  type: ChainType;
  logo: string;
  chainId: string;
  testnet: boolean;
  blockExplorer: BlockExplorer;
  mainToken?: EvmMainToken;
  mainTokens?: HiveMainTokens;
  rpc: MultichainRpc[];
}

const formRules = FormUtils.createRules<NewChainForm>({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  type: Joi.string().required(),
  logo: Joi.string().required(),
  chainId: Joi.string().required(),
  blockExplorer: Joi.object().required(),
});

const AddCustomChain = ({ resetNav }: PropsFromRedux) => {
  const handleClickOnSend = async (form: NewChainForm) => {
    await ChainUtils.addChainToSetupChains(form);
  };

  const { control, handleSubmit, setValue, watch } = useForm<NewChainForm>({
    defaultValues: {
      type: ChainType.EVM,
      name: '',
      blockExplorer: {
        url: '',
        type: BlockExporerType.ETHERSCAN,
      },
      chainId: '',
      logo: '',
      symbol: '',
      testnet: false,
      mainToken: '',
      mainTokens: {
        hive: 'TESTS',
        hbd: 'TBD',
        hp: 'TP',
      },
      rpc: [],
    },
    resolver: (values, context, options) => {
      const resolver = joiResolver<Joi.ObjectSchema<NewChainForm>>(formRules, {
        context: {},
        errors: { render: true },
      });
      return resolver(values, {}, options);
    },
  });

  return (
    <div className="add-custom-blockchain-page">
      <PageTitleComponent
        title="popup_html_add_custom_blockchain"
        isCloseButtonDisabled
        isBackButtonEnabled
        onBackAdditional={() => resetNav()}></PageTitleComponent>
      <FormContainer onSubmit={handleSubmit(handleClickOnSend)}>
        <div className="form-fields">
          <ComplexeCustomSelect
            label="popup_html_create_blockchain_chain_type"
            options={
              [
                { label: 'HIVE', value: ChainType.HIVE },
                { label: 'EVM', value: ChainType.EVM },
              ] as OptionItem[]
            }
            selectedItem={{
              value: watch('type'),
              label: watch('type'),
            }}
            setSelectedItem={(item) => setValue('type', item.value)}
          />
          <FormInputComponent
            name="name"
            control={control}
            dataTestId="input-name"
            type={InputType.TEXT}
            placeholder="popup_html_create_blockchain_name"
            label="popup_html_create_blockchain_name"
          />
          <FormInputComponent
            name="symbol"
            control={control}
            dataTestId="input-symbol"
            type={InputType.TEXT}
            placeholder="popup_html_create_blockchain_symbol"
            label="popup_html_create_blockchain_symbol"
          />
          <div className="logo-panel">
            <FormInputComponent
              name="logo"
              control={control}
              dataTestId="input-logo"
              type={InputType.TEXT}
              placeholder="popup_html_create_blockchain_logo"
              label="popup_html_create_blockchain_logo"
            />
            {watch('logo').length > 0 && <img src={watch('logo')} />}
          </div>
          <FormInputComponent
            name="chainId"
            control={control}
            dataTestId="input-chain-id"
            type={InputType.TEXT}
            placeholder="popup_html_create_blockchain_chain_id"
            label="popup_html_create_blockchain_chain_id"
          />
          <CheckboxFormComponent
            title="common_testnet"
            control={control}
            name="testnet"
          />
          <FormInputComponent
            name="blockExplorer"
            control={control}
            dataTestId="input-block-explorer"
            type={InputType.TEXT}
            placeholder="popup_html_create_blockchain_block_explorer"
            label="popup_html_create_blockchain_block_explorer"
          />
          {watch('type') === ChainType.EVM && (
            <FormInputComponent
              name="mainToken"
              control={control}
              dataTestId="input-token"
              type={InputType.TEXT}
              placeholder="popup_html_create_blockchain_main_token"
              label="popup_html_create_blockchain_main_token"
            />
          )}
          {watch('type') === ChainType.HIVE && (
            <>
              <FormInputComponent
                name="mainTokens.hive"
                control={control}
                dataTestId="input-token-hive"
                type={InputType.TEXT}
                placeholder="popup_html_create_blockchain_token_hive"
                label="popup_html_create_blockchain_token_hive"
              />
              <FormInputComponent
                name="mainTokens.hbd"
                control={control}
                dataTestId="input-token-hbd"
                type={InputType.TEXT}
                placeholder="popup_html_create_blockchain_token_hbd"
                label="popup_html_create_blockchain_token_hbd"
              />
              <FormInputComponent
                name="mainTokens.hp"
                control={control}
                dataTestId="input-token-hp"
                type={InputType.TEXT}
                placeholder="popup_html_create_blockchain_token_hp"
                label="popup_html_create_blockchain_token_hp"
              />
            </>
          )}
        </div>
        <ButtonComponent
          dataTestId="send-form"
          onClick={handleSubmit(handleClickOnSend)}
          label={'popup_html_create_blockchain'}
        />
      </FormContainer>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  resetNav,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddCustomChainPage = connector(AddCustomChain);
