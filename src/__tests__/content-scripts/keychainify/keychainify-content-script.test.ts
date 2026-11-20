import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';

const mockKeychainifyUrl = jest.fn();
const mockIsKeychainifyEnabled = jest.fn(() => Promise.resolve(false));

jest.mock('src/content-scripts/hive/keychainify/keychainify', () => ({
  __esModule: true,
  default: {
    isKeychainifyEnabled: () => mockIsKeychainifyEnabled(),
    isSupportedHiveUri: (uri: string) => uri.startsWith('hive://'),
    isSupportedHiveSignerUrl: (url: string) =>
      url.includes('hivesigner.com/sign/transfer'),
    keychainifyUrl: (href: string) => mockKeychainifyUrl(href),
  },
}));

type StorageChange = { newValue?: unknown };
type StorageListener = (
  changes: Record<string, StorageChange>,
  areaName: string,
) => void;

const click = (element: Element) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  const reachedAnchor = jest.fn();
  element.closest('a')?.addEventListener('click', reachedAnchor);
  element.dispatchEvent(event);
  return { event, reachedAnchor };
};

const setKeychainifyEnabled = (
  listener: StorageListener,
  enabled: boolean,
) => {
  listener(
    {
      [LocalStorageKeyEnum.KEYCHAINIFY_ENABLED]: { newValue: enabled },
    },
    'local',
  );
};

describe('keychainify content script:\n', () => {
  let onStorageChanged: StorageListener;

  beforeAll(async () => {
    const addListener = jest.fn();
    chrome.storage.onChanged = {
      addListener,
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    } as typeof chrome.storage.onChanged;
    require('src/content-scripts/hive/keychainify/index');
    expect(addListener).toHaveBeenCalledTimes(1);
    onStorageChanged = addListener.mock.calls[0][0];
    await Promise.resolve();
  });

  beforeEach(() => {
    mockKeychainifyUrl.mockClear();
    document.body.innerHTML = '';
    setKeychainifyEnabled(onStorageChanged, false);
  });

  it('intercepts a hive:// link without marking the anchor when keychainify is off', () => {
    document.body.innerHTML =
      '<a id="link" href="hive://sign/op/transfer">send</a>';
    const anchor = document.getElementById('link') as HTMLAnchorElement;
    const { event, reachedAnchor } = click(anchor);

    expect(event.defaultPrevented).toBe(true);
    expect(reachedAnchor).not.toHaveBeenCalled();
    expect(mockKeychainifyUrl).toHaveBeenCalledWith(anchor.href);
    expect(anchor.classList.contains('keychainify-checked')).toBe(false);
  });

  it('ignores a HiveSigner link while disabled and intercepts it after the setting turns on', () => {
    document.body.innerHTML =
      '<a id="link" href="https://hivesigner.com/sign/transfer?to=bob&amount=1%20HIVE">send</a>';
    const anchor = document.getElementById('link') as HTMLAnchorElement;

    const ignored = click(anchor);
    expect(ignored.event.defaultPrevented).toBe(false);
    expect(ignored.reachedAnchor).toHaveBeenCalled();
    expect(mockKeychainifyUrl).not.toHaveBeenCalled();

    setKeychainifyEnabled(onStorageChanged, true);
    mockKeychainifyUrl.mockClear();

    const intercepted = click(anchor);
    expect(intercepted.event.defaultPrevented).toBe(true);
    expect(intercepted.reachedAnchor).not.toHaveBeenCalled();
    expect(mockKeychainifyUrl).toHaveBeenCalledWith(anchor.href);
    expect(anchor.classList.contains('keychainify-checked')).toBe(false);
  });

  it('leaves a normal link unmarked and lets the click through', () => {
    document.body.innerHTML = '<a id="link" href="https://example.com">home</a>';
    const anchor = document.getElementById('link') as HTMLAnchorElement;
    const { event, reachedAnchor } = click(anchor);

    expect(event.defaultPrevented).toBe(false);
    expect(reachedAnchor).toHaveBeenCalled();
    expect(mockKeychainifyUrl).not.toHaveBeenCalled();
    expect(anchor.classList.contains('keychainify-checked')).toBe(false);
  });

  it('intercepts a click on a child of a supported link', () => {
    document.body.innerHTML =
      '<a id="link" href="hive://sign/op/transfer"><span id="label">send</span></a>';
    const label = document.getElementById('label') as HTMLSpanElement;
    const anchor = document.getElementById('link') as HTMLAnchorElement;
    const { event, reachedAnchor } = click(label);

    expect(event.defaultPrevented).toBe(true);
    expect(reachedAnchor).not.toHaveBeenCalled();
    expect(mockKeychainifyUrl).toHaveBeenCalledWith(anchor.href);
  });
});
