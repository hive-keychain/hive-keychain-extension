import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import './add-by-keys.component.css';
import { PageTitleComponent } from "src/common-ui/page-title/page-title.component";
import { Screen } from "src/reference-data/screen.enum";

const AddByKeys = ({}: PropsFromRedux) => {
  
    return (
      <div className="add-by-keys-page">
          <PageTitleComponent title="popup_html_setup" isBackButtonEnabled={true} backScreen={Screen.ACCOUNT_PAGE_INIT_ACCOUNT} />
          <div className="caption" dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage('popup_html_setup_text')}}></div>
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AddByKeysComponent = connector(AddByKeys);