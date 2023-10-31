import {
  DefaultAccountHistoryApis,
  DefaultHiveEngineRpcs,
} from '@interfaces/hive-engine-rpc.interface';
import {
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
} from '@popup/hive/actions/hive-engine-config.actions';
import { HiveEngineConfigUtils } from '@popup/hive/utils/hive-engine-config.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { SelectItemRenderer, SelectRenderer } from 'react-dropdown-select';
import { ConnectedProps, connect } from 'react-redux';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox/checkbox.component';
import { ComplexeCustomSelect } from 'src/common-ui/custom-select/custom-select.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { Rpc } from 'src/interfaces/rpc.interface';
import { setActiveRpc } from 'src/popup/hive/actions/active-rpc.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from 'src/popup/hive/actions/message.actions';
import { setTitleContainerProperties } from 'src/popup/hive/actions/title-container.actions';
import { RootState } from 'src/popup/hive/store';
import RpcUtils from 'src/popup/hive/utils/rpc.utils';
import ArrayUtils from 'src/utils/array.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import * as ValidUrl from 'valid-url';

interface RpcListItem {
  label: string;
  value: string;
  rpc: Rpc;
}

interface SelectOption {
  panelType: string;
  label: string;
  value: string;
  isDefault: boolean;
  setAsActive: (option: SelectOption) => void;
  deleteElement: (option: SelectOption, event: any) => void;
}

const RpcNodes = ({
  activeRpc,
  activeAccountHistoryApi,
  activeHERpc,
  setActiveRpc,
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
  setErrorMessage,
  setSuccessMessage,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const allRpc = RpcUtils.getFullList();
  let displayedRpcs = allRpc;
  // Hive RPC
  const [customRpcs, setCustomRpcs] = useState([] as Rpc[]);
  const [isAddRpcPanelDisplayed, setIsAddRpcPanelDisplayed] = useState(false);
  const [switchAuto, setSwitchAuto] = useState(true);
  const [addRpcNodeUri, setAddRpcNodeUri] = useState('');
  const [addRpcNodeChainId, setAddRpcNodeChainId] = useState('');
  const [addRpcNodeTestnet, setAddRpcNodeTestnet] = useState(false);
  const [setNewRpcAsActive, setSetNewRpcAsActive] = useState(false);

  // Hive Engine RPC
  const [hiveEngineRpcOptions, setHiveEngineRpcOptions] = useState<
    SelectOption[]
  >([]);
  const [newHERpc, setNewHERpc] = useState('');
  const [isNewHERpcPanelOpened, setIsNewHERpcPanelOpened] = useState(false);
  const [setNewHeRpcAsActive, setSetNewHeRpcAsActive] = useState(false);

  // Hive Engine account history
  const [accountHistoryApiOptions, setAccountHistoryApiOptions] = useState<
    SelectOption[]
  >([]);
  const [isNewAccountHistoryPanelOpened, setIsNewAccountHistoryPanelOpened] =
    useState(false);
  const [newAccountHistory, setNewAccountHistory] = useState('');
  const [setNewAccountHistoryAsActive, setSetNewAccountHistoryAsActive] =
    useState(false);

  const setRpcAsActive = (option: SelectOption) => {
    setHEActiveRpc(option.value);
  };
  const setAccountHistoryApiAsActive = (option: SelectOption) => {
    setHEActiveAccountHistoryApi(option.value);
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

  const [options, setOptions] = useState(
    allRpc.map((rpc) => {
      return {
        label: rpc.uri,
        value: rpc.uri,
        rpc: rpc,
      };
    }),
  );

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
        label: rpc.replace('http://', '').replace('https://', '').split('/')[0],
        value: rpc,
        isDefault: HiveEngineConfigUtils.isRpcDefault(rpc),
        setAsActive: setRpcAsActive,
        deleteElement: deleteRpc,
      };
    });
    setHiveEngineRpcOptions(rpcOpts);

    const customAccountHistoryApi =
      await HiveEngineConfigUtils.getCustomAccountHistoryApi();
    const accountHistoryApiFullList = ArrayUtils.mergeWithoutDuplicate(
      customAccountHistoryApi,
      DefaultAccountHistoryApis,
    );
    const accountHistoryApiOpts = accountHistoryApiFullList.map((api) => {
      return {
        panelType: 'account-history-api',
        label: api.replace('http://', '').replace('https://', '').split('/')[0],
        value: api,
        isDefault: HiveEngineConfigUtils.isAccountHistoryApiDefault(api),
        setAsActive: setAccountHistoryApiAsActive,
        deleteElement: deleteAccountHistoryApi,
      };
    });

    setAccountHistoryApiOptions(accountHistoryApiOpts);
  };

  useEffect(() => {
    displayedRpcs = [...allRpc, ...customRpcs];
    setOptions(
      displayedRpcs.map((rpc) => {
        return {
          label: rpc.uri,
          value: rpc.uri,
          rpc: rpc,
        };
      }),
    );
  }, [customRpcs]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_rpc_node',
      isBackButtonEnabled: true,
    });
    initCustomRpcList();
    initSwitchAuto();
  }, []);

  useEffect(() => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.SWITCH_RPC_AUTO,
      switchAuto,
    );
  }, [switchAuto]);

  const initSwitchAuto = async () => {
    setSwitchAuto(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.SWITCH_RPC_AUTO,
      ),
    );
  };

  const initCustomRpcList = async () => {
    setCustomRpcs(await RpcUtils.getCustomRpcs());
  };

  const handleItemClicked = (rpc: Rpc) => {
    setActiveRpc(rpc);
  };

  const deleteCustomRPC = (item: Rpc, event: BaseSyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const newRpcs = setCustomRpcs(RpcUtils.deleteCustomRpc(customRpcs, item));
    if (activeRpc?.uri === item.uri) {
      setActiveRpc(allRpc[0]);
    }

    return newRpcs;
  };

  const handleSaveNewRpcClicked = () => {
    if (
      !addRpcNodeUri.length ||
      (addRpcNodeTestnet && !addRpcNodeChainId.length)
    ) {
      setErrorMessage('popup_html_rpc_missing_fields');
      return;
    }
    if (!ValidUrl.isWebUri(addRpcNodeUri)) {
      setErrorMessage('html_popup_url_not_valid');
      return;
    }
    if (displayedRpcs.find((rpc) => rpc.uri === addRpcNodeUri)) {
      setErrorMessage('popup_html_rpc_uri_already_existing');
      return;
    }

    const newCustomRpc = {
      uri: addRpcNodeUri,
      testnet: addRpcNodeTestnet,
      chainId: addRpcNodeChainId.length ? addRpcNodeChainId : undefined,
    };
    setIsAddRpcPanelDisplayed(false);
    RpcUtils.addCustomRpc(newCustomRpc);
    setCustomRpcs([...customRpcs, newCustomRpc]);
    if (setNewRpcAsActive) {
      setSwitchAuto(false);
      setActiveRpc(newCustomRpc);
    }
  };

  const saveAccountHistory = async () => {
    if (accountHistoryApiOptions.find((e) => e.value === newAccountHistory)) {
      setErrorMessage('html_popup_rpc_already_exist');
      return;
    }
    if (ValidUrl.isWebUri(newAccountHistory)) {
      console.log(newAccountHistory);
      await HiveEngineConfigUtils.addCustomAccountHistoryApi(newAccountHistory);
      setNewAccountHistory('');
      setIsNewAccountHistoryPanelOpened(false);
      setSuccessMessage('html_popup_new_account_history_save_success');
      init();
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };

  const saveHiveEngineRpc = async () => {
    if (hiveEngineRpcOptions.find((e) => e.value === newHERpc)) {
      setErrorMessage('html_popup_rpc_already_exist');
      return;
    }
    if (ValidUrl.isWebUri(newHERpc)) {
      setSuccessMessage('html_popup_new_rpc_save_success');
      await HiveEngineConfigUtils.addCustomRpc(newHERpc);
      setNewHERpc('');
      setIsNewHERpcPanelOpened(false);
      init();
    } else {
      setErrorMessage('html_popup_url_not_valid');
    }
  };

  const customLabelRender = (selectProps: SelectRenderer<RpcListItem>) => {
    return (
      <div
        data-testid="selected-rpc-node-panel"
        className="selected-rpc-node-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <div data-testid="selected-rpc-node" className="selected-rpc-node">
          {activeRpc && activeRpc?.uri && activeRpc.uri}
          {activeRpc?.testnet && <div>- TESTNET</div>}
        </div>
      </div>
    );
  };
  const customItemRender = (selectProps: SelectItemRenderer<RpcListItem>) => {
    return (
      <div
        data-testid={`select-rpc-item-${selectProps.item.rpc.uri}`}
        className={`select-rpc-item ${
          activeRpc?.uri === selectProps.item.rpc.uri ? 'selected' : ''
        }`}
        onClick={() => {
          handleItemClicked(selectProps.item.rpc);
          selectProps.methods.dropDown('close');
        }}>
        <div className="rpc-name">
          {selectProps.item.label}{' '}
          {selectProps.item.rpc.testnet && <div>TESTNET</div>}
        </div>
        {!RpcUtils.isDefault(selectProps.item.rpc) && (
          <img
            data-testid="button-erase-custom-rpc"
            src="/assets/images/clear.png"
            className="erase-button"
            onClick={($event) => {
              deleteCustomRPC(selectProps.item.rpc, $event);
              selectProps.methods.dropDown('close');
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_RPC_NODES}-page`}
      className="rpc-nodes-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_rpc_node_text')}
      </div>

      <div className="rpc-form-container">
        <div className="rpc-section hive-rpc">
          <div className="title">Hive RPC</div>
          <CheckboxPanelComponent
            dataTestId="checkbox-rpc-nodes-automatic-mode"
            title="popup_html_rpc_automatic_mode"
            hint="popup_html_rpc_automatic_mode_hint"
            checked={switchAuto}
            onChange={setSwitchAuto}
          />
          {activeRpc && !switchAuto && options && (
            <div className="select-rpc-panel">
              <ComplexeCustomSelect
                options={options}
                selectedItem={
                  {
                    value: activeRpc.uri,
                    label: activeRpc.uri,
                    rpc: activeRpc,
                  } as RpcListItem
                }
                setSelectedItem={(item: RpcListItem) => setActiveRpc(item.rpc)}
                background="white"
                rightActionIcon={NewIcons.GLOBAL_DELETE}
                rightAction={deleteCustomRPC}
              />
              <div
                className={`round-button ${
                  isAddRpcPanelDisplayed ? 'close-button' : 'add-button'
                }`}
                onClick={() =>
                  setIsAddRpcPanelDisplayed(!isAddRpcPanelDisplayed)
                }>
                <SVGIcon icon={NewIcons.MENU_RPC_ADD_BUTTON} />
              </div>
            </div>
          )}
          {!switchAuto && isAddRpcPanelDisplayed && (
            <div className="add-rpc-panel">
              <div className="add-rpc-caption">
                <span>{chrome.i18n.getMessage('popup_html_add_rpc_text')}</span>
                <SVGIcon
                  icon={NewIcons.MENU_RPC_SAVE_BUTTON}
                  onClick={() => handleSaveNewRpcClicked()}
                />
              </div>
              <Separator type="horizontal" />
              <InputComponent
                dataTestId="input-rpc-node-uri"
                type={InputType.TEXT}
                value={addRpcNodeUri}
                onChange={setAddRpcNodeUri}
                placeholder={'popup_html_rpc_node'}
                onEnterPress={handleSaveNewRpcClicked}
              />
              <CheckboxComponent
                dataTestId="checkbox-add-rpc-test-node"
                title="TESTNET"
                checked={addRpcNodeTestnet}
                onChange={setAddRpcNodeTestnet}
                skipTranslation={true}></CheckboxComponent>
              {addRpcNodeTestnet && (
                <InputComponent
                  dataTestId="input-node-chain-id"
                  type={InputType.TEXT}
                  value={addRpcNodeChainId}
                  onChange={setAddRpcNodeChainId}
                  placeholder="Chain Id"
                  skipPlaceholderTranslation={true}
                  onEnterPress={handleSaveNewRpcClicked}
                />
              )}

              <CheckboxComponent
                dataTestId="checkbox-set-new-rpc-as-active"
                title="popup_html_set_new_rpc_as_active"
                checked={setNewRpcAsActive}
                onChange={setSetNewRpcAsActive}></CheckboxComponent>
            </div>
          )}
        </div>

        <div className="rpc-section hive-engine-rpc">
          <div className="title">Hive-Engine RPC</div>
          <div className="select-rpc-panel">
            <ComplexeCustomSelect
              options={hiveEngineRpcOptions}
              selectedItem={
                {
                  value: activeHERpc,
                  label: activeHERpc,
                } as SelectOption
              }
              setSelectedItem={(item: SelectOption) => {
                setHEActiveRpc(item.value);
              }}
              background="white"
            />
            <div
              className={`round-button ${
                isNewHERpcPanelOpened ? 'close-button' : 'add-button'
              }`}
              onClick={() => setIsNewHERpcPanelOpened(!isNewHERpcPanelOpened)}>
              <SVGIcon icon={NewIcons.MENU_RPC_ADD_BUTTON} />
            </div>
          </div>
          {isNewHERpcPanelOpened && (
            <div className="add-rpc-panel">
              <div className="add-rpc-caption">
                <span>{chrome.i18n.getMessage('popup_html_add_rpc_text')}</span>
                <SVGIcon
                  icon={NewIcons.MENU_RPC_SAVE_BUTTON}
                  onClick={() => saveHiveEngineRpc()}
                />
              </div>
              <Separator type="horizontal" />
              <InputComponent
                dataTestId="input-rpc-node-uri"
                type={InputType.TEXT}
                value={newHERpc}
                onChange={setNewHERpc}
                placeholder={'popup_html_rpc_node'}
                onEnterPress={handleSaveNewRpcClicked}
              />

              <CheckboxComponent
                dataTestId="checkbox-set-new-he-rpc-as-active"
                title="popup_html_set_new_rpc_as_active"
                checked={setNewHeRpcAsActive}
                onChange={setSetNewHeRpcAsActive}></CheckboxComponent>
            </div>
          )}
        </div>
        <div className="rpc-section hive-engine-account-history">
          <div className="title">Hive-Engine account history API</div>
          <div className="select-rpc-panel">
            <ComplexeCustomSelect
              options={accountHistoryApiOptions}
              selectedItem={
                {
                  value: activeAccountHistoryApi,
                  label: activeAccountHistoryApi,
                } as SelectOption
              }
              setSelectedItem={(item: SelectOption) => {
                setHEActiveAccountHistoryApi(item.value);
              }}
              background="white"
            />
            <div
              className={`round-button ${
                isNewAccountHistoryPanelOpened ? 'close-button' : 'add-button'
              }`}
              onClick={() =>
                setIsNewAccountHistoryPanelOpened(
                  !isNewAccountHistoryPanelOpened,
                )
              }>
              <SVGIcon icon={NewIcons.MENU_RPC_ADD_BUTTON} />
            </div>
          </div>
          {isNewAccountHistoryPanelOpened && (
            <div className="add-rpc-panel">
              <div className="add-rpc-caption">
                <span>{chrome.i18n.getMessage('popup_html_add_rpc_text')}</span>
                <SVGIcon
                  icon={NewIcons.MENU_RPC_SAVE_BUTTON}
                  onClick={() => saveAccountHistory()}
                />
              </div>
              <Separator type="horizontal" />
              <InputComponent
                dataTestId="input-rpc-node-uri"
                type={InputType.TEXT}
                value={newAccountHistory}
                onChange={setNewAccountHistory}
                placeholder={'html_popup_new_account_history'}
                onEnterPress={saveAccountHistory}
              />

              <CheckboxComponent
                dataTestId="checkbox-set-new-account-history-as-active"
                title="popup_html_set_new_rpc_as_active"
                checked={setNewAccountHistoryAsActive}
                onChange={setSetNewAccountHistoryAsActive}></CheckboxComponent>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeRpc: state.activeRpc,
    activeHERpc: state.hiveEngineConfig.rpc,
    activeAccountHistoryApi: state.hiveEngineConfig.accountHistoryApi,
  };
};

const connector = connect(mapStateToProps, {
  setActiveRpc,
  setHEActiveAccountHistoryApi,
  setHEActiveRpc,
  setErrorMessage,
  setTitleContainerProperties,
  setSuccessMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const RpcNodesComponent = connector(RpcNodes);
