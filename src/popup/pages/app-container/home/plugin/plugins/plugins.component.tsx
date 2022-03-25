import { navigateToWithParams } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { PluginMessage } from '@popup/pages/app-container/home/plugin/plugin-message.enum';
import {
  Extension,
  PluginsWhitelist,
} from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import { PluginItem } from '@popup/pages/app-container/home/plugin/plugins/plugin-item/plugin-item.component';
import { RootState } from '@popup/store';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './plugins.component.scss';

const Plugins = ({
  setTitleContainerProperties,
  navigateToWithParams,
}: PropsFromRedux) => {
  const allPlugins = PluginsWhitelist;
  const [plugins, setPlugins] = useState<Extension[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_plugins',
      isBackButtonEnabled: true,
    });

    loadPlugins();
  }, []);

  const checkPluginInstalled = (plugin: Extension): Promise<boolean> => {
    return new Promise(async (fulfill) => {
      chrome.runtime.sendMessage(
        plugin.extensionId,
        PluginMessage.IS_INSTALLED,
        (response) => {
          fulfill(response === PluginMessage.ACK_PLUGIN_INSTALL);
        },
      );
    });
  };

  const loadPlugins = async () => {
    for (const plugin of allPlugins) {
      plugin.installed = await checkPluginInstalled(plugin);
    }
    setPlugins(allPlugins);
  };

  const goToChromeStore = (plugin: Extension) => {
    chrome.tabs.create({
      url: `https://chrome.google.com/webstore/detail/${plugin.name
        .toLowerCase()
        .split(' ')
        .join('-')}/${plugin.extensionId}`,
    });
  };

  const goToDetailPage = (plugin: Extension) => {
    navigateToWithParams(Screen.PLUGIN_DETAILS_PAGE, { plugin: plugin });
  };

  return (
    <div className="plugins-page">
      <div className="introduction">
        {chrome.i18n.getMessage('popup_html_plugin_introduction')}
      </div>
      <div className="plugins">
        <div className="available-plugins">
          <div className="section-title">
            {chrome.i18n.getMessage('popup_html_plugin_available')}
          </div>
          <div className="list">
            {allPlugins
              .filter((plugin) => plugin.installed)
              .map((plugin) => (
                <PluginItem
                  plugin={plugin}
                  onClickHandler={goToDetailPage}
                  key={plugin.extensionId}
                />
              ))}
          </div>
        </div>
        <div className="not-installed-plugins">
          <div className="section-title">
            {chrome.i18n.getMessage('popup_html_plugin_not_installed')}
          </div>
          <div className="list">
            {allPlugins
              .filter((plugin) => !plugin.installed)
              .map((plugin) => (
                <PluginItem
                  plugin={plugin}
                  onClickHandler={goToChromeStore}
                  key={plugin.extensionId}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
  navigateToWithParams,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PluginsComponent = connector(Plugins);
