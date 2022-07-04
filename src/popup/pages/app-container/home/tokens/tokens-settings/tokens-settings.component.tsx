import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
} from '@interfaces/hive-engine-rpc.interface';
import { Token } from '@interfaces/tokens.interface';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { loadTokens } from '@popup/actions/token.actions';
import { Icons } from '@popup/icons.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import ArrayUtils from 'src/utils/array.utils';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import * as ValidUrl from 'valid-url';
import './tokens-settings.component.scss';

interface SelectOption {
  label: string;
  value: string;
  isDefault: boolean;
  setAsActive: (option: SelectOption) => void;
  deleteElement: (option: SelectOption, event: any) => void;
}

const TokensSettings = ({
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
}: PropsFromRedux) => {
  const [selectedRpc, setSelectedRpc] = useState(DefaultHiveEngineRpcs[0]);
  const [selectedAccountHistoryApi, setSelectedAccountHistoryApi] = useState(
    DefaultAccountHistoryApis[0],
  );
  const [isNewAccountHistoryPanelOpened, setIsNewAccountHistoryPanelOpened] =
    useState(false);
  const [newAccountHistory, setNewAccountHistory] = useState('');
  const [isNewRpcPanelOpened, setIsNewRpcPanelOpened] = useState(false);
  const [newRpc, setNewRpc] = useState('');

  const [rpcOptions, setRpcOptions] = useState<SelectOption[]>([]);
  const [accountHistoryApiOptions, setAccountHistoryApiOptions] = useState<
    SelectOption[]
  >([]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    console.log(rpcOptions, accountHistoryApiOptions);
  }, [rpcOptions, accountHistoryApiOptions]);

  const init = async () => {
    const customRpcs = await HiveEngineConfigUtils.getCustomRpcs();

    const rpcOpts = ArrayUtils.mergeWithoutDuplicate(
      customRpcs,
      DefaultHiveEngineRpcs,
    ).map((rpc) => {
      return {
        label: rpc.replace('https://', '').split('/')[0],
        value: rpc,
        isDefault: HiveEngineConfigUtils.isRpcDefault(rpc),
        setAsActive: setRpcAsActive,
        deleteElement: deleteRpc,
      };
    });
    setRpcOptions(rpcOpts);

    const customAccountHistoryApi =
      await HiveEngineConfigUtils.getCustomAccountHistoryApi();
    const accountHistoryApiOpts = ArrayUtils.mergeWithoutDuplicate(
      customAccountHistoryApi,
      DefaultAccountHistoryApis,
    ).map((api) => {
      return {
        label: api.replace('https://', '').split('/')[0],
        value: api,
        isDefault: HiveEngineConfigUtils.isAccountHistoryApiDefault(api),
        setAsActive: setAccountHistoryApiAsActive,
        deleteElement: deleteAccountHistoryApi,
      };
    });

    setAccountHistoryApiOptions(accountHistoryApiOpts);
  };

  const createActiveValue = (str: string) => {
    return {
      label: str.replace('https://', '').split('/')[0],
      value: str,
      isDefault: false,
      setAsActive: (option: SelectOption) => {},
      deleteElement: (option: SelectOption, event: any) => {},
    };
  };

  const deleteAccountHistoryApi = async (option: SelectOption, event: any) => {
    event.preventDefault();
    event.stopPropagation();
    await HiveEngineConfigUtils.deleteCustomAccountHistoryApi(option.value);
    init();
  };
  const deleteRpc = async (option: SelectOption, event: any) => {
    event.preventDefault();
    event.stopPropagation();
    await HiveEngineConfigUtils.deleteCustomRpc(option.value);
    init();
  };

  const setRpcAsActive = (option: SelectOption) => {
    setSelectedRpc(option.value);
  };
  const setAccountHistoryApiAsActive = (option: SelectOption) => {
    setSelectedAccountHistoryApi(option.value);
  };

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_tokens_settings',
      isBackButtonEnabled: true,
    });
  }, []);

  const customLabelRender = (selectProps: SelectRenderer<SelectOption>) => {
    return (
      <div
        className="selected-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {selectProps.props.values[0].label}
      </div>
    );
  };
  const customItemRender = (selectProps: SelectItemRenderer<SelectOption>) => {
    return (
      <div
        className={`select-item ${
          selectProps.item.label === selectProps.props.values[0]?.label
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          selectProps.item.setAsActive(selectProps.item);
          selectProps.methods.dropDown('close');
        }}>
        <div className="rpc-name">{selectProps.item.label}</div>
        {!selectProps.item.isDefault && (
          <img
            src="/assets/images/clear.png"
            className="erase-button"
            onClick={($event) => {
              selectProps.item.deleteElement(selectProps.item, $event);
              selectProps.methods.dropDown('close');
            }}
          />
        )}
      </div>
    );
  };

  const saveAccountHistory = async () => {
    if (ValidUrl.isWebUri(newAccountHistory)) {
      setSuccessMessage('html_popup_new_account_history_save_success');
      await HiveEngineConfigUtils.addCustomAccountHistoryApi(newAccountHistory);
      setNewAccountHistory('');
      setIsNewAccountHistoryPanelOpened(false);
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };
  const saveRpc = async () => {
    if (ValidUrl.isWebUri(newRpc)) {
      setSuccessMessage('html_popup_new_rpc_save_success');
      await HiveEngineConfigUtils.addCustomRpc(newRpc);
      setNewRpc('');
      setIsNewRpcPanelOpened(false);
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };

  return (
    <div className="tokens-settings">
      <div className="hive-engine-rpc-panel">
        <div className="select-title">Hive-Engine RPC node</div>
        <div className="select-panel">
          <Select
            values={[createActiveValue(selectedRpc)]}
            options={rpcOptions}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-hive-engine-rpc-node-select"
          />
          <Icon
            name={Icons.ADD_CIRCLE}
            type={IconType.OUTLINED}
            onClick={() => setIsNewRpcPanelOpened(true)}
          />
        </div>
        {isNewRpcPanelOpened && (
          <div className="new-account-history-panel new-item-panel">
            <InputComponent
              onChange={setNewRpc}
              value={newRpc}
              label="html_popup_new_rpc"
              placeholder="html_popup_new_rpc"
              type={InputType.TEXT}
            />
            <Icon
              name={Icons.SAVE}
              type={IconType.OUTLINED}
              onClick={() => saveRpc()}
            />
          </div>
        )}
      </div>
      <div className="hive-engine-account-history-panel">
        <div className="select-title">Hive-Engine AccountHistory API</div>
        <div className="select-panel">
          <Select
            values={[
              createActiveValue(selectedAccountHistoryApi) as SelectOption,
            ]}
            options={accountHistoryApiOptions}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-account-history-api-select"
          />
          <Icon
            name={Icons.ADD_CIRCLE}
            type={IconType.OUTLINED}
            onClick={() => setIsNewAccountHistoryPanelOpened(true)}
          />
        </div>
        {isNewAccountHistoryPanelOpened && (
          <div className="new-account-history-panel new-item-panel">
            <InputComponent
              onChange={setNewAccountHistory}
              value={newAccountHistory}
              label="html_popup_new_account_history"
              placeholder="html_popup_new_account_history"
              type={InputType.TEXT}
            />
            <Icon
              name={Icons.SAVE}
              type={IconType.OUTLINED}
              onClick={() => saveAccountHistory()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    tokens: state.tokens as Token[],
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  loadTokens,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensSettingsComponent = connector(TokensSettings);
