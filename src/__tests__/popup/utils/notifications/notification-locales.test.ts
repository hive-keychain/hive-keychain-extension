export {};

const notificationLinkKeys = [
  'notification_reblog',
  'notification_unreblog',
  'notification_mention',
  'notification_answer',
  'notification_author_reward',
  'notification_comment_reward',
  'notification_curation_reward',
  'notification_comment_benefactor_reward',
  'notification_vote',
];

const localeFiles = [
  require('public/_locales/de/messages.json'),
  require('public/_locales/en/messages.json'),
  require('public/_locales/es/messages.json'),
  require('public/_locales/fr/messages.json'),
  require('public/_locales/id/messages.json'),
  require('public/_locales/pt/messages.json'),
  require('public/_locales/zh-CN/messages.json'),
  require('public/_locales/zh-TW/messages.json'),
];

describe('notification locale messages', () => {
  it('uses a single {link} placeholder instead of embedded anchor HTML', () => {
    for (const localeFile of localeFiles) {
      for (const key of notificationLinkKeys) {
        const message = localeFile[key]?.message;
        if (!message) continue;

        expect(message).not.toContain('<a');
        expect(message).not.toContain('</a>');
        expect(message.match(/\{link\}/g)).toHaveLength(1);
      }
    }
  });
});
