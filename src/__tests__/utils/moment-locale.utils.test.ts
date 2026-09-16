import moment from 'moment';
import { MomentLocaleUtils } from 'src/utils/moment-locale.utils';

describe('MomentLocaleUtils', () => {
  afterEach(() => {
    jest.useRealTimers();
    MomentLocaleUtils.syncMomentLocale('en');
  });

  it('maps app languages to moment locales', () => {
    expect(MomentLocaleUtils.getMomentLocale('fr')).toBe('fr');
    expect(MomentLocaleUtils.getMomentLocale('zh-CN')).toBe('zh-cn');
    expect(MomentLocaleUtils.getMomentLocale('zh-TW')).toBe('zh-tw');
    expect(MomentLocaleUtils.getMomentLocale('sv')).toBe('en');
    expect(MomentLocaleUtils.getMomentLocale()).toBe('en');
  });

  it('formats relative dates in the requested language even if moment is globally Chinese', () => {
    moment.locale('zh-tw');
    jest.useFakeTimers().setSystemTime(new Date('2026-08-18T14:00:00.000Z'));

    expect(
      MomentLocaleUtils.formatFromNow('2026-08-18T10:00:00.000Z', 'fr'),
    ).toBe('il y a 4 heures');
    expect(
      MomentLocaleUtils.formatFromNow('2026-08-18T10:00:00.000Z', 'zh-TW'),
    ).toBe('4 小時前');
  });

  it('syncs the global moment locale to the app language', () => {
    expect(MomentLocaleUtils.syncMomentLocale('fr')).toBe('fr');
    expect(moment.locale()).toBe('fr');

    expect(MomentLocaleUtils.syncMomentLocale('zh-CN')).toBe('zh-cn');
    expect(moment.locale()).toBe('zh-cn');
  });
});
