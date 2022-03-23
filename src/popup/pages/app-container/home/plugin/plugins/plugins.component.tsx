import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import {
  Extension,
  PluginsWhitelist,
} from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import { PluginItem } from '@popup/pages/app-container/home/plugin/plugins/plugin-item/plugin-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import './plugins.component.scss';

const Plugins = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const allPlugins = PluginsWhitelist;
  const [plugins, setPlugins] = useState<Extension[]>([]);
  const [pluginsInfo, setPluginInfo] = useState<Extension[]>();

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
        'IS_INSTALLED',
        (response) => {
          fulfill(response === 'ACK_PLUGIN_INSTALL');
        },
      );
    });
  };

  const loadPlugins = async () => {
    for (const plugin of allPlugins) {
      plugin.installed = await checkPluginInstalled(plugin);
    }
    console.log(allPlugins);
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
    console.log('navigate to detail', plugin);
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
  return { activeAccount: state.activeAccount, userTokens: state.userTokens };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PluginsComponent = connector(Plugins);
