export const PluginsWhitelist: Extension[] = [
  {
    extensionId: 'aapbdbdomjkkjkaonfhkkikfgjllcleb',
    name: 'Google translate',
    img: '',
    installed: false,
  },
  {
    extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
    name: 'Metamask',
    img: '',
    installed: false,
  },
  {
    extensionId: 'eadampcieedklcmllfppabgaoegidbhp',
    name: 'Test Plugin',
    img: '',
    installed: false,
  },
  {
    extensionId: 'bhlhnicpbhignbdhedgjhgdocnmhomnp',
    name: 'ColorZilla',
    img: 'colorzilla.jpeg',
    installed: false,
  },
  {
    extensionId: 'eifflpmocdbdmepbjaopkkhbfmdgijcc',
    name: 'JSON Viewer Pro',
    img: '',
    installed: false,
  },
  {
    extensionId: 'ailoabdmgclmfmhdagmlohpjlbpffblp',
    name: 'Surfshark VPN Extension',
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
