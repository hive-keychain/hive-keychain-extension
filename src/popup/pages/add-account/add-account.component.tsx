import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import ButtonComponent from "src/common-ui/button/button.component";
import { PageTitleComponent } from "src/common-ui/page-title/page-title.component";
import './add-account.component.css';

const AddAccount = ({}: PropsFromRedux) => {

    const handleAddByKeys = ():void => {
      console.log('handleAddByKeys')
    }
    const handleAddByAuth = ():void => {
      console.log('handleAddByAuth')
    }
    const handleImportKeys = ():void => {
      console.log('handleImportKeys')
    }


    return (
      <div className="add-account-page">
          
          <PageTitleComponent title="popup_html_setup" isBackButtonEnabled={false} />
          <div className="caption" dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage("popup_html_chose_add_method")}}></div>

          <ButtonComponent label={"popup_html_add_by_keys"} onClick={handleAddByKeys} />
          <ButtonComponent label={"popup_html_add_by_auth"} onClick={handleAddByAuth} />
          <ButtonComponent label={"popup_html_import_keys"} onClick={handleImportKeys} />
  
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AddAccountComponent =  connector(AddAccount);