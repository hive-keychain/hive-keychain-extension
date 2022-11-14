import LedgerHiveApp from '@engrave/ledger-app-hive';
import TransportWebUsb from '@ledgerhq/hw-transport-webusb';

const detect = async (): Promise<boolean> => {
  try {
    console.log(window.isSecureContext);
    if (await TransportWebUsb.isSupported()) {
      console.log('supported');
      console.log(navigator, (navigator as any).usb);
      const transport = await TransportWebUsb.create();
      console.log(transport);
      const hiveLedger = new LedgerHiveApp(transport);
      console.log(hiveLedger);
      const version = await hiveLedger.getAppVersion();
      console.log('Current version:', version);
      const name = await hiveLedger.getAppName();
      console.log('App name:', name);
      return true;
    } else {
      console.log('no supported');
      return false;
    }
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

export const LedgerUtils = { detect };
