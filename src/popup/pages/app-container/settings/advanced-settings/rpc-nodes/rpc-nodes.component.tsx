import { setActiveRpc } from '@popup/actions/active-rpc.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { Rpc } from 'src/interfaces/rpc.interface';
import RpcUtils from 'src/utils/rpc.utils';
import './rpc-nodes.component.scss';

interface RpcListItem {
  label: string;
  value: string;
  rpc: Rpc;
}

const RpcNodes = ({ activeRpc, setActiveRpc }: PropsFromRedux) => {
  const allRpc = RpcUtils.getFullList();
  let displayedRpcs = allRpc;
  const [customRpcs, setCustomRpcs] = useState([] as Rpc[]);

  const [isAddRpcPanelDisplayed, setIsAddRpcPanelDisplayed] = useState(false);
  const [addRpcNodeUri, setAddRpcNodeUri] = useState('');
  const [addRpcNodeChainId, setAddRpcNodeChainId] = useState('');
  const [addRpcNodeTestnet, setAddRpcNodeTestnet] = useState(false);

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
    initCustomRpcList();
  }, []);

  const initCustomRpcList = async () => {
    setCustomRpcs(await RpcUtils.getCustomRpcs());
  };

  const handleItemClicked = (rpc: Rpc) => {
    setActiveRpc(rpc);
  };

  const handleSaveNewRpcClicked = () => {
    setIsAddRpcPanelDisplayed(false);
    RpcUtils.addCustomRpc({ uri: addRpcNodeUri, testnet: addRpcNodeTestnet });
    setCustomRpcs([
      ...customRpcs,
      {
        uri: addRpcNodeUri,
        testnet: addRpcNodeTestnet,
        chainId: addRpcNodeChainId.length ? addRpcNodeChainId : undefined,
      },
    ]);
  };

  const customLabelRender = (selectProps: SelectRenderer<RpcListItem>) => {
    return (
      <div
        className="selected-rpc-node-panel"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        <div className="selected-rpc-node">
          {activeRpc && activeRpc?.uri && activeRpc.uri}
          {activeRpc?.testnet && <div>- TESTNET</div>}
        </div>
      </div>
    );
  };
  const customItemRender = (selectProps: SelectItemRenderer<RpcListItem>) => {
    return (
      <div
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
      </div>
    );
  };

  return (
    <div className="rpc-nodes-page">
      <PageTitleComponent
        title="popup_html_rpc_node"
        isBackButtonEnabled={true}
      />

      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_rpc_node_text'),
        }}></p>

      {activeRpc && options && (
        <div className="select-account-section">
          <Select
            values={[]}
            options={options}
            onChange={() => undefined}
            contentRenderer={customLabelRender}
            itemRenderer={customItemRender}
            className="select-rpc-node-select"
          />
        </div>
      )}

      {!isAddRpcPanelDisplayed && (
        <ButtonComponent
          label={'popup_html_add_rpc'}
          onClick={() => setIsAddRpcPanelDisplayed(true)}
        />
      )}

      {isAddRpcPanelDisplayed && (
        <div className="add-rpc-panel">
          <p>{chrome.i18n.getMessage('popup_html_add_rpc_text')}</p>
          <InputComponent
            type={InputType.TEXT}
            value={addRpcNodeUri}
            onChange={setAddRpcNodeUri}
            placeholder={'popup_html_rpc_node'}
            onEnterPress={handleSaveNewRpcClicked}
          />
          <CheckboxComponent
            title="TESTNET"
            checked={addRpcNodeTestnet}
            onChange={setAddRpcNodeTestnet}
            skipTranslation={true}
          />
          <InputComponent
            type={InputType.TEXT}
            value={addRpcNodeChainId}
            onChange={setAddRpcNodeChainId}
            placeholder="Chain Id"
            skipTranslation={true}
            onEnterPress={handleSaveNewRpcClicked}
          />

          <ButtonComponent
            label={'popup_html_save'}
            onClick={() => handleSaveNewRpcClicked()}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeRpc: state.activeRpc };
};

const connector = connect(mapStateToProps, { setActiveRpc });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const RpcNodesComponent = connector(RpcNodes);
