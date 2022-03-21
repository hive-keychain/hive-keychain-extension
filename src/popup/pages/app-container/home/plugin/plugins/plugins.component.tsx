import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Plugin } from '@popup/pages/app-container/home/plugin/plugin.interface';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './plugins.component.scss';

const Plugins = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_plugins',
      isBackButtonEnabled: true,
    });

    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setPlugins(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.PLUGINS,
      ),
    );
  };

  return <div className="plugins-page"></div>;
};

const mapStateToProps = (state: RootState) => {
  return { activeAccount: state.activeAccount, userTokens: state.userTokens };
};

const connector = connect(mapStateToProps, {
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const PluginsComponent = connector(Plugins);
