import Joi from 'joi';
import { KeychainRequest } from '@interfaces/keychain.interface';
import schemas, {
  commonRequestParams,
} from 'src/content-scripts/hive/web-interface/input-validation';

type HiveRequestValidationResult =
  | { value: KeychainRequest; error?: undefined }
  | {
      value: KeychainRequest | undefined;
      error: string | Joi.ValidationError;
    };

export const validateHiveRequest = (
  request: unknown,
): HiveRequestValidationResult => {
  if (!request || typeof request !== 'object') {
    return { value: undefined, error: 'Missing request.' };
  }

  const keychainRequest = request as KeychainRequest;
  if (!keychainRequest.type) {
    return { value: keychainRequest, error: 'Missing request type.' };
  }

  const schema = schemas[keychainRequest.type as keyof typeof schemas];
  if (!schema) {
    return { value: keychainRequest, error: 'Unsupported request type.' };
  }

  try {
    const result = schema
      .append(commonRequestParams)
      .validate(keychainRequest) as Joi.ValidationResult<KeychainRequest>;
    return result.error
      ? { value: result.value, error: result.error }
      : { value: result.value };
  } catch {
    return { value: keychainRequest, error: 'Invalid request.' };
  }
};
