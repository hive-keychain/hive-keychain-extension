export const PluginsWhitelist: Extension[] = [
  {
    extensionId: process.env.DEV_PLUGIN_ID!,
    name: 'Test Plugin',
    img: '',
    installed: false,
  },
];

export interface Extension {
  extensionId: string;
  name: string;
  img: string;
  installed: boolean;
}
