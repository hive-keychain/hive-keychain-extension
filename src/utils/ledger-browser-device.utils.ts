const LEDGER_USB_VENDOR_ID = 0x2c97;

interface LedgerBrowserDevice {
  vendorId?: number;
}

interface LedgerDeviceRequest {
  filters: { vendorId: number }[];
}

interface LedgerUsb {
  getDevices: () => Promise<LedgerBrowserDevice[]>;
  requestDevice: (options: LedgerDeviceRequest) => Promise<LedgerBrowserDevice>;
}

interface LedgerHid {
  getDevices: () => Promise<LedgerBrowserDevice[]>;
  requestDevice: (options: LedgerDeviceRequest) => Promise<LedgerBrowserDevice[]>;
}

const getLedgerNavigator = () =>
  navigator as Navigator & {
    usb?: LedgerUsb;
    hid?: LedgerHid;
  };

const isLedgerVendorDevice = (device: LedgerBrowserDevice) =>
  device?.vendorId === LEDGER_USB_VENDOR_ID;

const listPageUsbDevices = async (): Promise<LedgerBrowserDevice[] | null> => {
  const usb = getLedgerNavigator().usb;
  if (!usb?.getDevices) {
    return null;
  }
  const devices = await usb.getDevices();
  return devices.filter(isLedgerVendorDevice);
};

const requestPageUsbDevice = () => {
  const usb = getLedgerNavigator().usb;
  if (!usb?.requestDevice) {
    return Promise.reject(new Error('html_ledger_not_supported'));
  }
  return usb.requestDevice({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }],
  });
};

const listPageHidDevices = async (): Promise<LedgerBrowserDevice[] | null> => {
  const hid = getLedgerNavigator().hid;
  if (!hid?.getDevices) {
    return null;
  }
  const devices = await hid.getDevices();
  return devices.filter(isLedgerVendorDevice);
};

const requestPageHidDevice = async () => {
  const hid = getLedgerNavigator().hid;
  if (!hid?.requestDevice) {
    return undefined;
  }
  const devices = await hid.requestDevice({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }],
  });
  return devices[0];
};

export const LedgerBrowserDeviceUtils = {
  LEDGER_USB_VENDOR_ID,
  listPageUsbDevices,
  requestPageUsbDevice,
  listPageHidDevices,
  requestPageHidDevice,
};
