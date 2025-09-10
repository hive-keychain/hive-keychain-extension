import Joi, { PartialSchemaMap } from 'joi';
import { capitalize } from 'lodash';
import { FieldError } from 'react-hook-form';
import Logger from 'src/utils/logger.utils';

const FormValidationError: Record<string, string> = {
  ['string.empty']: 'validation_error_mandatory',
  ['number.base']: 'validation_error_mandatory',
  ['number.less']: 'validation_error_greater_than_value',
  ['number.max']: 'validation_error_less_or_equal_value',
  ['number.positive']: 'popup_html_need_positive_amount',
};

const parseJoiError = (error: FieldError) => {
  Logger.error('Error in form: ', error);
  if (error.type === 'number.min')
    return capitalize(error.message?.replace(/"/g, ''));
  let errMessage = chrome.i18n.getMessage(
    FormValidationError[error.type],
    error.ref?.value ? [error.ref.value] : [],
  );

  return errMessage;
};

const createRules = <T>(data: PartialSchemaMap<T>) => {
  return Joi.object<T>(data).unknown(true);
};

const setNestedValue = <T extends object>(
  obj: T,
  path: string,
  value: any,
): T => {
  const keys = path.split('.');
  const lastKey = keys.pop(); // Get the last key (the property to set)

  if (!lastKey) {
    return obj; // No valid path provided
  }

  let current: any = obj;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      // If a part of the path is not an object, create it or handle error
      current[key] = {};
    }
    current = current[key];
  }

  if (typeof current === 'object' && current !== null) {
    current[lastKey] = value;
  }
  console.log(obj);
  return obj;
};

export const FormUtils = { parseJoiError, createRules, setNestedValue };
