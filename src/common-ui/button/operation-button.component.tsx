import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent, {
  ButtonProps,
} from 'src/common-ui/button/button.component';
import { setErrorMessage } from 'src/popup/hive/actions/message.actions';
import { RootState } from 'src/popup/hive/store';

type Props = PropsFromRedux & ButtonProps & { requiredKey: KeychainKeyTypesLC };

const OperationButton = ({
  onClick,
  requiredKey,
  activeAccount,
  setErrorMessage,
  ...buttonProps
}: Props) => {
  const handleClick = () => {
    if (requiredKey && !activeAccount.keys[requiredKey]) {
      setErrorMessage('popup_missing_key', [requiredKey]);
    } else {
      onClick();
    }
  };

  return <ButtonComponent {...buttonProps} onClick={handleClick} />;
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, { setErrorMessage });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const OperationButtonComponent = connector(OperationButton);
