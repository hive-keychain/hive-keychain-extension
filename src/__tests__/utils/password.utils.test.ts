import { isPasswordValid } from 'src/utils/password.utils';

describe('password.utils tests;\n', () => {
  test('Checking a password with a length<8 must return false', () => {
    expect(isPasswordValid('1234')).toBe(false);
  });
  test('Checking a password with a length=8 containing only numbers will return null', () => {
    expect(isPasswordValid('11111111')).toBe(null);
    expect(isPasswordValid('12345678')).toBe(null);
  });
  test('Checking a password with a length>=8 containing numbers and letters(lowercase letters) will return null', () => {
    expect(isPasswordValid('a1s2d3f4g5h6')).toBe(null);
  });
  test('Checking a password with a length>=8 containing numbers and letters(lowercase & uppercase letters) will return RegExpMatchArray', () => {
    const expectedRegExpMatchArray = ['A1s2d3f4g5h6'];
    const result = isPasswordValid('A1s2d3f4g5h6');
    expect(JSON.stringify(result)).toEqual(
      JSON.stringify(expectedRegExpMatchArray),
    );
  });
  test('Checking a password with a length>=8 cointaining symbols must return null', () => {
    expect(isPasswordValid('!@#$%^&^@&!!')).toBe(null);
  });
  test('Checking a password with a length>=8 containing symbols, letters and numbers will return true', () => {
    expect(isPasswordValid('!@123A#a$bC%^&^@&!!')).toBe(true);
  });
});
