import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import WitnessUtils from 'src/utils/witness.utils';
import './proxy-suggestion.component.scss';

const ProxySuggestion = ({
  activeAccount,
  setSuccessMessage,
  setErrorMessage,
  isMessageContainerDisplayed,
}: PropsType) => {
  const [forceClosed, setForcedClosed] = useState(false);

  useEffect(() => {
    init();
  }, [activeAccount]);

  const init = async () => {
    if (activeAccount.name) {
      const hideSuggestionProxy =
        await LocalStorageUtils.getValueFromLocalStorage(
          LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY,
        );
      setForcedClosed(
        hideSuggestionProxy ? hideSuggestionProxy[activeAccount.name] : false,
      );
    }
  };

  const handleSetProxy = async () => {
    const success = await WitnessUtils.setAsProxy('keychain', activeAccount);
    if (success) {
      setSuccessMessage('popup_success_proxy');
      handleClose();
    } else {
      setErrorMessage('popup_error_proxy');
    }
  };

  const handleClose = async () => {
    let hideSuggestionProxy = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY,
    );
    if (!hideSuggestionProxy) {
      hideSuggestionProxy = {};
    }
    hideSuggestionProxy[activeAccount.name!] = true;
    setForcedClosed(true);
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.HIDE_SUGGESTION_PROXY,
      hideSuggestionProxy,
    );
  };
  return (
    <div
      className={`proxy-suggestion ${
        isMessageContainerDisplayed || forceClosed ? 'hide' : ''
      }`}>
      <div className="caption">
        {chrome.i18n.getMessage('popup_html_proxy_suggestion')}
      </div>
      <div className="button-panel">
        <ButtonComponent
          label="popup_html_close"
          onClick={handleClose}></ButtonComponent>
        <OperationButtonComponent
          requiredKey={KeychainKeyTypesLC.active}
          onClick={handleSetProxy}
          label={'html_popup_vote'}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    isMessageContainerDisplayed: state.errorMessage.key.length > 0,
  };
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  setErrorMessage,
});
type PropsType = ConnectedProps<typeof connector>;

export const ProxySuggestionComponent = connector(ProxySuggestion);
