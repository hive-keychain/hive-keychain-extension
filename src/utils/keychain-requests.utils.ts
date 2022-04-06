import { KeychainRequest } from '@interfaces/keychain.interface';
import schemas, { commonRequestParams } from 'src/utils/input-validation.utils';

const validateRequest = (req: KeychainRequest) => {
  if (!req) return { value: req, error: 'Missing request.' };
  if (!req.type) return { value: req, error: 'Missing request type.' };

  return schemas[req.type].append(commonRequestParams).validate(req);
};

export const KeychainRequestsUtils = {
  validateRequest,
};
