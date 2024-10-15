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

export const FormUtils = { parseJoiError, createRules };
