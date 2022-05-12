import MkModule from '@background/mk.module';
import { LocalAccount } from '@interfaces/local-account.interface';
import CryptoJS from 'crypto-js';
import EncryptUtils from 'src/utils/encrypt.utils';
import Logger from 'src/utils/logger.utils';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';

afterEach(() => {
  jest.clearAllMocks();
});
describe('encrypt.utils tests:\n', () => {
  describe('encryptJson tests:\n', () => {
    test('Passing both parameters as empty, and password as empty must return a 152 length string', () => {
      const content = { list: '' };
      const result = EncryptUtils.encryptJson(content, '');
      expect(result).not.toBeUndefined();
      expect(result).not.toBeNull();
      expect(result.length).toBe(152);
    });
    test('Passing a valid LocalAccount obj and encryptPassword as "new key" must return a string and pass all conditions bellow', async () => {
      const showResult = false;
      const spyGetMk = jest
        .spyOn(MkModule, 'getMk')
        .mockResolvedValueOnce('new key');
      const mk = await MkModule.getMk();
      const newAccount: LocalAccount = {
        name: utilsT.userData.username,
        keys: {
          active: utilsT.userData.encryptKeys.active,
          posting: utilsT.userData.encryptKeys.posting,
        },
      };
      const content = { list: newAccount };
      const result = EncryptUtils.encryptJson(content, mk);
      if (showResult) {
        console.log(result);
      }
      expect(spyGetMk).toBeCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.length).toBe(364);
    });
  });

  describe('decryptToJson tests:\n', () => {
    test('Passing a valid encoded message, must equal expected obj and contain hash property', () => {
      const expectedDecodedObj = {
        list: {
          name: utilsT.userData.username,
          keys: {
            active: utilsT.userData.encryptKeys.active,
            posting: utilsT.userData.encryptKeys.posting,
          },
        },
        hash: '3449c9e5e332f1dbb81505cd739fbf3f',
      };
      const encodedMessage =
        'aa9e6eaac0b82ebf4fd00f37af5379c1d8c2741ab6e65421f10284eb133584a43Rnhqhy1RNtixb9DEJsI1VkdSaqKzz/jLpt7eVQc1AlQkkIOZ0RB+htmb8emgDn5pdS2oPcj4VaMTY4NVP38nx9kws0rSBBRId3oAj1Y753VdRj5/KZ4oHc2FBsUQ+4be23TOb2SsA9uc77P3fC9i50XT56GhWqjQYiczp6KW70xlZHt9mINDethi0AQIu2DU7TvAuydeoWoPeyVJD56x3v76SPEjeLYfRBUWehMVbrLXw1rQ86+4rnEyT3lWjRpOOc16TOFjVanOTHsNTk0cIE/qi5qh9+HpTlvU9QKLY8=';
      const passwordUsed = 'new key';
      const result = EncryptUtils.decryptToJson(encodedMessage, passwordUsed);
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      expect(result.hash).toBeDefined();
      expect(result).toEqual(expectedDecodedObj);
    });

    test('Passing an empty message and empty password must return null', () => {
      const encodedMessage = '';
      const passwordUsed = '';
      const result = EncryptUtils.decryptToJson(encodedMessage, passwordUsed);
      expect(result).toBeNull();
    });

    test('Passing an empty message and a password must return null', () => {
      const encodedMessage = '';
      const passwordUsed = 'new key';
      const result = EncryptUtils.decryptToJson(encodedMessage, passwordUsed);
      expect(result).toBeNull();
    });

    test('Passing a valid message and an empty password must return null', () => {
      const encodedMessage =
        'aa9e6eaac0b82ebf4fd00f37af5379c1d8c2741ab6e65421f10284eb133584a43Rnhqhy1RNtixb9DEJsI1VkdSaqKzz/jLpt7eVQc1AlQkkIOZ0RB+htmb8emgDn5pdS2oPcj4VaMTY4NVP38nx9kws0rSBBRId3oAj1Y753VdRj5/KZ4oHc2FBsUQ+4be23TOb2SsA9uc77P3fC9i50XT56GhWqjQYiczp6KW70xlZHt9mINDethi0AQIu2DU7TvAuydeoWoPeyVJD56x3v76SPEjeLYfRBUWehMVbrLXw1rQ86+4rnEyT3lWjRpOOc16TOFjVanOTHsNTk0cIE/qi5qh9+HpTlvU9QKLY8=';
      const passwordUsed = '';
      const result = EncryptUtils.decryptToJson(encodedMessage, passwordUsed);
      expect(result).toBeNull();
    });

    test('Passing a valid message and an invalid password must return null', () => {
      const encodedMessage =
        'aa9e6eaac0b82ebf4fd00f37af5379c1d8c2741ab6e65421f10284eb133584a43Rnhqhy1RNtixb9DEJsI1VkdSaqKzz/jLpt7eVQc1AlQkkIOZ0RB+htmb8emgDn5pdS2oPcj4VaMTY4NVP38nx9kws0rSBBRId3oAj1Y753VdRj5/KZ4oHc2FBsUQ+4be23TOb2SsA9uc77P3fC9i50XT56GhWqjQYiczp6KW70xlZHt9mINDethi0AQIu2DU7TvAuydeoWoPeyVJD56x3v76SPEjeLYfRBUWehMVbrLXw1rQ86+4rnEyT3lWjRpOOc16TOFjVanOTHsNTk0cIE/qi5qh9+HpTlvU9QKLY8=';
      const passwordUsed = 'new keys';
      const result = EncryptUtils.decryptToJson(encodedMessage, passwordUsed);
      expect(result).toBeNull();
    });

    test('Passing an invalid encoded JSON and a password must Log an error and return null', () => {
      const errorMessage = 'Error while decrypting';
      const badjJson =
        'f651e1ca737f9885189f22508bf9b869b077abe4f377f2733187c99861ca5bd1+WqfVLferccfU4qIl4voGsdcVFTL/9/pCYBMlHvhXU0=';
      const passwordUsed = '12345678';
      const spyLogger = jest.spyOn(Logger, 'error');
      const result = EncryptUtils.decryptToJson(badjJson, passwordUsed);
      expect(result).toBeNull();
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith(
        errorMessage,
        new SyntaxError('Unexpected token } in JSON at position 19'),
      );
    });
  });

  describe('decryptToJsonWithoutMD5Check tests:\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Passing an empty message and an empty password must throw error as SyntaxError', () => {
      const showError = false;
      const spyLogger = jest.spyOn(Logger, 'error');
      const errorMessage = 'Error while decrypting';
      const encodedMessage = '';
      const passwordUsed = '';
      try {
        EncryptUtils.decryptToJsonWithoutMD5Check(encodedMessage, passwordUsed);
      } catch (error) {
        expect(spyLogger).toBeCalledTimes(1);
        expect(spyLogger).toBeCalledWith(
          errorMessage,
          new SyntaxError('Unexpected end of JSON input'),
        );
        if (showError) {
          console.log(error);
        }
      }
    });

    test('Passing an empty message and a password must throw error as SyntaxError', () => {
      const showError = false;
      const spyLogger = jest.spyOn(Logger, 'error');
      const errorMessage = 'Error while decrypting';
      const encodedMessage = '';
      const passwordUsed = 'new key';
      try {
        EncryptUtils.decryptToJsonWithoutMD5Check(encodedMessage, passwordUsed);
      } catch (error) {
        expect(spyLogger).toBeCalledTimes(1);
        expect(spyLogger).toBeCalledWith(
          errorMessage,
          new SyntaxError('Unexpected end of JSON input'),
        );
        if (showError) {
          console.log(error);
        }
      }
    });

    test('Passing a valid enconded JSON and a password must return the expected JSON object', () => {
      const encodedMessage =
        '8474478f4676151091dc999f6a29ff94b750da86dc64f30e5d3f4c2f0748d9edBJh91QxBAO/4g1avx1cdXVnuxoAWto2u04KMf5OHjoyxrANZsYodheKdDh6G2zLoSKXGJaDimBT379jv6vWh7Brg1jaKLrOB/rwmK7bSE2VFv1Qdq6tzAq5pXwWbs7Bw';
      const passwordUsed = 'new key';
      const content = {
        list: {
          name: 'theghost1980',
          age: 100,
        },
      };
      const result = EncryptUtils.decryptToJsonWithoutMD5Check(
        encodedMessage,
        passwordUsed,
      );
      expect(result.list).toEqual(content.list);
      expect(result.hash).toBeDefined();
    });

    test('Passing an invalid enconded JSON(without hash property) and a password must return null', () => {
      const encodedMessageNohash =
        '954f487f879b7e847dd374825e6b15a150c7f4c77dc0646188d89d757a6bb0bagCmc00j0czkBe86wm587tLAhu0mPRYe0yN1P8I49RA9/Ua62NJUytBCUV4ob1g2e';
      const passwordUsed = 'new key';
      const result = EncryptUtils.decryptToJsonWithoutMD5Check(
        encodedMessageNohash,
        passwordUsed,
      );
      expect(result).toBeNull();
    });
  });

  describe('encrypt tests:\n', () => {
    test('Passing a string and a password must return a 108 length string', () => {
      const showResult = true;
      const content = 'Test String to Encrypt!';
      const passwordUsed = '12345678';
      const result = EncryptUtils.encrypt(content, passwordUsed);
      expect(result.length).toBe(108);
      if (showResult) {
        console.log(result);
      }
    });

    test('Passing empty content and password must return a 88 length string', () => {
      const content = '';
      const passwordUsed = '';
      const result = EncryptUtils.encrypt(content, passwordUsed);
      expect(result.length).toBe(88);
    });

    test('Passing empty content and a password must return a 88 length string', () => {
      const content = '';
      const passwordUsed = 'new key';
      const result = EncryptUtils.encrypt(content, passwordUsed);
      expect(result.length).toBe(88);
    });
  });

  describe('decrypt tests:\n', () => {
    test('Passing a valid encrypted message and a password must return especific string', () => {
      const expectedString = 'Test String to Encrypt!';
      const encodedMessage =
        '52638257972a7749c8a62295525a3d03d2a6fbd15252f96c4c4abeb745ca29e8JZmzuRr/VwIdjEp969OQiTQdgrYm5r15iY3jkwugKXw=';
      const passwordUsed = '12345678';
      const result = EncryptUtils.decrypt(encodedMessage, passwordUsed);
      expect(result.toString(CryptoJS.enc.Utf8)).toBe(expectedString);
    });

    test('Passing a valid encrypted message and a wrong password must return ""', () => {
      const encodedMessage =
        '52638257972a7749c8a62295525a3d03d2a6fbd15252f96c4c4abeb745ca29e8JZmzuRr/VwIdjEp969OQiTQdgrYm5r15iY3jkwugKXw=';
      const passwordUsed = '123456';
      const result = EncryptUtils.decrypt(encodedMessage, passwordUsed);
      expect(result.toString(CryptoJS.enc.Utf8)).toBe('');
    });

    test('Passing a valid encrypted message and an empty password must return an object as described bellow', () => {
      const expectedObj = {
        sigBytes: -199,
        words: [
          80706647, -1861783499, 1585771160, -2083535540, -1868632093,
          1811537193, 1162119157, 1506142183,
        ],
      };
      const encodedMessage =
        '52638257972a7749c8a62295525a3d03d2a6fbd15252f96c4c4abeb745ca29e8JZmzuRr/VwIdjEp969OQiTQdgrYm5r15iY3jkwugKXw=';
      const passwordUsed = '';
      const result = EncryptUtils.decrypt(encodedMessage, passwordUsed);
      expect(result).toEqual(expectedObj);
    });

    test('Passing an empty message and a password must return expectedObj', () => {
      const expectedObj = { sigBytes: 0, words: [] };
      const encodedMessage = '';
      const passwordUsed = '';
      const result = EncryptUtils.decrypt(encodedMessage, passwordUsed);
      expect(result).toEqual(expectedObj);
    });
  });
});
