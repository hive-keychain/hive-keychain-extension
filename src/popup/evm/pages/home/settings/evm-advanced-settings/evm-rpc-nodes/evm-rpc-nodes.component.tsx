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
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import {
  EvmChain,
  MultichainRpc,
} from '@popup/multichain/interfaces/chains.interface';
import { RootState } from '@popup/multichain/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

const EMPTY_RPC: MultichainRpc = {
  isDefault: false,
  url: '',
};

const EvmRpcNodes = ({
  chain,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [switchAuto, setSwitchAuto] = useState(true);
  const [activeRpc, setActiveRpc] = useState<MultichainRpc>();

  const [rpcOptions, setRpcOptions] = useState<OptionItem[]>();

  const [newRpc, setNewRpc] = useState<MultichainRpc>(EMPTY_RPC);

  const [setNewRpcAsActive, setSetNewRpcAsActive] = useState(false);

  const [isAddRpcPanelDisplayed, setIsAddRpcPanelDisplayed] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_rpc_node',
      isBackButtonEnabled: true,
    });
    initPage();
  }, []);

  const initPage = async () => {
    const [rpc, rpcList, switchRpcAuto] = await Promise.all([
      EvmRpcUtils.getActiveRpc(chain),
      EvmRpcUtils.getRpcListForChain(chain),
      EvmRpcUtils.getSwitchRpcAuto(chain),
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
  };

  const selectRpc = async (rpc: MultichainRpc) => {
    setActiveRpc(rpc);
    await EvmRpcUtils.setActiveRpc(rpc, chain);
  };

  const addCustomRpc = async () => {
    await EvmRpcUtils.addCustomRpc(newRpc, chain);
    if (setNewRpcAsActive) {
      selectRpc(newRpc);
    }
    setNewRpc(EMPTY_RPC);
    setSetNewRpcAsActive(false);
    setIsAddRpcPanelDisplayed(false);
    initPage();
  };

  const deleteRpc = async (rpc: MultichainRpc) => {
    console.log('deleteRpc', rpc);
    await EvmRpcUtils.deleteCustomRpc(rpc, chain);
    initPage();
  };

  const toggleSwitchRpcAuto = async () => {
    setSwitchAuto(!switchAuto);
    await EvmRpcUtils.saveSwitchRpcAuto(chain, !switchAuto);
  };

  return (
    <div className="evm-rpc-nodes-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_rpc_node_text')}
      </div>

      <div className="rpc-form-container">
        <div className="rpc-section">
          <div className="title">{chain.name} RPC</div>
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
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmRpcNodesComponent = connector(EvmRpcNodes);
