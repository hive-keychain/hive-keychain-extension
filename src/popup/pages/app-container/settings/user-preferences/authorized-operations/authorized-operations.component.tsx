import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './authorized-operations.component.scss';

const AuthorizedOperations = ({}: PropsFromRedux) => {
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const noConfirm = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.NO_CONFIRM,
    );
    console.log(noConfirm);
  };

  return (
    <div className="authorized-operations-page">
      <PageTitleComponent
        title="popup_html_authorized_operations"
        isBackButtonEnabled={true}
      />

      <div
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_pref_info'),
        }}></div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AuthorizedOperationsComponent = connector(AuthorizedOperations);
