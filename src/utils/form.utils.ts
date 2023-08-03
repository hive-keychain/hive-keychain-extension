import Joi, { PartialSchemaMap } from 'joi';
import { FieldError } from 'react-hook-form';

const FormValidationError: Record<string, string> = {
  ['string.empty']: 'validation_error_mandatory',
  ['number.base']: 'validation_error_mandatory',
  ['number.less']: 'validation_error_greater_than_value',
  ['number.max']: 'validation_error_less_or_equal_value',
  ['number.positive']: 'popup_html_need_positive_amount',
};

const parseJoiError = (error: FieldError) => {
  console.log(error);

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
