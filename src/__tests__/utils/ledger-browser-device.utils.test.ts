import { LedgerBrowserDeviceUtils } from 'src/utils/ledger-browser-device.utils';

describe('ledger browser device utils', () => {
  const usbDescriptor = Object.getOwnPropertyDescriptor(navigator, 'usb');

  afterEach(() => {
    if (usbDescriptor) {
      Object.defineProperty(navigator, 'usb', usbDescriptor);
    } else {
      delete (navigator as { usb?: unknown }).usb;
    }
    window.history.pushState({}, '', '/');
  });

  it('keeps authorized Ledger USB devices and drops other vendors', async () => {
    const ledger = { vendorId: 0x2c97 };
    const other = { vendorId: 0x1234 };
    Object.defineProperty(navigator, 'usb', {
      configurable: true,
      value: {
        getDevices: jest.fn().mockResolvedValue([other, ledger]),
      },
    });

    await expect(LedgerBrowserDeviceUtils.listPageUsbDevices()).resolves.toEqual(
      [ledger],
    );
  });

  it('requests a Ledger from the page USB API', async () => {
    const ledger = { vendorId: 0x2c97 };
    const requestDevice = jest.fn().mockResolvedValue(ledger);
    Object.defineProperty(navigator, 'usb', {
      configurable: true,
      value: { requestDevice },
    });

    await expect(LedgerBrowserDeviceUtils.requestPageUsbDevice()).resolves.toBe(
      ledger,
    );
    expect(requestDevice).toHaveBeenCalledWith({
      filters: [{ vendorId: 0x2c97 }],
    });
  });
});
