import { HiveEngineConfigUtils } from '@hiveapp/utils/hive-engine-config.utils';
import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
} from '@interfaces/hive-engine-rpc.interface';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { Icons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import {
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
} from 'src/popup/hive/actions/hive-engine-config.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { navigateToWithParams } from 'src/popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { loadTokens } from 'src/popup/hive/actions/token.actions';
import { RootState } from 'src/popup/hive/store';
import ArrayUtils from 'src/utils/array.utils';
import * as ValidUrl from 'valid-url';
import './tokens-settings.component.scss';

interface SelectOption {
  panelType: string;
  label: string;
  value: string;
  isDefault: boolean;
  setAsActive: (option: SelectOption) => void;
  deleteElement: (option: SelectOption, event: any) => void;
}

const TokensSettings = ({
  activeAccountHistoryApi,
  activeHERpc,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
}: PropsFromRedux) => {
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

  const init = async () => {
    const customRpcs = await HiveEngineConfigUtils.getCustomRpcs();
    const rpcFullList = ArrayUtils.mergeWithoutDuplicate(
      customRpcs,
      DefaultHiveEngineRpcs,
    );
    const rpcOpts = rpcFullList.map((rpc) => {
      return {
        panelType: 'rpc',
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
    const accountHistoryApiFullList = ArrayUtils.mergeWithoutDuplicate(
      customAccountHistoryApi,
      DefaultAccountHistoryApis,
    );
    const accountHistoryApiOpts = accountHistoryApiFullList.map((api) => {
      return {
        panelType: 'account-history-api',
        label: api.replace('https://', '').split('/')[0],
        value: api,
        isDefault: HiveEngineConfigUtils.isAccountHistoryApiDefault(api),
        setAsActive: setAccountHistoryApiAsActive,
        deleteElement: deleteAccountHistoryApi,
      };
    });

    setAccountHistoryApiOptions(accountHistoryApiOpts);
  };

  const createActiveValue = (str: string, panelType: string) => {
    return {
      panelType: panelType,
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
    setHEActiveRpc(option.value);
  };
  const setAccountHistoryApiAsActive = (option: SelectOption) => {
    setHEActiveAccountHistoryApi(option.value);
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
        data-testid={`selected-panel-${selectProps.props.values[0].panelType}`}
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
        data-testid={`select-item-${selectProps.props.values[0].panelType}`}
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
        {!selectProps.item.isDefault &&
          selectProps.item.label !== selectProps.props.values[0]?.label && (
            <img
              data-testid={`erase-rpc-img-${selectProps.item.label}`}
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
    if (accountHistoryApiOptions.find((e) => e.value === newAccountHistory)) {
      setErrorMessage('html_popup_rpc_already_exist');
      return;
    }
    if (ValidUrl.isWebUri(newAccountHistory)) {
      setSuccessMessage('html_popup_new_account_history_save_success');
      await HiveEngineConfigUtils.addCustomAccountHistoryApi(newAccountHistory);
      setNewAccountHistory('');
      setIsNewAccountHistoryPanelOpened(false);
      init();
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };

  const saveRpc = async () => {
    if (rpcOptions.find((e) => e.value === newRpc)) {
      setErrorMessage('html_popup_rpc_already_exist');
      return;
    }
    if (ValidUrl.isWebUri(newRpc)) {
      setSuccessMessage('html_popup_new_rpc_save_success');
      await HiveEngineConfigUtils.addCustomRpc(newRpc);
      setNewRpc('');
      setIsNewRpcPanelOpened(false);
      init();
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };

  return (
    <div
      data-testid={`${Screen.TOKENS_SETTINGS}-page`}
      className="tokens-settings">
      <div className="hive-engine-rpc-panel">
        <div className="select-title">Hive-Engine RPC node</div>
        <div className="select-panel">
          <Select
            values={[createActiveValue(activeHERpc, 'rpc')]}
            options={rpcOptions}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-hive-engine-rpc-node-select"
          />
          <Icon
            dataTestId="icon-tokens-settings-add-rpc"
            name={Icons.ADD_CIRCLE}
            type={IconType.OUTLINED}
            onClick={() => setIsNewRpcPanelOpened(true)}
          />
        </div>
        {isNewRpcPanelOpened && (
          <div className="new-account-history-panel new-item-panel">
            <InputComponent
              dataTestId="input-text"
              onChange={setNewRpc}
              value={newRpc}
              label="html_popup_new_rpc"
              placeholder="html_popup_new_rpc"
              type={InputType.TEXT}
            />
            <Icon
              dataTestId="icon-tokens-settings-save-rpc"
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
              createActiveValue(
                activeAccountHistoryApi,
                'account-history',
              ) as SelectOption,
            ]}
            options={accountHistoryApiOptions}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-account-history-api-select"
          />
          <Icon
            dataTestId="icon-tokens-settings-add-account-history"
            name={Icons.ADD_CIRCLE}
            type={IconType.OUTLINED}
            onClick={() => setIsNewAccountHistoryPanelOpened(true)}
          />
        </div>
        {isNewAccountHistoryPanelOpened && (
          <div className="new-account-history-panel new-item-panel">
            <InputComponent
              dataTestId="input-text"
              onChange={setNewAccountHistory}
              value={newAccountHistory}
              label="html_popup_new_account_history"
              placeholder="html_popup_new_account_history"
              type={InputType.TEXT}
            />
            <Icon
              dataTestId="icon-tokens-settings-save-account-history"
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
    activeHERpc: state.hiveEngineConfig.rpc,
    activeAccountHistoryApi: state.hiveEngineConfig.accountHistoryApi,
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  loadTokens,
  setTitleContainerProperties,
  setErrorMessage,
  setSuccessMessage,
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensSettingsComponent = connector(TokensSettings);
