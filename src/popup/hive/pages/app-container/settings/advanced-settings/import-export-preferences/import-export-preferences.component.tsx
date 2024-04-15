import { RootState } from '@popup/multichain/store';
import { Screen } from '@reference-data/screen.enum';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import ImportExportSubMenuItems from 'src/popup/hive/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-menu-items';

const ImportExportPreferences = ({}: PropsFromRedux) => {
  return (
    <div
      data-testid={`${Screen.SETTINGS_IMPORT_EXPORT}-page`}
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
