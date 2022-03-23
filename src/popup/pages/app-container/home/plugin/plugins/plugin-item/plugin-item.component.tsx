import { Extension } from '@popup/pages/app-container/home/plugin/plugins.whitelist';
import React from 'react';
import './plugin-item.component.scss';

interface PluginItemProps {
  plugin: Extension;
  onClickHandler: (params?: any) => any;
}

export const PluginItem = ({ plugin, onClickHandler }: PluginItemProps) => {
  return (
    <div
      className="plugin-card"
      key={plugin.extensionId}
      onClick={() => onClickHandler(plugin)}>
      <img
        src={plugin.img}
        onError={(e: any) => {
          e.target.onError = null;
          e.target.src = '/assets/images/accounts.png';
        }}
      />
      <div className="name">{plugin.name}</div>
    </div>
  );
};
