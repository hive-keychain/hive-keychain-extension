import ImportExportSubMenuItems from '@popup/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-menu-items';
import { RootState } from '@popup/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import './import-export-preferences.component.scss';

const ImportExportPreferences = ({}: PropsFromRedux) => {
  return (
    <div
      aria-label="import-export-preferences-page"
      className="import-export-preferences-page">
      <MenuComponent
        title="popup_html_import_export_settings"
        isBackButtonEnable={true}
        menuItems={ImportExportSubMenuItems}></MenuComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportExportPreferencesComponent = connector(
  ImportExportPreferences,
);
