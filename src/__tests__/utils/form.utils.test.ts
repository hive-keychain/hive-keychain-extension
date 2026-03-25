import Joi from 'joi';
import { FieldError } from 'react-hook-form';
import Logger from 'src/utils/logger.utils';
import { FormUtils } from 'src/utils/form.utils';

describe('form.utils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseJoiError', () => {
    it('returns capitalized min message for number.min', () => {
      jest.spyOn(Logger, 'error').mockImplementation(() => {});
      const err = {
        type: 'number.min',
        message: '"amount" must be at least 0.001',
        ref: { name: 'amount' },
      } as FieldError;

      expect(FormUtils.parseJoiError(err)).toBe('Amount must be at least 0.001');
    });

    it('maps known Joi types to i18n messages', () => {
      jest.spyOn(chrome.i18n, 'getMessage').mockReturnValue('translated');
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      const err = {
        type: 'string.empty',
        ref: { name: 'x' },
      } as FieldError;

      expect(FormUtils.parseJoiError(err)).toBe('translated');
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith(
        'validation_error_mandatory',
        [],
      );
    });

    it('passes ref value into i18n when present', () => {
      jest.spyOn(chrome.i18n, 'getMessage').mockReturnValue('with ref');
      jest.spyOn(Logger, 'error').mockImplementation(() => {});

      const err = {
        type: 'number.max',
        ref: { name: 'amt', value: 100 },
      } as FieldError;

      FormUtils.parseJoiError(err);
      expect(chrome.i18n.getMessage).toHaveBeenCalledWith(
        'validation_error_less_or_equal_value',
        [100],
      );
    });
  });

  describe('createRules', () => {
    it('builds a Joi object that allows unknown keys', () => {
      const schema = FormUtils.createRules<{ a: string }>({
        a: Joi.string().required(),
      });
      const { error } = schema.validate(
        { a: 'ok', extra: 1 },
        { abortEarly: false },
      );
      expect(error).toBeUndefined();
    });
  });
});
