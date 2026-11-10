import { NotificationType } from '@interfaces/notifications.interface';
import { render } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import { NotificationPanel } from 'src/popup/hive/pages/app-container/home/notifications/notification-panel.component';
import { I18nUtils } from 'src/utils/i18n.utils';

describe('NotificationPanel', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('formats relative times in the active language instead of moment global locale', () => {
    moment.locale('zh-tw');
    jest.spyOn(I18nUtils, 'getCurrentLanguage').mockReturnValue('fr');
    jest.spyOn(I18nUtils, 'getMessage').mockImplementation((key: string) => key);
    jest.useFakeTimers().setSystemTime(new Date('2026-08-18T14:00:00.000Z'));

    const { container } = render(
      <NotificationPanel
        isPanelOpened
        hasMoreData={false}
        onMarkAllAsRead={jest.fn()}
        loadMore={jest.fn()}
        notifications={[
          {
            type: NotificationType.PEAKD,
            isTypeLast: true,
            id: '1',
            message: 'notification_vote',
            messageParams: [],
            createdAt: moment('2026-08-18T10:00:00.000Z'),
            read: true,
          },
        ]}
      />,
    );

    expect(container.querySelector('.date')?.textContent).toBe(
      'il y a 4 heures',
    );
  });
});
