import { KeychainRequest } from '@interfaces/keychain.interface';
import schemas, {
  commonRequestParams,
} from 'src/content-scripts/web-interface/input-validation';
import Logger from 'src/utils/logger.utils';

const setupInjection = () => {
  try {
    var scriptTag = document.createElement('script');
    scriptTag.src = chrome.runtime.getURL('./hive_keychain.js');
    var container = document.head || document.documentElement;
    container.insertBefore(scriptTag, container.children[0]);
  } catch (e) {
    Logger.error('Hive Keychain injection failed.', e);
  }
};

const validateRequest = (req: KeychainRequest) => {
  if (!req) return { value: req, error: 'Missing request.' };
  if (!req.type) return { value: req, error: 'Missing request type.' };

  return schemas[req.type].append(commonRequestParams).validate(req);
};

export const WebInterfaceUtils = {
  validateRequest,
  setupInjection,
};
