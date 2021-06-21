import {RootState} from '@popup/store';
import React, {useState} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import {PageTitleComponent} from 'src/common-ui/page-title/page-title.component';
import {Screen} from 'src/reference-data/screen.enum';
import './select-keys.component.css';

const SelectKeys = ({}: PropsFromRedux) => {
  const [importActive, setImportActive] = useState(true);
  const [importPosting, setImportPosting] = useState(true);
  const [importMemo, setImportMemo] = useState(true);

  const importKeys = (): void => {};

  return (
    <div className="select-keys-page">
      <PageTitleComponent
        title="popup_html_import_keys"
        isBackButtonEnabled={true}
        backScreen={Screen.ACCOUNT_PAGE_ADD_BY_KEYS}
      />
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_import_success'),
        }}></div>

      <CheckboxComponent
        title="popup_html_active"
        info="popup_html_active_info"
        checked={importActive}
        onChange={setImportActive}
      />
      <CheckboxComponent
        title="popup_html_posting"
        info="popup_html_posting_info"
        checked={importPosting}
        onChange={setImportPosting}
      />
      <CheckboxComponent
        title="popup_html_memo"
        info="popup_html_memo_info"
        checked={importMemo}
        onChange={setImportMemo}
      />
      <ButtonComponent label="popup_html_save" onClick={() => importKeys()} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SelectKeysComponent = connector(SelectKeys);
