import { navigateTo } from '@popup/actions/navigation.actions';
import { SelectKeysComponent } from '@popup/pages/add-account/select-keys/select-keys.component';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Screen } from 'src/reference-data/screen.enum';
import { AddAccountMainComponent } from '../add-account-main/add-account-main.component';
import { AddByKeysComponent } from '../add-by-keys/add-by-keys.component';
import { ImportKeysComponent } from '../import-keys/import-keys.component';
import './add-account-router.component.css';

const AddAccountRouter = ({ currentPage, navigateTo }: PropsFromRedux) => {
  const renderAccountPage = (page: Screen) => {
    switch (page) {
      case Screen.ACCOUNT_PAGE_INIT_ACCOUNT:
        return <AddAccountMainComponent />;
      case Screen.ACCOUNT_PAGE_ADD_BY_KEYS:
        return (
          <AddByKeysComponent
            backEnabled={true}
            backPage={Screen.ACCOUNT_PAGE_INIT_ACCOUNT}
          />
        );
      case Screen.ACCOUNT_PAGE_IMPORT_KEYS:
        return <ImportKeysComponent />;
      case Screen.ACCOUNT_PAGE_SELECT_KEYS:
        return <SelectKeysComponent />;
    }
  };

  return (
    <div className="add-account-router-page">
      {renderAccountPage(currentPage!)}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentPage: state.navigation.currentPage,
    params: state.navigation.params,
  };
};

const connector = connect(mapStateToProps, { navigateTo });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountRouterComponent = connector(AddAccountRouter);
