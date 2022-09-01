import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';

const cases = [
  { input: '1234567', msg: testsI18n.get('popup_password_regex') },
  { input: '12345678', msg: testsI18n.get('popup_password_regex') },
  { input: '12345678a', msg: testsI18n.get('popup_password_regex') },
  { input: '{space}', msg: testsI18n.get('popup_password_regex') },
];
export default { cases };
