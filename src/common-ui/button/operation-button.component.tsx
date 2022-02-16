import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { setErrorMessage } from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonProps,
} from 'src/common-ui/button/button.component';

type Props = PropsFromRedux & ButtonProps & { requiredKey: KeychainKeyTypesLC };

const OperationButton = ({
  onClick,
  requiredKey,
  activeAccount,
  setErrorMessage,
  ...buttonProps
}: Props) => {
  return (
    <ButtonComponent
      {...buttonProps}
      onClick={() => {
        if (requiredKey && !activeAccount.keys[requiredKey]) {
          setErrorMessage('popup_missing_key', [requiredKey]);
        } else {
          onClick();
        }
      }}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setErrorMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const OperationButtonComponent = connector(OperationButton);
