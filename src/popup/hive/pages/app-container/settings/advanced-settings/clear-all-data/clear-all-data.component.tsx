import { Screen } from '@interfaces/screen.interface';
import {
  goBack,
  navigateTo,
} from '@popup/multichain/actions/navigation.actions';
import { resetKeychain } from '@popup/multichain/actions/reset-keychain.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import React, { useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

import { HtmlUtils } from 'src/utils/html.utils';
const ClearAllData = ({
  setTitleContainerProperties,
  navigateTo,
  goBack,
  resetKeychain,
}: PropsFromRedux) => {
  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_clear',
      isBackButtonEnabled: true,
    });
  }, []);

  const reset = async () => {
    await resetKeychain();
    navigateTo(Screen.SIGN_UP_PAGE, true);
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_CLEAR_ALL_DATA}-page`}
      className="clear-all-data-page">
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: HtmlUtils.getSafeI18nHtml('popup_html_clear_all_data_desc'),
        }}></p>

      <div className="bottom-panel">
        <ButtonComponent
          dataTestId="dialog_cancel-button"
          label={'dialog_cancel'}
          onClick={goBack}
          type={ButtonType.ALTERNATIVE}></ButtonComponent>
        <ButtonComponent
          dataTestId="dialog_confirm-button"
          label={'popup_html_confirm'}
          onClick={() => reset()}
          type={ButtonType.IMPORTANT}></ButtonComponent>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateTo,
  goBack,
  resetKeychain,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ClearAllDataComponent = connector(ClearAllData);
