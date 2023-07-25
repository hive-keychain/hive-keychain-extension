import ImportExportSubMenuItems from '@popup/pages/app-container/settings/advanced-settings/import-export-preferences/import-export-menu-items';
import { RootState } from '@popup/store';
import React from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { MenuComponent } from 'src/common-ui/menu/menu.component';
import './import-export.component.scss';

const ImportExport = ({}: PropsFromRedux) => {
  return (
    <div aria-label="import-export-page" className="import-export-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_import_export_caption'),
        }}></div>

      <MenuComponent
        title="popup_html_import_export"
        isBackButtonEnable={true}
        menuItems={ImportExportSubMenuItems}
      />

      {/* //TODO finish bellow adding both options + utils for that. */}
      {/* <MenuComponent
        title="popup_html_import_export_settings"
        isBackButtonEnable={true}
        menuItems={ImportExportSubMenuItems}></MenuComponent> */}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ImportExportComponent = connector(ImportExport);
