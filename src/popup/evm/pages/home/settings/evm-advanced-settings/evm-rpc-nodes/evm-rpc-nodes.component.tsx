import { CheckboxPanelComponent } from '@common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import CheckboxComponent from '@common-ui/checkbox/checkbox/checkbox.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from '@common-ui/custom-select/custom-select.component';
import { SVGIcons } from '@common-ui/icons.enum';
import { InputType } from '@common-ui/input/input-type.enum';
import InputComponent from '@common-ui/input/input.component';
import { Separator } from '@common-ui/separator/separator.component';
import { SVGIcon } from '@common-ui/svg-icon/svg-icon.component';
import { EvmRpcUtils } from '@popup/evm/utils/evm-rpc.utils';
import {
  setErrorMessage,
  setWarningMessage,
} from '@popup/multichain/actions/message.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  ChainType,
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import { ChainUtils } from '@popup/multichain/utils/chain.utils';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EMPTY_RPC: MultichainRpc = {
  isDefault: false,
  url: '',
};

const EvmRpcNodes = ({
  chain,
  setTitleContainerProperties,
  setErrorMessage,
  setWarningMessage,
}: PropsFromRedux) => {
  const [switchAuto, setSwitchAuto] = useState(true);
  const [activeRpc, setActiveRpc] = useState<MultichainRpc>();

  const [rpcOptions, setRpcOptions] = useState<OptionItem[]>();

  const [newRpc, setNewRpc] = useState<MultichainRpc>(EMPTY_RPC);

  const [setNewRpcAsActive, setSetNewRpcAsActive] = useState(false);

  const [isAddRpcPanelDisplayed, setIsAddRpcPanelDisplayed] = useState(false);

  const [selectedChain, setSelectedChain] = useState<EvmChain>(chain);
  const [chainOptions, setChainOptions] = useState<OptionItem[]>();

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_rpc_node',
      isBackButtonEnabled: true,
    });
  }, []);

  const initPage = async () => {
    const [rpc, rpcList, switchRpcAuto] = await Promise.all([
      EvmRpcUtils.getActiveRpc(selectedChain),
      EvmRpcUtils.getRpcListForChain(selectedChain),
      EvmRpcUtils.getSwitchRpcAuto(selectedChain),
    ]);

    setActiveRpc(rpc);

    const rpcOptions = rpcList.map((rpc) => {
      return {
        label: rpc.url,
        value: rpc,
        canDelete: !rpc.isDefault,
      } as OptionItem;
    });
    setRpcOptions(rpcOptions);
    setSwitchAuto(switchRpcAuto);

    setChainOptions(
      (
        (await ChainUtils.getAllSetupChainsForType(ChainType.EVM)) as EvmChain[]
      ).map((c) => {
        return { label: c.name, value: c, img: c.logo } as OptionItem;
      }),
    );
  };

  useEffect(() => {
    initPage();
  }, [selectedChain.chainId]);

  const selectRpc = async (rpc: MultichainRpc) => {
    setActiveRpc(rpc);
    await EvmRpcUtils.setActiveRpc(rpc, chain);
  };

  const addCustomRpc = async () => {
    // Before adding new rpc, check if it is already in the list
    const isRpcAlreadyInList = rpcOptions?.some(
      (option) => option.value.url === newRpc.url,
    );

    if (!newRpc.url) {
      return;
    }
    if (isRpcAlreadyInList) {
      setErrorMessage('evm_rpc_already_in_list');
      return;
    }

    if (!(await EvmRpcUtils.checkRpcStatus(newRpc.url))) {
      setWarningMessage('evm_add_rpc_not_working_warning', [], false, {
        onConfirm: async () => {
          await EvmRpcUtils.addCustomRpc(newRpc, selectedChain);
          if (setNewRpcAsActive) {
            await selectRpc(newRpc);
          }
          setNewRpc(EMPTY_RPC);
          setSetNewRpcAsActive(false);
          setIsAddRpcPanelDisplayed(false);
          initPage();
        },
        onCancel: () => {},
      });
      return;
    }
  };

  const deleteRpc = async (rpc: MultichainRpc) => {
    await EvmRpcUtils.deleteCustomRpc(rpc, selectedChain);
    initPage();
  };

  const toggleSwitchRpcAuto = async () => {
    setSwitchAuto(!switchAuto);
    await EvmRpcUtils.saveSwitchRpcAuto(selectedChain, !switchAuto);
  };

  return (
    <div className="evm-rpc-nodes-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_rpc_node_text')}
      </div>

      <div className="rpc-form-container">
        <div className="rpc-section">
          {chainOptions && selectedChain && (
            <ComplexeCustomSelect
              options={chainOptions}
              selectedItem={{
                label: selectedChain.name,
                value: selectedChain,
                img: selectedChain.logo,
              }}
              setSelectedItem={(item: OptionItem) =>
                setSelectedChain(item.value)
              }
              background="white"
            />
          )}

          <CheckboxPanelComponent
            title="popup_html_rpc_automatic_mode"
            hint="popup_html_rpc_automatic_mode_hint"
            checked={switchAuto}
            onChange={() => toggleSwitchRpcAuto()}
          />

          {activeRpc && !switchAuto && rpcOptions && (
            <div className="select-rpc-panel">
              <ComplexeCustomSelect
                options={rpcOptions}
                selectedItem={{
                  value: activeRpc,
                  label: activeRpc.url
                    .replace('http://', '')
                    .replace('https://', ''),
                  canDelete: false,
                }}
                setSelectedItem={(item: OptionItem) => selectRpc(item.value)}
                background="white"
                onDelete={(item: OptionItem) => deleteRpc(item.value)}
              />
              <div
                className={`round-button ${
                  isAddRpcPanelDisplayed ? 'close-button' : 'add-button'
                }`}
                onClick={() =>
                  setIsAddRpcPanelDisplayed(!isAddRpcPanelDisplayed)
                }>
                <SVGIcon icon={SVGIcons.MENU_RPC_ADD_BUTTON} />
              </div>
            </div>
          )}
          {!switchAuto && isAddRpcPanelDisplayed && (
            <div className="add-rpc-panel">
              <div className="add-rpc-caption">
                <span>{chrome.i18n.getMessage('popup_html_add_rpc_text')}</span>
                <SVGIcon
                  icon={SVGIcons.MENU_RPC_SAVE_BUTTON}
                  onClick={() => addCustomRpc()}
                />
              </div>
              <Separator type="horizontal" />
              <InputComponent
                dataTestId="input-rpc-node-uri"
                type={InputType.TEXT}
                value={newRpc.url}
                onChange={(value) => setNewRpc({ ...newRpc, url: value })}
                placeholder={'popup_html_rpc_node'}
                onEnterPress={addCustomRpc}
              />

              <CheckboxComponent
                dataTestId="checkbox-set-new-rpc-as-active"
                title="popup_html_set_new_rpc_as_active"
                checked={setNewRpcAsActive}
                onChange={setSetNewRpcAsActive}></CheckboxComponent>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    chain: state.chain as EvmChain,
  };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  setErrorMessage,
  setWarningMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmRpcNodesComponent = connector(EvmRpcNodes);
