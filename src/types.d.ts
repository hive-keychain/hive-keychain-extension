declare module 'sscjs';
declare module '@hiveio/hive-js';
declare module 'valid-url';
declare module '@hiveio/hive-js/lib/auth/memo';
declare module '@hiveio/hive-js/lib/auth';
interface Window {
  dataLayer: Array<any>;
  gtag: (a: string, b: any, c?: any) => void;
}

declare module '*.svg' {
  import React = require('react');

  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
