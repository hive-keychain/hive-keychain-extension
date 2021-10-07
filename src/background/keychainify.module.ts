let isKeychainifyEnabled = false;

const saveKeychainify = (enabled: boolean) => {
  isKeychainifyEnabled = enabled;
};

const KeychainifyModule = {
  saveKeychainify,
};

export default KeychainifyModule;
