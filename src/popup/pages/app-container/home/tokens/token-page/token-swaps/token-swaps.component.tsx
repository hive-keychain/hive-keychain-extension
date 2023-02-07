import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import './token-swaps.component.scss';

const TokenSwaps = ({}: PropsFromRedux) => {
  const [slipperage, setSlipperage] = useState(5);

  const processSwap = () => {};

  return (
    <div className="token-swaps" aria-label="token-swaps">
      <div className="start-token"></div>
      <div className="end-token"></div>
      <InputComponent
        type={InputType.NUMBER}
        min={5}
        step={1}
        value={slipperage}
        onChange={setSlipperage}
        label="html_popup_swaps_slipperage"
        placeholder="html_popup_swaps_slipperage"
      />
      <OperationButtonComponent
        ariaLabel="operation-ok-button"
        requiredKey={KeychainKeyTypesLC.active}
        onClick={processSwap}
        label={'html_popup_ok'}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);
