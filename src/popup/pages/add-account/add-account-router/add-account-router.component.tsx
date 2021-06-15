import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import './add-account-router.component.css';
import { AddAccountMainComponent } from "../add-account-main/add-account-main.component";
import { Screen } from "src/reference-data/screen.enum";
import { AddByKeysComponent } from "../add-by-keys/add-by-keys.component";
import { AddByAuthComponent } from "../add-by-auth/add-by-auth.component";
import { ImportKeysComponent } from "../import-keys/import-keys.component";

const AddAccountRouter = ({currentPage}: PropsFromRedux) => {

  const renderAccountPage = (page: Screen) => {
    switch(page){
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountMainComponent />
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS: 
        return <AddByKeysComponent />
      case Screen.ACCOUNT_PAGE_ADD_BY_AUTH: 
        return <AddByAuthComponent />
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS: 
        return <ImportKeysComponent />
    }

  }


    return (
      <div className="add-account-router-page">
          {renderAccountPage(currentPage)}
      </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    console.log(state);
    return {
      currentPage: state.navigation.currentPage,
    };
  };
  
  const connector = connect(mapStateToProps, { });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const AddAccountRouterComponent =  connector(AddAccountRouter);